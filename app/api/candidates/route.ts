import { NextRequest, NextResponse } from "next/server";

import { CandidateRepository } from "@/server/repositories/candidate-repository";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("q");
  const status = searchParams.get("status");
  const jobId = searchParams.get("jobId");
  const minScore = searchParams.get("minScore");
  const beforeDate = searchParams.get("beforeDate");
  const afterDate = searchParams.get("afterDate");

  const repo = new CandidateRepository();

  const candidates = await repo.listFiltered({
    search: search ?? undefined,
    status: status ?? undefined,
    jobId: jobId ?? undefined,
    minScore: minScore ? parseInt(minScore, 10) : undefined,
    beforeDate: beforeDate ? new Date(beforeDate) : undefined,
    afterDate: afterDate ? new Date(afterDate) : undefined
  });

  return NextResponse.json(candidates);
}
