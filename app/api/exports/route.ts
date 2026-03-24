import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { exportCandidatesToExcel } from "@/lib/exports/excel";

export async function POST() {
  const candidates = await prisma.candidate.findMany({
    include: { applications: { include: { job: true } }, attachments: true, emails: true }
  });
  const path = await exportCandidatesToExcel(candidates as any, `candidates-${Date.now()}.xlsx`);
  return NextResponse.json({ path });
}
