import { prisma } from "@/lib/db/prisma";
import { detectDuplicates } from "@/lib/matching/duplicates";
import { suggestAlternativeJobs } from "@/lib/matching/talent-pool";
import { getDashboardMetrics } from "@/server/services/reporting/service";

export async function getDashboardData() {
  const [metrics, latestCandidates, latestJobs, importRuns, settings] = await Promise.all([
    getDashboardMetrics(),
    prisma.candidate.findMany({
      include: { applications: { include: { job: true } } },
      take: 6,
      orderBy: { createdAt: "desc" }
    }),
    prisma.job.findMany({
      include: { applications: true },
      take: 6,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.importRun.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.systemSetting.findMany()
  ]);

  return { metrics, latestCandidates, latestJobs, importRuns, settings };
}

export async function getCandidatesData(searchParams?: Record<string, string | string[] | undefined>) {
  const where: any = {};
  if (searchParams?.status && typeof searchParams.status === "string") {
    where.status = searchParams.status;
  }
  if (searchParams?.talentPool === "true") {
    where.isInTalentPool = true;
  }
  if (searchParams?.q && typeof searchParams.q === "string") {
    where.OR = [
      { fullName: { contains: searchParams.q } },
      { primaryEmail: { contains: searchParams.q } },
      { currentTitle: { contains: searchParams.q } }
    ];
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      applications: { include: { job: true } },
      attachments: true,
      emails: true,
      notes: { include: { author: true } },
      interviews: true
    },
    orderBy: [{ overallScore: "desc" }, { updatedAt: "desc" }]
  });

  return {
    candidates,
    duplicates: detectDuplicates(candidates)
  };
}

export async function getCandidateDetail(id: string) {
  const [candidate, jobs, templates] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: { include: { job: true } },
        attachments: true,
        emails: true,
        notes: { include: { author: true } },
        interviews: true
      }
    }),
    prisma.job.findMany({ where: { status: "OPEN" } }),
    prisma.emailTemplate.findMany({ where: { isActive: true } })
  ]);

  if (!candidate) {
    return null;
  }

  return {
    candidate,
    alternativeRoles: suggestAlternativeJobs(candidate, jobs),
    templates
  };
}

export async function getJobsData() {
  return prisma.job.findMany({
    include: {
      applications: { include: { candidate: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getJobDetail(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: { candidate: true },
        orderBy: [{ rankingPosition: "asc" }, { score: "desc" }]
      }
    }
  });
}
