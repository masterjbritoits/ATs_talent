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

  const PAGE_SIZE = 50;
  const page = Math.max(1, parseInt((searchParams?.page as string) ?? "1", 10));

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
      { fullName: { contains: searchParams.q } },
      { primaryEmail: { contains: searchParams.q } },
      { currentTitle: { contains: searchParams.q } }
    ];
  }

  // Job filter (via applications)
  if (searchParams?.jobId && typeof searchParams.jobId === "string") {
    where.applications = {
      some: { jobId: searchParams.jobId }
    };
  }

  // Min score filter
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

  const [candidates, total] = await prisma.$transaction([
    prisma.candidate.findMany({
      where,
      include: {
        applications: { include: { job: true } },
        attachments: true,
        emails: true,
        notes: { include: { author: true } },
        interviews: true
      },
      orderBy: [{ overallScore: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.candidate.count({ where })
  ]);

  return {
    candidates,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
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

export async function getJobPipelineData(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      applications: {
        include: {
          candidate: {
            include: { attachments: true, interviews: true }
          }
        },
        orderBy: [{ rankingPosition: "asc" }, { score: "desc" }]
      }
    }
  });

  if (!job) return null;

  const stageOrder: string[] = ["NEW", "REVIEW", "ADVANCED", "INTERVIEW_SCHEDULED", "TALENT_POOL", "REJECTED"];

  const stages = stageOrder.map((stage) => ({
    stage,
    applications: job.applications.filter((a) => a.status === stage)
  }));

  const stats = {
    total: job.applications.length,
    advanced: job.applications.filter((a) => a.status === "ADVANCED" || a.status === "INTERVIEW_SCHEDULED").length,
    avgScore:
      job.applications.length > 0
        ? Math.round(job.applications.reduce((sum, a) => sum + (a.score ?? 0), 0) / job.applications.length)
        : 0,
    topScore: job.applications.reduce((max, a) => Math.max(max, a.score ?? 0), 0)
  };

  return { job, stages, stats };
}
