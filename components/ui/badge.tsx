import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const toneMap = {
  info: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  primary: "bg-blue-100 text-blue-700"
} as const;

export function Badge({
  className,
  tone = "info",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneMap }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneMap[tone],
        className
      )}
      {...props}
    />
  );
}
