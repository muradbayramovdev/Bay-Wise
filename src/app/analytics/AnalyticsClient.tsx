"use client";

import Card from "@/components/ui/Card";
import TrendChart from "@/components/ui/TrendChart";
import { useEffect, useState } from "react";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  expenseByCategory: { name: string; color: string; icon: string; total: number }[];
}

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

export default function AnalyticsClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch(`/api/summary?month=${month}&year=${year}`)
      .then((r) => r.text())
      .then((text) => { if (text) setSummary(JSON.parse(text)); });
  }, [month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Analiz</h2>

      {/* 6-month trend */}
      <TrendChart />

      {/* Month selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl">‹</button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl">›</button>
      </div>

      {/* Monthly breakdown */}
      {summary && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Gelir", value: fmt(summary.totalIncome), color: "text-green-600" },
              { label: "Gider", value: fmt(summary.totalExpense), color: "text-red-500" },
              { label: "Net", value: fmt(summary.net), color: summary.net >= 0 ? "text-indigo-600" : "text-red-500" },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </Card>
            ))}
          </div>

          {summary.expenseByCategory.length > 0 && (
            <Card>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Kategoriye Göre Gider</p>
              <div className="flex flex-col gap-3">
                {summary.expenseByCategory.map((cat) => {
                  const pct = summary.totalExpense > 0 ? (cat.total / summary.totalExpense) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{cat.icon} {cat.name}</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {fmt(cat.total)} · %{Math.round(pct)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
