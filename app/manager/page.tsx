import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { STAGE_BADGE_CLASS, STAGE_LABELS } from "@/lib/constants/pipeline";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const user = await requireUser();

  // If HIRING_MANAGER, restrict to their job scope
  let jobFilter: { id?: { in: string[] } } = {};
  if (user.role === "HIRING_MANAGER") {
    const jobIds = (() => {
      try { return JSON.parse(user.jobIds ?? "[]") as string[]; } catch { return [] as string[]; }
    })();
    if (jobIds.length > 0) jobFilter = { id: { in: jobIds } };
  }

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN", ...jobFilter },
    include: {
      applications: {
        include: {
          candidate: { select: { id: true, fullName: true, overallScore: true } },
        },
        orderBy: { score: "desc" },
        take: 20,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCandidates = jobs.reduce((s, j) => s + j.applications.length, 0);
  const awarded = jobs.reduce(
    (s, j) => s + j.applications.filter((a) => a.status === "AWARDED").length,
    0
  );
  const proposals = jobs.reduce(
    (s, j) => s + j.applications.filter((a) => a.status === "PROPOSAL_SENT").length,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Vacancies</h1>
        <p className="mt-1 text-sm text-slate-500">Real-time view of candidates for your open positions.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open vacancies", value: jobs.length },
          { label: "Total candidates", value: totalCandidates },
          { label: "In proposal / Awarded", value: `${proposals} / ${awarded}` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per job */}
      {jobs.map((job) => (
        <div key={job.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">{job.title}</h2>
              <p className="text-xs text-slate-500">{job.department} · {job.location} · {job.seniority}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {job.applications.length} candidate{job.applications.length !== 1 ? "s" : ""}
            </span>
          </div>

          {job.applications.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No candidates yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.applications.map((app) => {
                  const cls = STAGE_BADGE_CLASS[app.status] ?? "bg-slate-100 text-slate-600";
                  return (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {app.candidate.fullName}
                      </td>
                      <td className="px-4 py-3">
                        {app.candidate.overallScore != null ? (
                          <span
                            className={`font-semibold ${
                              app.candidate.overallScore >= 80
                                ? "text-emerald-600"
                                : app.candidate.overallScore >= 60
                                ? "text-amber-600"
                                : "text-slate-600"
                            }`}
                          >
                            {Math.round(app.candidate.overallScore)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                          {STAGE_LABELS[app.status]?.pt ?? app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {jobs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          No vacancies assigned to your account. Contact your recruitment team.
        </div>
      )}
    </div>
  );
}
