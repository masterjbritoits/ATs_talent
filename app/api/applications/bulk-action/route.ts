import { NextRequest, NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export interface BulkActionPayload {
  action: "review" | "advance" | "reject" | "hold";
  candidateIds: string[];
  jobId?: string;
  notes?: string;
}

const MAX_BULK_CANDIDATES = 100;

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Missing required header: idempotency-key" },
        { status: 400 }
      );
    }

    const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";

    const body = (await request.json()) as BulkActionPayload;
    const { action, candidateIds, jobId, notes } = body;
    const uniqueCandidateIds = [...new Set(candidateIds ?? [])];

    if (!action || uniqueCandidateIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: action, candidateIds" },
        { status: 400 }
      );
    }

    if (uniqueCandidateIds.length > MAX_BULK_CANDIDATES) {
      return NextResponse.json(
        {
          error: `Bulk actions are limited to ${MAX_BULK_CANDIDATES} candidates per request.`
        },
        { status: 400 }
      );
    }

    const idempotencyRecordKey = `bulk_action:${idempotencyKey}`;
    const existing = await prisma.systemSetting.findUnique({
      where: { key: idempotencyRecordKey }
    });
    if (existing && !dryRun) {
      return NextResponse.json(existing.valueJson);
    }

    const statusMap: Record<string, string> = {
      review: "MANUAL_REVIEW",
      advance: "SHORTLISTED",
      reject: "REJECTED",
      hold: "NEW"
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json(
        { error: `Invalid action: ${action}` },
        { status: 400 }
      );
    }

    const whereClause = {
      candidateId: { in: uniqueCandidateIds },
      ...(jobId ? { jobId } : {})
    };

    const applicationsMatched = await prisma.application.count({ where: whereClause });
    const candidatesMatched = await prisma.candidate.count({
      where: { id: { in: uniqueCandidateIds } }
    });

    if (dryRun) {
      return NextResponse.json(
        {
          dryRun: true,
          action,
          candidatesRequested: uniqueCandidateIds.length,
          candidatesMatched,
          applicationsMatched,
          targetStatus: newStatus
        },
        { status: 200 }
      );
    }

    const actionName = `BULK_${action.toUpperCase()}`;
    const [appUpdateResult, candidateUpdateResult] = await prisma.$transaction([
      prisma.application.updateMany({
        where: whereClause,
        data: { status: newStatus as any }
      }),
      prisma.candidate.updateMany({
        where: { id: { in: uniqueCandidateIds } },
        data: { status: newStatus as any }
      }),
      prisma.auditLog.createMany({
        data: uniqueCandidateIds.map((candidateId) => ({
          actorUserId: userId,
          entityType: "CANDIDATE",
          entityId: candidateId,
          action: actionName,
          metadataJson: {
            status: newStatus,
            notes: notes ?? null,
            jobId: jobId ?? null,
            idempotencyKey,
            timestamp: new Date().toISOString()
          }
        }))
      })
    ]);

    const responsePayload = {
      success: true,
      action,
      candidatesRequested: uniqueCandidateIds.length,
      candidatesUpdated: candidateUpdateResult.count,
      applicationsUpdated: appUpdateResult.count,
      status: newStatus,
      timestamp: new Date().toISOString(),
      idempotencyKey
    };

    await prisma.systemSetting.upsert({
      where: { key: idempotencyRecordKey },
      create: {
        key: idempotencyRecordKey,
        valueJson: responsePayload
      },
      update: {
        valueJson: responsePayload
      }
    });

    return NextResponse.json(
      responsePayload,
      { status: 200 }
    );
  } catch (error) {
    console.error("[bulk-action] Error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk action", details: String(error) },
      { status: 500 }
    );
  }
}
