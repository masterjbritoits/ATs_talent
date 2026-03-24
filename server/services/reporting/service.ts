import { subDays } from "date-fns";

import { prisma } from "@/lib/db/prisma";
import { DashboardMetrics } from "@/lib/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [candidates, applications, interviews] = await Promise.all([
    prisma.candidate.findMany(),
    prisma.application.findMany({ include: { job: true } }),
    prisma.interviewEvent.findMany({ where: { startsAt: { gte: new Date() } } })
  ]);

  const statusCounts = candidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.status] = (acc[candidate.status] ?? 0) + 1;
    return acc;
  }, {});

  const byRoleMap = new Map<string, number>();
  applications.forEach((application) => {
    const key = application.job?.title ?? "Spontaneous";
    byRoleMap.set(key, (byRoleMap.get(key) ?? 0) + 1);
  });

  const byDay = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(new Date(), 6 - index);
    const dayKey = day.toISOString().slice(0, 10);
    return {
      day: dayKey,
      count: applications.filter((application) => application.appliedAt.toISOString().slice(0, 10) === dayKey).length
    };
  });

  const sourceMap = new Map<string, number>();
  applications.forEach((application) => {
    sourceMap.set(application.source, (sourceMap.get(application.source) ?? 0) + 1);
  });

  return {
    statusCounts,
    byRole: Array.from(byRoleMap.entries()).map(([role, count]) => ({ role, count })),
    byDay,
    sourceDistribution: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
    pendingEmailActions: candidates.filter((candidate) => candidate.status === "MANUAL_REVIEW").length,
    duplicateCandidates: candidates.filter((candidate) => candidate.duplicateGroupKey).length,
    upcomingInterviews: interviews.length
  };
}
