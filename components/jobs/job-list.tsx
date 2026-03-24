import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function JobList({ jobs }: { jobs: any[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {jobs.map((job) => (
        <Card key={job.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-primary">
                {job.title}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {job.department} · {job.location} · {job.seniority}
              </p>
            </div>
            <Badge tone={job.status === "OPEN" ? "success" : "warning"}>{job.status}</Badge>
          </div>
          <p className="mt-4 text-sm text-muted">{job.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(job.requiredSkillsJson as string[]).slice(0, 5).map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
          <div className="mt-5 text-sm text-muted">{job.applications.length} applications tracked</div>
        </Card>
      ))}
    </div>
  );
}
