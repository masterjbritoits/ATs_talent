"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function InterviewPanel({
  candidateId,
  applicationId,
  candidateEmail
}: {
  candidateId: string;
  applicationId?: string;
  candidateEmail: string;
}) {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold">Interview Scheduling</h3>
      <p className="mt-1 text-sm text-muted">Create a Microsoft 365 calendar event or a local placeholder event.</p>
      <input
        type="datetime-local"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="mt-4 h-11 rounded-xl border border-border bg-slate-50 px-3"
      />
      <Button
        className="mt-4"
        onClick={() =>
          startTransition(async () => {
            const start = new Date(date);
            const end = new Date(start.getTime() + 60 * 60000);
            const response = await fetch("/api/calendar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                candidateId,
                applicationId,
                title: "ITSector Interview",
                startsAt: start.toISOString(),
                endsAt: end.toISOString(),
                attendeeEmails: [candidateEmail, "joana.recruiter@itsector.pt"],
                location: "Microsoft Teams",
                notes: "Initial interview scheduled from ATS."
              })
            });
            if (response.ok) {
              setMessage("Interview scheduled.");
            }
          })
        }
      >
        {pending ? "Scheduling..." : "Schedule Interview"}
      </Button>
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
    </div>
  );
}
