import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getCandidatesData } from "@/lib/data";

export default async function TalentPoolPage() {
  const { candidates } = await getCandidatesData({ talentPool: "true" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Talent Pool Intelligence</h1>
        <p className="mt-2 text-sm text-muted">
          Revisit near-fit profiles, cluster reusable talent, and reattach strong candidates to new roles.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
            <Link href={`/candidates/${candidate.id}`} className="text-lg font-semibold text-primary">
              {candidate.fullName}
            </Link>
            <p className="mt-2 text-sm text-muted">
              {candidate.currentTitle ?? "Profile pending review"} · {candidate.location ?? "Unknown location"}
            </p>
            <p className="mt-4 text-sm text-muted">{candidate.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
