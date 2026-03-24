"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SyncPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Mailbox Synchronization</h3>
          <p className="text-sm text-muted">
            Fetch new Microsoft 365 inbox messages, parse CV attachments, and update applications.
          </p>
        </div>
        <Button
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/sync", { method: "POST" });
              const result = await response.json();
              setMessage(
                `Imported ${result.importedMessages} messages, created ${result.applicationsCreated} applications.`
              );
            })
          }
        >
          {pending ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}
    </div>
  );
}
