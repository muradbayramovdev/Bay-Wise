"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SmartInsights from "@/components/ui/SmartInsights";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  month: number;
  year: number;
  expenseByCategory: { name: string; color: string; icon: string; total: number }[];
}

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyFull(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function DashboardClient({ userName }: { userName: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/summary?month=${month}&year=${year}`)
      .then((r) => r.text())
      .then((text) => {
        if (!text) { setLoading(false); return; }
        setSummary(JSON.parse(text));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstName = userName ? userName.split(" ")[0] : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting */}
      <div>
        <p className="text-sm text-slate-400">
          {firstName ? `Merhaba, ${firstName} 👋` : "Merhaba 👋"}
        </p>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xl"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {MONTHS[month - 1]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xl"
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : summary ? (
        <>
          {/* Net balance — hero element */}
          <div className="flex flex-col items-center text-center py-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Net Bakiye</p>
            <p className={`text-5xl font-extrabold tracking-tight ${
              summary.net >= 0 ? "text-slate-900 dark:text-white" : "text-red-500"
            }`}>
              {formatCurrency(summary.net)}
            </p>
            {summary.net < 0 && (
              <p className="text-xs text-red-400 mt-1">Bu ay giderler geliri aştı</p>
            )}
          </div>

          {/* Income / Expense row */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">↑</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Gelir</p>
                <p className="text-sm font-bold text-green-600">{formatCurrencyFull(summary.totalIncome)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm font-bold">↓</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Gider</p>
                <p className="text-sm font-bold text-red-500">{formatCurrencyFull(summary.totalExpense)}</p>
              </div>
            </Card>
          </div>

          {/* Expense breakdown */}
          {summary.expenseByCategory.length > 0 ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gider Dağılımı</p>
                <Link href="/analytics" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                  Tüm analiz →
                </Link>
              </div>

              <div className="flex gap-4 items-center">
                {/* Donut */}
                <div className="flex-shrink-0">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={summary.expenseByCategory}
                        dataKey="total"
                        cx="50%"
                        cy="50%"
                        outerRadius={46}
                        innerRadius={28}
                        strokeWidth={0}
                      >
                        {summary.expenseByCategory.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrencyFull(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {summary.expenseByCategory.slice(0, 4).map((cat) => {
                    const pct = summary.totalExpense > 0
                      ? Math.round((cat.total / summary.totalExpense) * 100)
                      : 0;
                    return (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                          {cat.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                          %{pct}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon="📊"
              title="Henüz işlem yok"
              description="İlk gelirini veya giderini ekle, bakiyeni anında gör."
              ctaLabel="İlk işlemi ekle"
              ctaHref="/transactions/new"
              hint="Sağ alttaki + butonunu da kullanabilirsin"
            />
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/transactions"
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xl">📋</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">İşlemler</span>
            </Link>
            <Link href="/budgets"
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xl">🎯</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Bütçeler</span>
            </Link>
          </div>

          {/* Smart Insights */}
          <SmartInsights month={month} year={year} />
        </>
      ) : null}
    </div>
  );
}
