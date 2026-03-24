"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ExportPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold">Excel Exports</h3>
      <p className="mt-1 text-sm text-muted">Generate candidate and pipeline exports into the local storage folder.</p>
      <Button
        className="mt-4"
        onClick={() =>
          startTransition(async () => {
            const response = await fetch("/api/exports", { method: "POST" });
            const data = await response.json();
            setResult(data.path);
          })
        }
      >
        {pending ? "Exporting..." : "Export Candidates"}
      </Button>
      {result ? <p className="mt-3 text-sm text-success">Saved to {result}</p> : null}
    </div>
  );
}
