"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CandidateTable({ candidates }: { candidates: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const selectAllChecked = candidates.length > 0 && selectedIds.length === candidates.length;

  const setAllSelected = (checked: boolean) => {
    setSelectedIds(checked ? candidates.map((candidate) => candidate.id) : []);
  };

  const runBulkAction = (action: "review" | "advance" | "reject") => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const requestId = crypto.randomUUID();
      const previewRes = await fetch("/api/applications/bulk-action?dryRun=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": `${requestId}:preview`
        },
        body: JSON.stringify({ action, candidateIds: selectedIds })
      });

      if (!previewRes.ok) {
        alert("Unable to preview bulk action. Please try again.");
        return;
      }

      const preview = await previewRes.json();
      const confirmed = window.confirm(
        `Bulk ${action} will update ${preview.candidatesMatched} candidates and ${preview.applicationsMatched} applications. Continue?`
      );

      if (!confirmed) return;

      const execRes = await fetch("/api/applications/bulk-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": requestId
        },
        body: JSON.stringify({
          action,
          candidateIds: selectedIds,
          notes: `Bulk ${action} triggered from candidate table`
        })
      });

      if (!execRes.ok) {
        const errorPayload = await execRes.json().catch(() => null);
        alert(errorPayload?.error ?? "Bulk action failed.");
        return;
      }

      setSelectedIds([]);
      window.location.reload();
    });
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => {
          const checked = selectedIds.includes(row.original.id);
          return (
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) =>
                setSelectedIds((current) =>
                  event.target.checked
                    ? [...current, row.original.id]
                    : current.filter((id) => id !== row.original.id)
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              aria-label={`Select ${row.original.fullName}`}
            />
          );
        }
      },
      {
        accessorKey: "fullName",
        header: "Candidate",
        cell: ({ row }) => (
          <div>
            <Link href={`/candidates/${row.original.id}`} className="font-semibold text-primary">
              {row.original.fullName}
            </Link>
            <p className="text-xs text-muted">{row.original.currentTitle ?? "Profile pending review"}</p>
          </div>
        )
      },
      { accessorKey: "primaryEmail", header: "Email" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <Badge tone="primary">{String(getValue())}</Badge>
      },
      { accessorKey: "overallScore", header: "Score" },
      {
        id: "job",
        header: "Role",
        cell: ({ row }) => row.original.applications[0]?.job?.title ?? "Spontaneous"
      }
    ],
    [selectedIds]
  );

  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">Candidates</h3>
          <p className="mt-1 text-sm text-muted">Advanced filtering, ranking context, and recruiter actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {selectedIds.length} selected
          </span>
          <Button
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await fetch("/api/exports", { method: "POST" });
              })
            }
            className="h-11"
          >
            {pending ? "Exporting..." : "Export Excel"}
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Button className="h-11" onClick={() => runBulkAction("review")}>
                Mark Reviewed
              </Button>
              <Button className="h-11" onClick={() => runBulkAction("advance")}>
                Advance
              </Button>
              <Button
                variant="danger"
                className="h-11"
                onClick={() => runBulkAction("reject")}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-medium">
                    {header.id === "select" ? (
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(event) => setAllSelected(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        aria-label="Select all candidates"
                      />
                    ) : header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-16 text-center">
                  <p className="text-base font-semibold text-slate-800">No candidates match these filters</p>
                  <p className="mt-1 text-sm text-muted">
                    Try resetting filters or widening score/date constraints.
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

