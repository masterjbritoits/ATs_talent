import { subDays } from "date-fns";

import { prisma } from "@/lib/db/prisma";
import { DashboardMetrics } from "@/lib/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const [
    candidateStatusGroups,
    applicationsByRole,
    applicationsByDay,
    applicationsBySource,
    pendingEmailActions,
    duplicateCandidates,
    upcomingInterviews,
    openJobsCount
  ] = await Promise.all([
    prisma.candidate.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.application.groupBy({ by: ["jobId"], _count: { _all: true } }),
    prisma.application.findMany({
      where: { appliedAt: { gte: sevenDaysAgo } },
      select: { appliedAt: true }
    }),
    prisma.application.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.candidate.count({ where: { status: "MANUAL_REVIEW" } }),
    prisma.candidate.count({ where: { duplicateGroupKey: { not: null } } }),
    prisma.interviewEvent.count({ where: { startsAt: { gte: now } } }),
    prisma.job.count({ where: { status: "OPEN" } })
  ]);

  // Build status counts map
  const statusCounts = candidateStatusGroups.reduce<Record<string, number>>((acc, g) => {
    acc[g.status] = g._count._all;
    return acc;
  }, {});

  // Fetch job titles for byRole (only for jobs that have applications)
  const jobIds = applicationsByRole.map((r) => r.jobId).filter(Boolean) as string[];
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: { id: true, title: true }
  });
  const jobTitleMap = new Map(jobs.map((j) => [j.id, j.title]));

  const byRole = applicationsByRole.map((r) => ({
    role: (r.jobId && jobTitleMap.get(r.jobId)) ?? "Spontaneous",
    count: r._count._all
  }));

  // Build by-day histogram
  const byDay = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(now, 6 - index);
    const dayKey = day.toISOString().slice(0, 10);
    return {
      day: dayKey,
      count: applicationsByDay.filter((a) => a.appliedAt.toISOString().slice(0, 10) === dayKey).length
    };
  });

  const sourceDistribution = applicationsBySource.map((r) => ({
    source: r.source,
    count: r._count._all
  }));

  return {
    statusCounts,
    byRole,
    byDay,
    sourceDistribution,
    pendingEmailActions,
    duplicateCandidates,
    upcomingInterviews,
    openJobsCount
  };
}
