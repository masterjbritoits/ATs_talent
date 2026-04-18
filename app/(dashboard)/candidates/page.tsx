import { Suspense } from "react";

import { CandidateFilterSidebar } from "@/components/candidates/candidate-filter-sidebar";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { DuplicateReviewPanel } from "@/components/candidates/duplicate-review-panel";
import { PaginationControls } from "@/components/ui/pagination";
import { getCandidatesData, getJobsData } from "@/lib/data";

export default async function CandidatesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [candidatesData, jobsData] = await Promise.all([
    getCandidatesData(params),
    getJobsData()
  ]);

  const { candidates, duplicates, total, page, pageSize, totalPages } = candidatesData;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Candidate Pipeline</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Prioritize faster decisions with precise filtering, safer bulk actions, and a cleaner
              recruiter workflow.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 tabular-nums">
            {total} total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <Suspense fallback={<div>Loading filters...</div>}>
          <CandidateFilterSidebar
            jobs={jobsData.map((job) => ({ id: job.id, title: job.title }))}
          />
        </Suspense>
      </div>

      <div className="space-y-6 lg:col-span-3">
        <CandidateTable candidates={candidates} />
        <PaginationControls page={page} totalPages={totalPages} total={total} pageSize={pageSize} />

        <DuplicateReviewPanel
          duplicates={duplicates}
          candidates={candidates.map((c) => ({
            id: c.id,
            fullName: c.fullName,
            primaryEmail: c.primaryEmail,
            currentTitle: c.currentTitle,
            overallScore: c.overallScore,
            status: c.status,
            createdAt: c.createdAt
          }))}
        />
      </div>
      </div>
    </div>
  );
}
