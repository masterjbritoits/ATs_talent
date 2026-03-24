"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const formSchema = z.object({
  fullName: z.string().min(2),
  primaryEmail: z.string().email(),
  currentTitle: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  status: z.enum([
    "NEW",
    "MANUAL_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "INTERVIEW_SCHEDULED",
    "HIRED",
    "TALENT_POOL"
  ])
});

type FormValues = z.infer<typeof formSchema>;

export function CandidateEditForm({
  candidate
}: {
  candidate: {
    id: string;
    fullName: string;
    primaryEmail: string;
    currentTitle: string | null;
    location: string | null;
    summary: string | null;
    status: FormValues["status"];
    isInTalentPool: boolean;
  };
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: candidate.fullName,
      primaryEmail: candidate.primaryEmail,
      currentTitle: candidate.currentTitle ?? "",
      location: candidate.location ?? "",
      summary: candidate.summary ?? "",
      status: candidate.status
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          isInTalentPool: values.status === "TALENT_POOL"
        })
      });

      if (response.ok) {
        setMessage("Candidate profile updated.");
      }
    });
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold">Edit Parsed Data</h3>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <input {...form.register("fullName")} className="h-11 rounded-xl border border-border bg-slate-50 px-3" />
        <input {...form.register("primaryEmail")} className="h-11 rounded-xl border border-border bg-slate-50 px-3" />
        <input {...form.register("currentTitle")} className="h-11 rounded-xl border border-border bg-slate-50 px-3" />
        <input {...form.register("location")} className="h-11 rounded-xl border border-border bg-slate-50 px-3" />
        <select {...form.register("status")} className="h-11 rounded-xl border border-border bg-slate-50 px-3">
          <option value="NEW">NEW</option>
          <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
          <option value="SHORTLISTED">SHORTLISTED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
          <option value="HIRED">HIRED</option>
          <option value="TALENT_POOL">TALENT_POOL</option>
        </select>
        <textarea
          {...form.register("summary")}
          className="min-h-[120px] rounded-xl border border-border bg-slate-50 px-3 py-3"
        />
        <Button type="submit">{pending ? "Saving..." : "Save Candidate"}</Button>
      </form>
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
    </div>
  );
}
