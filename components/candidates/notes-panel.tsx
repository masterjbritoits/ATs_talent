"use client";

import { useState, useTransition } from "react";
import { FileText, MessageSquare, AlertTriangle, Star, Tag, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

const NOTE_TYPES = [
  { value: "GENERAL", label: "General", icon: MessageSquare, tone: "info" as const },
  { value: "INTERVIEW_FEEDBACK", label: "Interview Feedback", icon: Star, tone: "success" as const },
  { value: "CONCERN", label: "Concern", icon: AlertTriangle, tone: "warning" as const },
  { value: "REFERENCE", label: "Reference", icon: FileText, tone: "primary" as const }
] as const;

type NoteType = (typeof NOTE_TYPES)[number]["value"];

function NoteTypeIcon({ type }: { type: string }) {
  const config = NOTE_TYPES.find((t) => t.value === type) ?? NOTE_TYPES[0];
  const Icon = config.icon;
  return <Icon className="h-3.5 w-3.5" />;
}

type Note = {
  id: string;
  note: string;
  noteType: string;
  tagsJson: unknown;
  createdAt: Date;
  author: { id: string; name: string };
};

export function NotesPanel({
  candidateId,
  initialNotes
}: {
  candidateId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("GENERAL");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!noteText.trim()) return;
    setError(null);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/candidates/${candidateId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: noteText.trim(), noteType, tags })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to save note");
          return;
        }

        const saved = await res.json();
        setNotes((prev) => [saved, ...prev]);
        setNoteText("");
        setTagsInput("");
        setNoteType("GENERAL");
        setIsOpen(false);
      } catch {
        setError("Network error");
      }
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recruiter Notes</h3>
        <Button size="sm" variant="secondary" onClick={() => setIsOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>

      {/* New note form */}
      {isOpen && (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {NOTE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setNoteType(t.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  noteType === t.value
                    ? "bg-white/15 text-foreground ring-1 ring-white/20"
                    : "text-muted hover:bg-white/10"
                }`}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note here…"
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-muted focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />

          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 shrink-0 text-muted" />
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma separated)"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs placeholder:text-muted focus:border-sky-500/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isPending || !noteText.trim()}>
              {isPending ? "Saving…" : "Save note"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="mt-4 space-y-3">
        {notes.length === 0 && !isOpen && (
          <p className="py-6 text-center text-sm text-muted">No notes yet</p>
        )}
        {notes.map((note) => {
          const typeConfig = NOTE_TYPES.find((t) => t.value === note.noteType) ?? NOTE_TYPES[0];
          const tags = Array.isArray(note.tagsJson) ? (note.tagsJson as string[]) : [];

          return (
            <div key={note.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={typeConfig.tone}>
                    <span className="flex items-center gap-1">
                      <NoteTypeIcon type={note.noteType} />
                      {typeConfig.label}
                    </span>
                  </Badge>
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <time className="shrink-0 text-xs text-muted">{formatDate(note.createdAt, "dd MMM HH:mm")}</time>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{note.note}</p>
              <p className="mt-1.5 text-xs text-muted">{note.author.name}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
