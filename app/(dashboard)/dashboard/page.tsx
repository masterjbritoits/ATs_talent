import { BriefcaseBusiness, Inbox, Mail, UsersRound } from "lucide-react";

import { ApplicationsTrendChart, RoleDistributionChart } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils/date";

export default async function DashboardPage() {
  const { metrics, latestCandidates, latestJobs, importRuns } = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="New Applications" value={metrics.statusCounts.NEW ?? 0} icon={<Inbox />} />
        <MetricCard title="Manual Review" value={metrics.statusCounts.MANUAL_REVIEW ?? 0} icon={<Mail />} />
        <MetricCard title="Shortlisted" value={metrics.statusCounts.SHORTLISTED ?? 0} icon={<UsersRound />} />
        <MetricCard title="Open Jobs" value={latestJobs.length} icon={<BriefcaseBusiness />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ApplicationsTrendChart data={metrics.byDay} />
        <RoleDistributionChart data={metrics.byRole} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="text-lg font-semibold">Latest Applications</h3>
          <div className="mt-4 space-y-4">
            {latestCandidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold">{candidate.fullName}</p>
                  <p className="text-sm text-muted">
                    {candidate.applications[0]?.job?.title ?? "Spontaneous"} · {candidate.status}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{candidate.overallScore ?? "N/A"}</p>
                  <p className="text-muted">{formatDate(candidate.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Import & Sync Activity</h3>
          <div className="mt-4 space-y-4">
            {importRuns.map((run) => (
              <div key={run.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold">{run.type}</p>
                <p className="text-sm text-muted">
                  {run.source} · {run.status} · {formatDate(run.createdAt, "dd MMM yyyy HH:mm")}
                </p>
                <pre className="mt-3 overflow-x-auto text-xs text-muted">
                  {JSON.stringify(run.summaryJson, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
