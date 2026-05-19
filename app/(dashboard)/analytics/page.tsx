import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants/pipeline";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireUser();

  // Stage counts
  const stageCounts = await prisma.application.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const stageMap = Object.fromEntries(stageCounts.map((s) => [s.status, s._count._all]));

  const funnelData = PIPELINE_STAGES
    .filter((s) => !s.terminal)
    .map((s) => ({
      stage: STAGE_LABELS[s.value]?.pt ?? s.value,
      value: s.value,
      count: stageMap[s.value] ?? 0,
    }));

  // Source distribution
  const sourceCounts = await prisma.application.groupBy({
    by: ["source"],
    _count: { _all: true },
    orderBy: { _count: { source: "desc" } },
  });

  // Time-to-hire (avg days from NEW to AWARDED)
  const awardedApps = await prisma.application.findMany({
    where: { status: "AWARDED" },
    select: { appliedAt: true, updatedAt: true },
  });

  const avgDaysToHire =
    awardedApps.length > 0
      ? Math.round(
          awardedApps.reduce(
            (sum, a) =>
              sum +
              (a.updatedAt.getTime() - a.appliedAt.getTime()) / (1000 * 60 * 60 * 24),
            0
          ) / awardedApps.length
        )
      : null;

  // Active jobs
  const openJobs = await prisma.job.count({ where: { status: "OPEN" } });
  const totalApplications = await prisma.application.count();
  const talentPool = await prisma.candidate.count({ where: { isInTalentPool: true } });

  // Conversion rates
  const conversionRates = PIPELINE_STAGES
    .filter((s) => !s.terminal)
    .map((s, i, arr) => {
      const current = stageMap[s.value] ?? 0;
      const prev = i > 0 ? (stageMap[arr[i - 1].value] ?? 0) : current;
      return {
        from: i > 0 ? (STAGE_LABELS[arr[i - 1].value]?.pt ?? arr[i - 1].value) : "—",
        to: STAGE_LABELS[s.value]?.pt ?? s.value,
        rate: prev > 0 ? Math.round((current / prev) * 100) : null,
        count: current,
      };
    })
    .filter((_, i) => i > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Conversion rates, source quality, and time-to-hire metrics.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Open vacancies", value: openJobs },
          { label: "Total applications", value: totalApplications },
          { label: "Talent pool", value: talentPool },
          { label: "Avg. days to hire", value: avgDaysToHire != null ? `${avgDaysToHire}d` : "—" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
            <p className="text-3xl font-bold text-slate-800">{k.value}</p>
            <p className="mt-1 text-sm text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel chart */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-base font-semibold">Pipeline Funnel</h2>
          <FunnelChart data={funnelData} />
        </div>

        {/* Conversion rates */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-base font-semibold">Stage Conversion Rates</h2>
          <div className="space-y-3">
            {conversionRates.map((r) => (
              <div key={r.to} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">{r.from} → {r.to}</span>
                    <span className="font-semibold text-slate-700">
                      {r.rate != null ? `${r.rate}%` : "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    {r.rate != null && (
                      <div
                        className="h-2 rounded-full bg-sky-500 transition-all"
                        style={{ width: `${r.rate}%` }}
                      />
                    )}
                  </div>
                </div>
                <span className="w-8 text-right text-xs text-slate-400">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source distribution */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-base font-semibold">Application Source</h2>
        <div className="flex flex-wrap gap-3">
          {sourceCounts.map((s) => (
            <div
              key={s.source}
              className="rounded-xl bg-slate-50 px-4 py-3 text-center min-w-[100px]"
            >
              <p className="text-2xl font-bold text-slate-800">{(s._count as { _all: number })._all}</p>
              <p className="text-xs text-slate-500 mt-1">{s.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
