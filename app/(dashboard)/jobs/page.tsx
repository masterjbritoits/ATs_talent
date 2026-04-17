import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { JobPublishingPanel } from "@/components/jobs/job-publishing-panel";
import { JobList } from "@/components/jobs/job-list";
import { Card } from "@/components/ui/card";
import { getJobsData } from "@/lib/data";

export default async function JobsPage() {
  const jobs = await getJobsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vacancy Management</h1>
        <p className="mt-2 text-sm text-muted">
          Manage jobs manually, import structured vacancy feeds, and review ranked applicants.
        </p>
      </div>
      <Card className="border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Publishing</p>
            <h2 className="mt-2 text-lg font-semibold">Publicar vagas em canais externos</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Acede a uma area dedicada com ligacoes para LinkedIn, SAPO Emprego e Net-Empregos.
            </p>
          </div>
          <Link
            href="/job-publishing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#132f55]"
          >
            Abrir area de publicacao
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
      <JobList jobs={jobs} />
      <JobPublishingPanel jobs={jobs} />
    </div>
  );
}
