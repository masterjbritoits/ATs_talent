import { getJobsData } from "@/lib/data";
import { JobPublishingPanel } from "@/components/jobs/job-publishing-panel";

export default async function JobPublishingPage({
  searchParams
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const jobs = await getJobsData();
  const { jobId } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Job Publishing</h1>
        <p className="mt-2 text-sm text-muted">
          Area dedicada a publicacao de vagas nos portais externos usados pelo recrutamento.
        </p>
      </div>
      <JobPublishingPanel jobs={jobs} initialJobId={jobId} />
    </div>
  );
}
