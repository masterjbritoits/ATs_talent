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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={(event) =>
              setSelectedIds((current) =>
                event.target.checked
                  ? [...current, row.original.id]
                  : current.filter((id) => id !== row.original.id)
              )
            }
          />
        )
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
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Candidates</h3>
          <p className="text-sm text-muted">Advanced filtering, ranking context, and recruiter actions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await fetch("/api/exports", { method: "POST" });
              })
            }
          >
            {pending ? "Exporting..." : "Export Excel"}
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Button
                onClick={() =>
                  startTransition(async () => {
                    await fetch("/api/applications/bulk-action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "review",
                        candidateIds: selectedIds,
                        notes: "Marked as reviewed via bulk action"
                      })
                    });
                    setSelectedIds([]);
                  })
                }
              >
                Mark Reviewed
              </Button>
              <Button
                onClick={() =>
                  startTransition(async () => {
                    await fetch("/api/applications/bulk-action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "advance",
                        candidateIds: selectedIds,
                        notes: "Advanced via bulk action"
                      })
                    });
                    setSelectedIds([]);
                  })
                }
              >
                Advance
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  startTransition(async () => {
                    await fetch("/api/applications/bulk-action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "reject",
                        candidateIds: selectedIds,
                        notes: "Rejected via bulk action"
                      })
                    });
                    setSelectedIds([]);
                  })
                }
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

