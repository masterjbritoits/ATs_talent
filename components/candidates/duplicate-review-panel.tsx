"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { GitMerge, ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DuplicateGroup = {
  groupKey: string;
  candidateIds: string[];
  confidence: number;
  reason: string[];
};

type Candidate = {
  id: string;
  fullName: string;
  primaryEmail: string;
  currentTitle: string | null;
  overallScore: number | null;
  status: string;
  createdAt: Date;
};

function ConfidencePill({ confidence }: { confidence: number }) {
  const tone = confidence >= 90 ? "danger" : confidence >= 75 ? "warning" : "info";
  return <Badge tone={tone}>{confidence}% match</Badge>;
}

function CandidateCard({
  candidate,
  isPrimary,
  onSetPrimary
}: {
  candidate: Candidate | null;
  isPrimary: boolean;
  onSetPrimary: () => void;
}) {
  if (!candidate) {
    return (
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 rounded-xl border p-4 transition-all ${
        isPrimary
          ? "border-sky-500/50 bg-sky-500/5 ring-1 ring-sky-500/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/candidates/${candidate.id}`}
            className="truncate text-sm font-semibold hover:text-sky-400 transition-colors"
          >
            {candidate.fullName}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">{candidate.currentTitle ?? candidate.primaryEmail}</p>
        </div>
        {isPrimary ? (
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-400">
            <Check className="h-3 w-3" /> Primary
          </span>
        ) : (
          <button
            onClick={onSetPrimary}
            className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-muted hover:bg-white/10 transition-colors"
          >
            Set primary
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted">
          Score: <span className="font-semibold text-foreground">{candidate.overallScore ?? "–"}</span>
        </span>
        <Badge tone={candidate.status === "SHORTLISTED" ? "success" : candidate.status === "REJECTED" ? "danger" : "info"}>
          {candidate.status}
        </Badge>
      </div>
    </div>
  );
}

function DuplicateGroupRow({
  group,
  candidates
}: {
  group: DuplicateGroup;
  candidates: Candidate[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [primaryId, setPrimaryId] = useState<string>(group.candidateIds[0] ?? "");
  const [merging, startMerge] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicateId = group.candidateIds.find((id) => id !== primaryId) ?? "";
  const primaryCandidate = candidates.find((c) => c.id === primaryId) ?? null;
  const duplicateCandidate = candidates.find((c) => c.id === duplicateId) ?? null;

  const handleMerge = () => {
    if (!primaryId || !duplicateId) return;
    setError(null);
    startMerge(async () => {
      try {
        const res = await fetch("/api/candidates/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryCandidateId: primaryId, duplicateCandidateId: duplicateId })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Merge failed");
          return;
        }
        setDone(true);
      } catch {
        setError("Network error");
      }
    });
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
        <Check className="h-4 w-4" />
        Merged — {primaryCandidate?.fullName ?? "candidate"} is now the primary record.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium">
              {group.candidateIds.length} possible duplicates detected
            </p>
            <p className="mt-0.5 text-xs text-muted">{group.reason.join(" · ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConfidencePill confidence={group.confidence} />
          {expanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-amber-500/15 px-4 pb-4 pt-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <CandidateCard
              candidate={primaryCandidate}
              isPrimary={true}
              onSetPrimary={() => {}}
            />
            <div className="flex items-center justify-center">
              <GitMerge className="h-5 w-5 text-muted" />
            </div>
            <CandidateCard
              candidate={duplicateCandidate}
              isPrimary={false}
              onSetPrimary={() => setPrimaryId(duplicateId)}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleMerge}
              disabled={merging || !primaryId || !duplicateId}
            >
              <GitMerge className="h-3.5 w-3.5" />
              {merging ? "Merging…" : `Merge into ${primaryCandidate?.fullName ?? "primary"}`}
            </Button>
            <p className="text-xs text-muted">
              The duplicate record will be deleted. All data moves to the primary.
            </p>
          </div>
          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function DuplicateReviewPanel({
  duplicates,
  candidates
}: {
  duplicates: DuplicateGroup[];
  candidates: Candidate[];
}) {
  if (duplicates.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold">
          Duplicate Review Queue
          <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
            {duplicates.length}
          </span>
        </h3>
      </div>
      <div className="space-y-2">
        {duplicates.map((group) => (
          <DuplicateGroupRow key={group.groupKey} group={group} candidates={candidates} />
        ))}
      </div>
    </div>
  );
}
