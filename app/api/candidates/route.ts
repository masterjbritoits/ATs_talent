import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q");
  const candidates = await prisma.candidate.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search } },
            { primaryEmail: { contains: search } },
            { currentTitle: { contains: search } }
          ]
        }
      : undefined,
    include: { applications: { include: { job: true } } },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json(candidates);
}
