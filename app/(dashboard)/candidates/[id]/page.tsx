import { notFound } from "next/navigation";

import { CandidateEditForm } from "@/components/candidates/candidate-edit-form";
import { EmailDraftPanel } from "@/components/email/email-draft-panel";
import { InterviewPanel } from "@/components/candidates/interview-panel";
import { NotesPanel } from "@/components/candidates/notes-panel";
import { TimelinePanel } from "@/components/candidates/timeline-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCandidateDetail } from "@/lib/data";
import { formatDate } from "@/lib/utils/date";

export default async function CandidateDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCandidateDetail(id);

  if (!data) {
    notFound();
  }

  const { candidate, auditLogs, alternativeRoles } = data;
  const application = candidate.applications[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{candidate.fullName}</h1>
              <p className="mt-2 text-sm text-muted">
                {candidate.currentTitle ?? "Role not parsed"} · {candidate.location ?? "Unknown location"} ·{" "}
                {candidate.primaryEmail}
              </p>
            </div>
            <Badge tone="primary">{candidate.status}</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Score</p>
              <p className="mt-2 text-3xl font-semibold">{candidate.overallScore ?? "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Recommendation</p>
              <p className="mt-2 text-3xl font-semibold">{candidate.recommendation ?? "Pending"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Confidence</p>
              <p className="mt-2 text-3xl font-semibold">{candidate.confidenceScore ?? 0}%</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted">{candidate.summary ?? "Summary not available."}</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Application & Ranking</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-muted">Primary role</p>
              <p className="mt-2 font-semibold">{application?.job?.title ?? "Spontaneous application"}</p>
              <p className="mt-1 text-sm text-muted">Rank #{application?.rankingPosition ?? "N/A"}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-muted">Applied</p>
              <p className="mt-2 font-semibold">{formatDate(application?.appliedAt)}</p>
              <p className="mt-1 text-sm text-muted">{application?.status ?? "Pending"}</p>
            </div>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-slate-100">
            {JSON.stringify(application?.rationaleJson, null, 2)}
          </pre>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Attachments & CV Text</h3>
          <div className="mt-4 space-y-4">
            {candidate.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold">{attachment.originalFilename}</p>
                <p className="text-sm text-muted">
                  {attachment.attachmentType} · {attachment.parserType} · confidence{" "}
                  {Math.round((attachment.parserConfidence ?? 0) * 100)}%
                </p>
                <p className="mt-3 text-sm text-muted whitespace-pre-wrap">
                  {attachment.parsedText?.slice(0, 800) ?? "No parsed text available."}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <InterviewPanel
          candidateId={candidate.id}
          applicationId={application?.id}
          candidateEmail={candidate.primaryEmail}
        />
        <CandidateEditForm
          candidate={{
            id: candidate.id,
            fullName: candidate.fullName,
            primaryEmail: candidate.primaryEmail,
            currentTitle: candidate.currentTitle,
            location: candidate.location,
            summary: candidate.summary,
            status: candidate.status,
            isInTalentPool: candidate.isInTalentPool
          }}
        />
        <EmailDraftPanel candidateId={candidate.id} candidateEmail={candidate.primaryEmail} />
        <Card>
          <h3 className="text-lg font-semibold">Alternative Role Suggestions</h3>
          <div className="mt-4 space-y-3">
            {alternativeRoles.map((job) => (
              <div key={job.jobId} className="rounded-xl border border-white/10 p-4">
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-muted">Fit score {job.score}</p>
                <p className="mt-2 text-sm text-muted">{job.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
        <NotesPanel candidateId={candidate.id} initialNotes={candidate.notes} />
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Timeline</h3>
          <TimelinePanel
            emails={candidate.emails}
            interviews={candidate.interviews}
            auditLogs={auditLogs}
          />
        </Card>
      </div>
    </div>
  );
}
