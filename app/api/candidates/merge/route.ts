import { NextRequest, NextResponse } from "next/server";

import { mergeDuplicateCandidates } from "@/server/services/duplicate-detection/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const merged = await mergeDuplicateCandidates(body.primaryCandidateId, body.duplicateCandidateId);
  return NextResponse.json(merged);
}
