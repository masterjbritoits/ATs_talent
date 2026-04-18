"use client";

import Link from "next/link";
import { ApplicationStatus } from "@prisma/client";
import { Users, Star, TrendingUp, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Application = {
  id: string;
  status: string;
  score: number | null;
  rankingPosition: number | null;
  candidate: {
    id: string;
    fullName: string;
    currentTitle: string | null;
    primaryEmail: string;
    overallScore: number | null;
    recommendation: string | null;
  };
};

type Stage = {
  stage: string;
  applications: Application[];
};

type Stats = {
  total: number;
  advanced: number;
  avgScore: number;
  topScore: number;
};

const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  REVIEW: "Under Review",
  ADVANCED: "Advanced",
  INTERVIEW_SCHEDULED: "Interview",
  TALENT_POOL: "Talent Pool",
  REJECTED: "Rejected"
};

const STAGE_TONES: Record<string, "info" | "success" | "warning" | "danger"> = {
  NEW: "info",
  REVIEW: "warning",
  ADVANCED: "success",
  INTERVIEW_SCHEDULED: "success",
  TALENT_POOL: "info",
  REJECTED: "danger"
};

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted">–</span>;
  const color =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-sky-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  return <span className={`text-xs font-semibold tabular-nums ${color}`}>{score}</span>;
}

function CandidateCard({ application }: { application: Application }) {
  return (
    <Link
      href={`/candidates/${application.candidate.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-sky-500/40 hover:bg-white/10 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-snug">{application.candidate.fullName}</p>
          <p className="truncate text-xs text-muted mt-0.5">{application.candidate.currentTitle ?? application.candidate.primaryEmail}</p>
        </div>
        <ScorePill score={application.score} />
      </div>
      {application.rankingPosition && (
        <p className="mt-2 text-[11px] text-muted">#{application.rankingPosition} ranked</p>
      )}
    </Link>
  );
}

function StageColumn({ stage, applications }: Stage) {
  const isEmpty = applications.length === 0;
  return (
    <div className="flex min-w-[200px] flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone={STAGE_TONES[stage] ?? "info"}>{STAGE_LABELS[stage] ?? stage}</Badge>
        </div>
        <span className="text-xs text-muted tabular-nums">{applications.length}</span>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/3 p-2 min-h-[120px]">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-xs text-muted/60">No candidates</p>
          </div>
        ) : (
          applications.map((app) => <CandidateCard key={app.id} application={app} />)
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ stages, stats }: { stages: Stage[]; stats: Stats }) {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2.5">
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Advanced</p>
            <p className="text-xl font-semibold">{stats.advanced}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2.5">
            <Star className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Avg Score</p>
            <p className="text-xl font-semibold">{stats.avgScore}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800 p-2.5">
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-muted">Top Score</p>
            <p className="text-xl font-semibold">{stats.topScore}</p>
          </div>
        </Card>
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages
            .filter((s) => s.stage !== "REJECTED")
            .map((s) => (
              <StageColumn key={s.stage} stage={s.stage} applications={s.applications} />
            ))}
        </div>
      </div>

      {/* Rejected collapsed at bottom */}
      {stages.find((s) => s.stage === "REJECTED" && s.applications.length > 0) && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
              <Badge tone="danger">Rejected</Badge>
              <span className="text-xs text-muted">
                {stages.find((s) => s.stage === "REJECTED")?.applications.length} candidates
              </span>
              <span className="ml-auto text-xs text-muted group-open:hidden">Show</span>
              <span className="ml-auto hidden text-xs text-muted group-open:inline">Hide</span>
            </div>
          </summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stages
              .find((s) => s.stage === "REJECTED")
              ?.applications.map((app) => <CandidateCard key={app.id} application={app} />)}
          </div>
        </details>
      )}
    </div>
  );
}
