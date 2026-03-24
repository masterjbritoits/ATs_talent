import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export class CandidateRepository {
  list(where: Prisma.CandidateWhereInput = {}) {
    return prisma.candidate.findMany({
      where,
      include: {
        applications: { include: { job: true } },
        attachments: true,
        emails: true,
        notes: { include: { author: true } },
        interviews: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  getById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: { include: { job: true } },
        attachments: true,
        emails: true,
        notes: { include: { author: true } },
        interviews: true
      }
    });
  }
}
