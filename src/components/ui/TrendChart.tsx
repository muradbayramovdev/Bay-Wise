"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "./Card";

interface TrendPoint {
  label: string;
  income: number;
  expense: number;
}

function formatK(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "income" ? "Gelir" : "Gider"}: {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function TrendChart() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trend")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Son 6 Ay Trendi
      </p>
      {!hasData ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-sm text-slate-400">Henüz yeterli veri yok.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatK}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {value === "income" ? "Gelir" : "Gider"}
                </span>
              )}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
