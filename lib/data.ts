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

  // Status filter
  if (searchParams?.status && typeof searchParams.status === "string") {
    where.status = searchParams.status;
  }

  // Talent pool filter
  if (searchParams?.talentPool === "true") {
    where.isInTalentPool = true;
  }

  // Search filter (name, email, title)
  if (searchParams?.q && typeof searchParams.q === "string") {
    where.OR = [
      { fullName: { contains: searchParams.q, mode: "insensitive" } },
      { primaryEmail: { contains: searchParams.q, mode: "insensitive" } },
      { currentTitle: { contains: searchParams.q, mode: "insensitive" } }
    ];
  }

  // Job filter (via applications)
  if (searchParams?.jobId && typeof searchParams.jobId === "string") {
    where.applications = {
      some: { jobId: searchParams.jobId }
    };
  }

  // Min score filter (via applications)
  if (searchParams?.minScore && typeof searchParams.minScore === "string") {
    const minScore = parseInt(searchParams.minScore, 10);
    if (!isNaN(minScore)) {
      where.overallScore = { gte: minScore };
    }
  }

  // Date range filters
  const dateWhere: any = {};
  if (searchParams?.afterDate && typeof searchParams.afterDate === "string") {
    dateWhere.gte = new Date(searchParams.afterDate);
  }
  if (searchParams?.beforeDate && typeof searchParams.beforeDate === "string") {
    dateWhere.lte = new Date(searchParams.beforeDate);
  }
  if (Object.keys(dateWhere).length > 0) {
    where.createdAt = dateWhere;
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
