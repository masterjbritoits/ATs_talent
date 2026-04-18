import { BriefcaseBusiness, Calendar, Inbox, Mail, Star, UsersRound } from "lucide-react";
import Link from "next/link";

import { ApplicationsTrendChart, RoleDistributionChart } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils/date";

export default async function DashboardPage() {
  const { metrics, latestCandidates, latestJobs, importRuns } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="New Applications"
          value={metrics.statusCounts.NEW ?? 0}
          helper="awaiting triage"
          icon={<Inbox />}
        />
        <MetricCard
          title="Manual Review"
          value={metrics.statusCounts.MANUAL_REVIEW ?? 0}
          helper={metrics.pendingEmailActions > 0 ? `${metrics.pendingEmailActions} pending email actions` : undefined}
          icon={<Mail />}
        />
        <MetricCard
          title="Shortlisted"
          value={metrics.statusCounts.SHORTLISTED ?? 0}
          helper="ready to advance"
          icon={<UsersRound />}
        />
        <MetricCard
          title="Open Jobs"
          value={metrics.openJobsCount}
          helper={`${metrics.upcomingInterviews} interviews upcoming`}
          icon={<BriefcaseBusiness />}
        />
      </section>

      {/* Secondary KPI strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-2.5">
            <Star className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Interviews upcoming</p>
            <p className="text-2xl font-semibold">{metrics.upcomingInterviews}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-500/10 p-2.5">
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Possible duplicates</p>
            <p className="text-2xl font-semibold">{metrics.duplicateCandidates}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-sky-500/10 p-2.5">
            <UsersRound className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Hired (all time)</p>
            <p className="text-2xl font-semibold">{metrics.statusCounts.HIRED ?? 0}</p>
          </div>
        </Card>
      </section>

      {/* Charts */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ApplicationsTrendChart data={metrics.byDay} />
        <RoleDistributionChart data={metrics.byRole} />
      </section>

      {/* Tables */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Applications</h3>
            <Link href="/candidates" className="text-xs text-sky-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {latestCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{candidate.fullName}</p>
                  <p className="truncate text-xs text-muted">
                    {candidate.applications[0]?.job?.title ?? "Spontaneous"}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">
                    {candidate.overallScore ?? "–"}
                  </span>
                  <Badge tone={candidate.status === "SHORTLISTED" ? "success" : candidate.status === "REJECTED" ? "danger" : "info"}>
                    {candidate.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Import & Sync Activity</h3>
          </div>
          <div className="mt-4 space-y-3">
            {importRuns.map((run) => (
              <div key={run.id} className="rounded-xl border border-white/8 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{run.type}</p>
                  <Badge tone={run.status === "SUCCESS" ? "success" : run.status === "FAILED" ? "danger" : "warning"}>
                    {run.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {run.source} · {formatDate(run.createdAt, "dd MMM yyyy HH:mm")}
                </p>
              </div>
            ))}
            {importRuns.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No sync runs yet</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
