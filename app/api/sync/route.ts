import { NextResponse } from "next/server";

import { ensureStorageDirs } from "@/lib/utils/storage";
import { enqueueMailboxSync } from "@/lib/queue/service-bus";
import { runMailboxSync } from "@/server/services/inbox-sync/service";

export async function POST() {
  await ensureStorageDirs();

  // In production the sync is processed asynchronously via Service Bus +
  // Azure Functions worker. Fall back to synchronous processing when Service
  // Bus is not configured (local dev / simple deployments).
  const enqueued = await enqueueMailboxSync({ triggeredBy: "manual" });

  if (enqueued) {
    return NextResponse.json(
      { status: "queued", message: "Mailbox sync has been queued for async processing." },
      { status: 202 }
    );
  }

  // Synchronous fallback
  const result = await runMailboxSync();
  return NextResponse.json(result);
}

