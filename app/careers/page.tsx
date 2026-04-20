import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <span className="text-sm font-bold tracking-widest text-sky-400 uppercase">ITSector</span>
            <h1 className="mt-0.5 text-xl font-semibold text-white">Oportunidades de Carreira</h1>
          </div>
          <span className="rounded-full bg-sky-900/40 px-3 py-1 text-xs font-semibold text-sky-300">
            {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} disponíve{jobs.length !== 1 ? "is" : "l"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-8 text-slate-400">
          Junta-te a uma equipa de tecnologia em crescimento. Candidata-te diretamente — sem intermediários.
        </p>

        {jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
            Não existem vagas abertas neste momento. Volta a visitar em breve.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const requiredSkills = (() => {
                try { return JSON.parse(job.requiredSkillsJson as string) as string[]; }
                catch { return [] as string[]; }
              })();

              return (
                <Link
                  key={job.id}
                  href={`/careers/${job.id}`}
                  className="group block rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-sky-500 hover:bg-slate-800/60"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {job.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {job.department} · {job.location} · {job.seniority}
                      </p>
                      {requiredSkills.slice(0, 4).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {requiredSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400 group-hover:bg-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                          {requiredSkills.length > 4 && (
                            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-500">
                              +{requiredSkills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-sky-900/40 px-3 py-1 text-xs font-medium text-sky-300">
                        {job.employmentType}
                      </span>
                      <span className="text-slate-500 group-hover:text-sky-400 transition-colors">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        ITSector · careers@itsector.pt · Todos os dados tratados ao abrigo do RGPD
      </footer>
    </div>
  );
}
