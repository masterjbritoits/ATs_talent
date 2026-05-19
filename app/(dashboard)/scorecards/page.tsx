import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { ScorecardForm } from "@/components/candidates/scorecard-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ScorecardsPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  await requireUser();
  const { applicationId } = await searchParams;

  const applications = await prisma.application.findMany({
    where: { status: { in: ["SANITY_CHECK", "BEHAVIOURAL_INTERVIEW", "TECHNICAL_INTERVIEW", "PROJECT_INTERVIEW", "CLIENT_INTERVIEW"] } },
    include: {
      candidate: { select: { id: true, fullName: true } },
      job: { select: { id: true, title: true } },
      scorecards: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const selected = applicationId
    ? applications.find((a) => a.id === applicationId) ?? null
    : applications[0] ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Interview Scorecards</h1>
        <p className="mt-1 text-sm text-muted">
          Submit structured feedback after each interview stage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Application list */}
        <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active Interviews ({applications.length})
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: "70vh" }}>
            {applications.map((app) => (
              <a
                key={app.id}
                href={`/scorecards?applicationId=${app.id}`}
                className={`block px-4 py-3 transition hover:bg-slate-50 ${
                  selected?.id === app.id ? "bg-sky-50 border-l-4 border-sky-500" : ""
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">
                  {app.candidate.fullName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {app.job?.title ?? "No vacancy"} · {app.status.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {app.scorecards.length} scorecard{app.scorecards.length !== 1 ? "s" : ""}
                </p>
              </a>
            ))}
            {applications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No candidates currently in interview stages.
              </div>
            )}
          </div>
        </div>

        {/* Scorecard panel */}
        <div className="lg:col-span-2 space-y-6">
          {selected ? (
            <>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold">
                  {selected.candidate.fullName}
                </h2>
                <p className="text-sm text-slate-500">
                  {selected.job?.title ?? "No vacancy"} · Stage:{" "}
                  {selected.status.replace(/_/g, " ")}
                </p>

                <div className="mt-6">
                  <ScorecardForm
                    applicationId={selected.id}
                    interviewType={selected.status.replace("_INTERVIEW", "")}
                  />
                </div>
              </div>

              {/* Past scorecards */}
              {selected.scorecards.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                  <h3 className="text-base font-semibold mb-4">Previous Scorecards</h3>
                  <div className="space-y-4">
                    {selected.scorecards.map((sc) => {
                      const scores = sc.scoresJson as Record<string, number>;
                      return (
                        <div key={sc.id} className="rounded-xl border border-slate-100 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{sc.interviewType.replace(/_/g, " ")}</p>
                              <p className="text-xs text-slate-500">by {sc.author.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xl font-bold ${
                                  sc.overallScore >= 80
                                    ? "text-emerald-600"
                                    : sc.overallScore >= 60
                                    ? "text-amber-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {sc.overallScore}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  sc.recommendation === "ADVANCE"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : sc.recommendation === "HOLD"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {sc.recommendation}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(scores).map(([k, v]) => (
                              <span key={k} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {k}: {v}/5
                              </span>
                            ))}
                          </div>
                          {sc.notes && (
                            <p className="mt-2 text-xs text-slate-500 italic">{sc.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-12 text-center text-slate-400 shadow-soft">
              Select a candidate to submit or view scorecards.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
