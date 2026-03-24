import { NextResponse } from "next/server";

import { ensureStorageDirs } from "@/lib/utils/storage";
import { runMailboxSync } from "@/server/services/inbox-sync/service";

export async function POST() {
  await ensureStorageDirs();
  const result = await runMailboxSync();
  return NextResponse.json(result);
}
