"use client";

import { useState } from "react";
import {
  Mail,
  Calendar,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";

type EmailEvent = {
  kind: "email";
  id: string;
  subject: string;
  direction: string;
  fromAddress: string;
  bodyText: string | null;
  createdAt: Date;
};

type InterviewEvent = {
  kind: "interview";
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  notes: string | null;
  createdAt: Date;
};

type AuditEvent = {
  kind: "audit";
  id: string;
  action: string;
  metadataJson: unknown;
  actor: { id: string; name: string } | null;
  createdAt: Date;
};

type TimelineEvent = EmailEvent | InterviewEvent | AuditEvent;

function EmailCard({ event, isExpanded, onToggle }: { event: EmailEvent; isExpanded: boolean; onToggle: () => void }) {
  const isInbound = event.direction === "INBOUND";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-lg p-1.5 ${isInbound ? "bg-sky-500/15" : "bg-emerald-500/15"}`}>
          {isInbound ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-sky-400" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{event.subject || "(no subject)"}</p>
            <time className="shrink-0 text-xs text-muted">{formatDate(event.createdAt, "dd MMM HH:mm")}</time>
          </div>
          <p className="mt-0.5 text-xs text-muted">{event.fromAddress}</p>
          {event.bodyText && (
            <button
              onClick={onToggle}
              className="mt-2 flex items-center gap-1 text-xs text-sky-400/80 hover:text-sky-400"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {isExpanded ? "Collapse" : "Preview"}
            </button>
          )}
          {isExpanded && event.bodyText && (
            <p className="mt-2 rounded-lg bg-white/5 p-3 text-xs text-muted whitespace-pre-wrap leading-relaxed">
              {event.bodyText.slice(0, 600)}
              {event.bodyText.length > 600 ? "…" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ event }: { event: InterviewEvent }) {
  const isPast = event.startsAt < new Date();
  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-purple-500/15 p-1.5">
          <Calendar className="h-3.5 w-3.5 text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{event.title}</p>
            <Badge tone={isPast ? "info" : "success"}>{isPast ? "Past" : "Upcoming"}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {formatDate(event.startsAt, "dd MMM yyyy HH:mm")}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {event.notes && <p className="mt-2 text-xs text-muted">{event.notes}</p>}
        </div>
      </div>
    </div>
  );
}

function AuditCard({ event }: { event: AuditEvent }) {
  const meta = event.metadataJson as Record<string, unknown> | null;
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="mt-0.5 rounded-lg bg-slate-700/60 p-1.5">
        <FileText className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm">
            <span className="font-medium">{event.action.replace(/_/g, " ")}</span>
            {event.actor && (
              <span className="text-muted">
                {" "}
                by <span className="text-foreground/80">{event.actor.name}</span>
              </span>
            )}
          </p>
          <time className="shrink-0 text-xs text-muted">{formatDate(event.createdAt, "dd MMM HH:mm")}</time>
        </div>
        {meta && Object.keys(meta).length > 0 && (
          <p className="mt-0.5 text-xs text-muted">
            {Object.entries(meta)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Emails", value: "email" },
  { label: "Interviews", value: "interview" },
  { label: "Activity", value: "audit" }
] as const;

export function TimelinePanel({
  emails,
  interviews,
  auditLogs
}: {
  emails: Array<{
    id: string;
    subject: string;
    direction: string;
    fromAddress: string;
    bodyText: string | null;
    createdAt: Date;
  }>;
  interviews: Array<{
    id: string;
    title: string;
    startsAt: Date;
    endsAt: Date;
    location: string | null;
    notes: string | null;
    createdAt: Date;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    metadataJson: unknown;
    actor: { id: string; name: string } | null;
    createdAt: Date;
  }>;
}) {
  const [filter, setFilter] = useState<"all" | "email" | "interview" | "audit">("all");
  const [expandedEmailIds, setExpandedEmailIds] = useState<Set<string>>(new Set());

  const toggleEmail = (id: string) => {
    setExpandedEmailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const events: TimelineEvent[] = [
    ...emails.map((e) => ({ kind: "email" as const, ...e })),
    ...interviews.map((e) => ({ kind: "interview" as const, ...e })),
    ...auditLogs.map((e) => ({ kind: "audit" as const, ...e }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = filter === "all" ? events : events.filter((e) => e.kind === filter);

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-white/10 text-foreground"
                : "text-muted hover:bg-white/5 hover:text-foreground/80"
            }`}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1.5 tabular-nums text-muted/60">
                {opt.value === "email"
                  ? emails.length
                  : opt.value === "interview"
                    ? interviews.length
                    : auditLogs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No activity yet</p>
        )}
        {filtered.map((event) => {
          if (event.kind === "email") {
            return (
              <EmailCard
                key={event.id}
                event={event}
                isExpanded={expandedEmailIds.has(event.id)}
                onToggle={() => toggleEmail(event.id)}
              />
            );
          }
          if (event.kind === "interview") {
            return <InterviewCard key={event.id} event={event} />;
          }
          return <AuditCard key={event.id} event={event} />;
        })}
      </div>
    </div>
  );
}
