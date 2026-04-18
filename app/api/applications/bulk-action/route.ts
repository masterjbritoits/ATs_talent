import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { CandidateRepository } from "@/server/repositories/candidate-repository";

export interface BulkActionPayload {
  action: "review" | "advance" | "reject" | "hold";
  candidateIds: string[];
  jobId?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkActionPayload;

    const { action, candidateIds, jobId, notes } = body;

    if (!action || !candidateIds || candidateIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: action, candidateIds" },
        { status: 400 }
      );
    }

    const repo = new CandidateRepository();

    // Map action to status
    const statusMap: Record<string, string> = {
      review: "MANUAL_REVIEW",
      advance: "SHORTLISTED",
      reject: "REJECTED",
      hold: "NEW"
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json(
        { error: \Invalid action: \\ },
        { status: 400 }
      );
    }

    // Update for each candidate
    let updatedCount = 0;
    for (const candidateId of candidateIds) {
      const result = await repo.updateApplicationStatus(candidateId, jobId ?? null, newStatus);
      updatedCount += result.count;
      
      // Update candidate status as well to stay in sync
      await repo.bulkUpdateStatus([candidateId], newStatus);

      // If notes provided, add audit log
      if (notes) {
        await prisma.auditLog.create({
          data: {
            entityType: \"CANDIDATE\",
            entityId: candidateId,
            action: \BULK_\\,
            metadataJson: {
              status: newStatus,
              notes,
              jobId,
              timestamp: new Date().toISOString()
            }
          }
        }).catch(() => {
          // Audit log creation is non-critical
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        action,
        candidatesProcessed: candidateIds.length,
        applicationsUpdated: updatedCount,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(\"[bulk-action] Error:\", error);
    return NextResponse.json(
      { error: \"Failed to process bulk action\", details: String(error) },
      { status: 500 }
    );
  }
}
