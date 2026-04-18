import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PipelineBoard } from "@/components/jobs/pipeline-board";
import { getJobPipelineData } from "@/lib/data";

export default async function JobPipelinePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getJobPipelineData(id);

  if (!data) {
    notFound();
  }

  const { job, stages, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              href={`/jobs/${id}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to job
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
            <p className="text-sm text-muted">
              {job.department} · {job.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={job.status === "OPEN" ? "success" : "warning"}>{job.status}</Badge>
            <Link
              href={`/jobs/${id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-muted hover:bg-white/5 transition-all"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Job detail
            </Link>
          </div>
        </div>
      </Card>

      <PipelineBoard stages={stages} stats={stats} />
    </div>
  );
}
