import { Prisma, CandidateStatus, ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface CandidateFilterOptions {
  status?: string;
  jobId?: string;
  minScore?: number;
  beforeDate?: Date;
  afterDate?: Date;
  search?: string;
}

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

  async listFiltered(options: CandidateFilterOptions) {
    const where: Prisma.CandidateWhereInput = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search } },
        { primaryEmail: { contains: options.search } },
        { currentTitle: { contains: options.search } }
      ];
    }

    if (options.jobId || options.minScore !== undefined) {
      where.applications = {
        some: {
          ...(options.jobId && { jobId: options.jobId }),
          ...(options.minScore !== undefined && {
            score: {
              gte: options.minScore
            }
          })
        }
      };
    }

    if (options.beforeDate || options.afterDate) {
      where.createdAt = {
        ...(options.afterDate && { gte: options.afterDate }),
        ...(options.beforeDate && { lte: options.beforeDate })
      };
    }

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

  async updateApplicationStatus(candidateId: string, jobId: string | null, status: string) {
    return prisma.application.updateMany({
      where: {
        candidateId,
        ...(jobId && { jobId })
      },
      data: { status: status as ApplicationStatus }
    });
  }

  async bulkUpdateStatus(candidateIds: string[], status: string) {
    return prisma.candidate.updateMany({
      where: { id: { in: candidateIds } },
      data: { status: status as CandidateStatus }
    });
  }
}

