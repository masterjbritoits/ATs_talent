"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function EmailDraftPanel({
  candidateId,
  candidateEmail
}: {
  candidateId: string;
  candidateEmail: string;
}) {
  const [templateType, setTemplateType] = useState("manual_review_hold");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold">Email Center</h3>
      <p className="mt-1 text-sm text-muted">Draft, review, edit, and send recruiter-approved communication.</p>
      <div className="mt-4 grid gap-4">
        <select
          value={templateType}
          onChange={(event) => setTemplateType(event.target.value)}
          className="h-11 rounded-xl border border-border bg-slate-50 px-3"
        >
          <option value="application_received">Application Received</option>
          <option value="manual_review_hold">Manual Review Hold</option>
          <option value="rejection">Rejection</option>
          <option value="talent_pool">Talent Pool</option>
          <option value="request_more_information">Request More Information</option>
          <option value="interview_invitation">Interview Invitation</option>
        </select>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Optional custom subject"
          className="h-11 rounded-xl border border-border bg-slate-50 px-3"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Email candidate at ${candidateEmail}`}
          className="min-h-[180px] rounded-xl border border-border bg-slate-50 px-3 py-3"
        />
        <Button
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  candidateId,
                  templateType,
                  subject,
                  body
                })
              });
              const result = await response.json();
              setMessage(`Draft processed via ${result.draft.provider}.`);
            })
          }
        >
          {pending ? "Sending..." : "Generate / Send Draft"}
        </Button>
        {message ? <p className="text-sm text-success">{message}</p> : null}
      </div>
    </div>
  );
}
