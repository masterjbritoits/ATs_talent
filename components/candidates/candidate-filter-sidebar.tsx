"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export interface CandidateFilters {
  status?: string;
  jobId?: string;
  minScore?: number;
  beforeDate?: string;
  afterDate?: string;
  search?: string;
}

interface Props {
  jobs: Array<{ id: string; title: string }>;
  onFiltersChange?: (filters: CandidateFilters) => void;
}

export function CandidateFilterSidebar({ jobs, onFiltersChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CandidateFilters>({
    status: searchParams.get("status") ?? undefined,
    jobId: searchParams.get("jobId") ?? undefined,
    minScore: searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : undefined,
    beforeDate: searchParams.get("beforeDate") ?? undefined,
    afterDate: searchParams.get("afterDate") ?? undefined,
    search: searchParams.get("q") ?? undefined
  });

  const handleFilterChange = (key: keyof CandidateFilters, value: any) => {
    const updated = { ...filters, [key]: value || undefined };
    setFilters(updated);
    onFiltersChange?.(updated);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange?.({});
    router.push("?");
  };

  const statusOptions = [
    { value: "NEW", label: "New" },
    { value: "REVIEWED", label: "Reviewed" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "REJECTED", label: "Rejected" },
    { value: "HOLD", label: "On Hold" },
    { value: "HIRED", label: "Hired" }
  ];

  return (
    <div className="w-full space-y-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div>
        <label className="block text-sm font-semibold text-slate-700">Search</label>
        <input
          type="text"
          placeholder="Name, email, role..."
          value={filters.search ?? ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Status</label>
        <select
          value={filters.status ?? ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Role</label>
        <select
          value={filters.jobId ?? ""}
          onChange={(e) => handleFilterChange("jobId", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All roles</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Min. Match Score</label>
        <input
          type="number"
          min={0}
          max={100}
          value={filters.minScore ?? ""}
          onChange={(e) => handleFilterChange("minScore", e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="0-100"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Application Date Range</label>
        <div>
          <label className="text-xs text-slate-500">From</label>
          <input
            type="date"
            value={filters.afterDate ?? ""}
            onChange={(e) => handleFilterChange("afterDate", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">To</label>
          <input
            type="date"
            value={filters.beforeDate ?? ""}
            onChange={(e) => handleFilterChange("beforeDate", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={handleReset} variant="secondary" className="w-full">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
