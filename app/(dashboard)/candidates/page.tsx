import { CandidateTable } from "@/components/candidates/candidate-table";
import { Card } from "@/components/ui/card";
import { getCandidatesData } from "@/lib/data";

export default async function CandidatesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { candidates, duplicates } = await getCandidatesData(params);

  return (
    <div className="space-y-6">
      <CandidateTable candidates={candidates} />
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
    </div>
  );
}
