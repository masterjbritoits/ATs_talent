"use client";

import Link from "next/link";
import { useState, useOptimistic, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { STAGE_BADGE_CLASS, STAGE_LABELS, PIPELINE_STAGES } from "@/lib/constants/pipeline";

type Card = {
  id: string;
  candidateId: string;
  candidateName: string;
  currentTitle: string;
  score: number | null;
  jobTitle: string;
  jobId: string;
  status: string;
};

type Column = {
  id: string;
  label: string;
  color: string;
  cards: Card[];
};

function ScoreDot({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400";
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${color}`} title={`Score: ${score}`} />
  );
}

function KanbanCard({ card, isDragging }: { card: Card; isDragging?: boolean }) {
  const cls = STAGE_BADGE_CLASS[card.status] ?? "bg-slate-100 text-slate-700";
  return (
    <div
      className={`rounded-xl border bg-white p-3 shadow-sm transition-shadow ${
        isDragging ? "rotate-1 scale-105 shadow-lg opacity-80" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/candidates?highlight=${card.candidateId}`}
          className="text-sm font-semibold text-slate-800 hover:text-sky-600 truncate"
        >
          {card.candidateName}
        </Link>
        <ScoreDot score={card.score} />
      </div>
      {card.currentTitle && (
        <p className="mt-0.5 truncate text-xs text-slate-500">{card.currentTitle}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1 items-center">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 truncate max-w-[120px]">
          {card.jobTitle}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>
          {STAGE_LABELS[card.status]?.pt ?? card.status}
        </span>
      </div>
    </div>
  );
}

function SortableCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard card={card} />
    </div>
  );
}

// Stage order mapping
const STAGE_ORDER = Object.fromEntries(
  PIPELINE_STAGES.map((s, i) => [s.value, i])
);

const COLUMN_COLORS: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/60",
  indigo: "border-indigo-200 bg-indigo-50/60",
  violet: "border-violet-200 bg-violet-50/60",
  purple: "border-purple-200 bg-purple-50/60",
  fuchsia: "border-fuchsia-200 bg-fuchsia-50/60",
  pink: "border-pink-200 bg-pink-50/60",
  amber: "border-amber-200 bg-amber-50/60",
  rose: "border-rose-200 bg-rose-50/60",
  green: "border-green-200 bg-green-50/60",
  orange: "border-orange-200 bg-orange-50/60",
  cyan: "border-cyan-200 bg-cyan-50/60",
  red: "border-red-200 bg-red-50/60",
  emerald: "border-emerald-200 bg-emerald-50/60",
  slate: "border-slate-200 bg-slate-50/60",
};

const COLUMN_HEADER_COLORS: Record<string, string> = {
  blue: "text-blue-700",
  indigo: "text-indigo-700",
  violet: "text-violet-700",
  purple: "text-purple-700",
  fuchsia: "text-fuchsia-700",
  pink: "text-pink-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  green: "text-green-700",
  orange: "text-orange-700",
  cyan: "text-cyan-700",
  red: "text-red-700",
  emerald: "text-emerald-700",
  slate: "text-slate-700",
};

async function moveCard(applicationId: string, newStage: string) {
  await fetch(`/api/applications/${applicationId}/stage`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage: newStage }),
  });
}

export function KanbanBoard({ columns: initialColumns }: { columns: Column[] }) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Filter to show only non-empty columns + the first 6 active stages always
  const visibleColumns = columns.filter(
    (c) => c.cards.length > 0 || STAGE_ORDER[c.id] < 9
  );

  function findColumnOfCard(cardId: string) {
    return columns.find((c) => c.cards.some((card) => card.id === cardId));
  }

  function onDragStart({ active }: DragStartEvent) {
    const col = findColumnOfCard(String(active.id));
    const card = col?.cards.find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const sourceCol = findColumnOfCard(String(active.id));
    if (!sourceCol) return;

    // Determine target column: either a column id or another card's column
    const targetColId = columns.find((c) => c.id === over.id)
      ? String(over.id)
      : findColumnOfCard(String(over.id))?.id;

    if (!targetColId || sourceCol.id === targetColId) return;

    const card = sourceCol.cards.find((c) => c.id === active.id)!;

    // Optimistic update
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
        }
        if (col.id === targetColId) {
          return { ...col, cards: [...col.cards, { ...card, status: targetColId }] };
        }
        return col;
      })
    );

    // Persist
    startTransition(() => {
      moveCard(card.id, targetColId).catch(() => {
        // Revert on failure
        setColumns(initialColumns);
      });
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {visibleColumns.map((col) => (
          <div
            key={col.id}
            className={`flex-shrink-0 w-64 rounded-xl border-2 ${COLUMN_COLORS[col.color] ?? "border-slate-200 bg-slate-50"}`}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide ${COLUMN_HEADER_COLORS[col.color] ?? "text-slate-700"}`}
              >
                {STAGE_LABELS[col.id]?.pt ?? col.id}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                {col.cards.length}
              </span>
            </div>

            <SortableContext
              items={col.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={col.id}
                className="min-h-[120px] space-y-2 px-2 pb-3"
              >
                {col.cards.map((card) => (
                  <SortableCard key={card.id} card={card} />
                ))}
                {col.cards.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Drop here
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
