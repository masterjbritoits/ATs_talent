"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

import { Card } from "@/components/ui/card";

export function ApplicationsTrendChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <Card className="h-[320px]">
      <h3 className="text-lg font-semibold">Applications Over Time</h3>
      <div className="mt-6 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#183b6b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#183b6b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#183b6b" fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RoleDistributionChart({ data }: { data: { role: string; count: number }[] }) {
  return (
    <Card className="h-[320px]">
      <h3 className="text-lg font-semibold">Applications By Role</h3>
      <div className="mt-6 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="role" hide />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#12889b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
