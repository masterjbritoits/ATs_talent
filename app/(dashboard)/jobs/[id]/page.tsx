import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getJobDetail } from "@/lib/data";

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobDetail(id);
  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{job.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {job.department} · {job.location} · {job.seniority} · {job.employmentType}
            </p>
          </div>
          <Badge tone={job.status === "OPEN" ? "success" : "warning"}>{job.status}</Badge>
        </div>
        <p className="mt-6 text-sm text-muted">{job.description}</p>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Ranked Applicants</h3>
        <div className="mt-4 space-y-4">
          {job.applications.map((application) => (
            <div key={application.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{application.candidate.fullName}</p>
                  <p className="text-sm text-muted">
                    Rank #{application.rankingPosition ?? "N/A"} · {application.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{application.score ?? "N/A"}</p>
                  <p className="text-sm text-muted">{application.recommendation ?? "Pending"}</p>
                </div>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-slate-100">
                {JSON.stringify(application.rationaleJson, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
