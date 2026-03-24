import { JobList } from "@/components/jobs/job-list";
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
      <JobList jobs={jobs} />
    </div>
  );
}
