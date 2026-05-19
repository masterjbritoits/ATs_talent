"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type FunnelDataItem = { stage: string; value: string; count: number };

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f59e0b", "#10b981",
];

export function FunnelChart({ data }: { data: FunnelDataItem[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={item.value} className="flex items-center gap-3">
          <span className="w-36 text-xs text-slate-600 truncate shrink-0">{item.stage}</span>
          <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-semibold text-white transition-all"
              style={{
                width: `${Math.max((item.count / max) * 100, 4)}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            >
              {item.count > 0 ? item.count : ""}
            </div>
          </div>
          <span className="w-8 text-right text-xs text-slate-500 shrink-0">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
