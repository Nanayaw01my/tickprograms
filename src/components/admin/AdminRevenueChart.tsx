"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  month: string;
  revenue: number;
}

export function AdminRevenueChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-400">
        No revenue data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `GH₵${v.toLocaleString()}`} />
        <Tooltip
          formatter={(value) => [`GH₵${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
        />
        <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
