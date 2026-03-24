"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SettingsPanel({ settings }: { settings: any[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <div key={setting.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{setting.key}</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-slate-100">
                {JSON.stringify(setting.valueJson, null, 2)}
              </pre>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                startTransition(async () => {
                  await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: setting.key,
                      valueJson: setting.valueJson
                    })
                  });
                  setMessage(`Saved ${setting.key}`);
                })
              }
            >
              {pending ? "Saving..." : "Re-save"}
            </Button>
          </div>
        </div>
      ))}
      {message ? <p className="text-sm text-success">{message}</p> : null}
    </div>
  );
}
