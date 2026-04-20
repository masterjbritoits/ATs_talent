import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job || job.status !== "OPEN") notFound();

  const requiredSkills: string[] = (() => {
    try { return JSON.parse(job.requiredSkillsJson as string); } catch { return []; }
  })();
  const optionalSkills: string[] = (() => {
    try { return JSON.parse(job.optionalSkillsJson as string); } catch { return []; }
  })();
  const languages: string[] = (() => {
    try { return JSON.parse(job.requiredLanguagesJson as string); } catch { return []; }
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/careers" className="text-sm text-sky-400 hover:underline">
            ← Todas as vagas
          </Link>
          <h1 className="mt-3 text-2xl font-bold">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {job.department} · {job.location} · {job.seniority} · {job.employmentType}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <section>
          <h2 className="mb-3 text-base font-semibold text-sky-400">Descrição da Função</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{job.description}</p>
        </section>

        {requiredSkills.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-sky-400">Competências Requeridas</h2>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((s) => (
                <span key={s} className="rounded-full bg-sky-900/30 px-3 py-1 text-xs font-medium text-sky-300">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {optionalSkills.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-400">Competências Valorizadas</h2>
            <div className="flex flex-wrap gap-2">
              {optionalSkills.map((s) => (
                <span key={s} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-400">Idiomas</h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <span key={l} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {l}
                </span>
              ))}
            </div>
          </section>
        )}

        {job.minYearsExperience > 0 && (
          <section>
            <h2 className="mb-1 text-base font-semibold text-slate-400">Experiência mínima</h2>
            <p className="text-sm text-slate-300">{job.minYearsExperience} anos</p>
          </section>
        )}

        <div className="pt-4">
          <Link
            href={`/careers/${job.id}/apply`}
            className="inline-block rounded-lg bg-sky-600 px-8 py-3 font-semibold text-white transition hover:bg-sky-500"
          >
            Candidatar-me a esta vaga →
          </Link>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        ITSector · careers@itsector.pt · Todos os dados tratados ao abrigo do RGPD
      </footer>
    </div>
  );
}
