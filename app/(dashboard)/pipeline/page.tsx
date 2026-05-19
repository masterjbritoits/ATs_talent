import { prisma } from "@/lib/db/prisma";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { PIPELINE_STAGES } from "@/lib/constants/pipeline";

export const dynamic = "force-dynamic";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const applications = await prisma.application.findMany({
    where: jobId ? { jobId } : {},
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          currentTitle: true,
          overallScore: true,
          preferredLanguage: true,
        },
      },
      job: { select: { id: true, title: true } },
    },
    orderBy: [{ score: "desc" }, { appliedAt: "asc" }],
  });

  // Group by status
  const columns = PIPELINE_STAGES.map((stage) => ({
    id: stage.value,
    label: stage.value,
    color: stage.color,
    cards: applications
      .filter((a) => a.status === stage.value)
      .map((a) => ({
        id: a.id,
        candidateId: a.candidate.id,
        candidateName: a.candidate.fullName,
        currentTitle: a.candidate.currentTitle ?? "",
        score: a.candidate.overallScore ?? null,
        jobTitle: a.job?.title ?? "No vacancy",
        jobId: a.jobId ?? "",
        status: a.status,
      })),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline Board</h1>
          <p className="mt-1 text-sm text-muted">
            Drag candidates between stages. Changes are saved automatically.
          </p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <select
            name="jobId"
            defaultValue={jobId ?? ""}
            onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All vacancies</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </form>
      </div>

      <KanbanBoard columns={columns} />
    </div>
  );
}
