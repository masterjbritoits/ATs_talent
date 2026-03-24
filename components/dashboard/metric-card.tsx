import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  helper,
  icon
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
        {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
      </div>
      {icon ? <div className="rounded-2xl bg-slate-100 p-3">{icon}</div> : null}
    </Card>
  );
}
