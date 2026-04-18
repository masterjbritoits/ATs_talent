import { Suspense } from "react";

import { CandidateFilterSidebar } from "@/components/candidates/candidate-filter-sidebar";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { Card } from "@/components/ui/card";
import { getCandidatesData, getJobsData } from "@/lib/data";
import { detectDuplicates } from "@/lib/matching/duplicates";

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

  const { candidates, duplicates } = candidatesData;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <Suspense fallback={<div>Loading filters...</div>}>
          <CandidateFilterSidebar
            jobs={jobsData.map((job) => ({ id: job.id, title: job.title }))}
            onFiltersChange={() => {}}
          />
        </Suspense>
      </div>

      <div className="space-y-6 lg:col-span-3">
        <CandidateTable candidates={candidates} />

        {duplicates.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold">Duplicate Review Queue</h3>
            <div className="mt-4 space-y-3">
              {duplicates.map((duplicate) => (
                <div key={duplicate.groupKey} className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold">{duplicate.groupKey}</p>
                  <p className="text-sm text-muted">
                    {duplicate.candidateIds.length} candidates · {duplicate.confidence}% confidence
                  </p>
                  <p className="mt-2 text-sm text-muted">{duplicate.reason.join(" | ")}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
