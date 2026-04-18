"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function PaginationControls({
  page,
  totalPages,
  total,
  pageSize
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Page window: show at most 5 page buttons centred on current page
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let windowStart = Math.max(1, page - half);
  let windowEnd = Math.min(totalPages, windowStart + windowSize - 1);
  if (windowEnd - windowStart < windowSize - 1) {
    windowStart = Math.max(1, windowEnd - windowSize + 1);
  }
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-xs text-muted tabular-nums">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> candidates
      </p>

      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => goTo(1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>

        {/* Prev */}
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page numbers */}
        {windowStart > 1 && (
          <span className="flex h-8 w-8 items-center justify-center text-xs text-muted">…</span>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
              p === page
                ? "bg-sky-500 text-white"
                : "border border-white/10 text-muted hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        ))}
        {windowEnd < totalPages && (
          <span className="flex h-8 w-8 items-center justify-center text-xs text-muted">…</span>
        )}

        {/* Next */}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last */}
        <button
          onClick={() => goTo(totalPages)}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
