"use client";

import { useEffect, useState } from "react";

interface InsightsData {
  insights: string[];
  generatedAt: string;
}

interface SmartInsightsProps {
  month: number;
  year: number;
}

export default function SmartInsights({ month, year }: SmartInsightsProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchInsights(force = false) {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(false);

    try {
      const url = `/api/insights?month=${month}&year=${year}${force ? "&force=1" : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const d = await res.json();
      setData(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-base">✦</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Smart Insights</p>
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">AI</span>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing || loading}
          className="text-xs text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-40 flex items-center gap-1"
          aria-label="Yenile"
        >
          <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
          {refreshing ? "Analiz ediliyor..." : "Yenile"}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex flex-col gap-2.5 py-1">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" style={{ width: `${60 + i * 15}%` }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-2">
            <span className="text-base">💳</span>
            <p className="text-sm text-slate-400">AI servisi şu an kullanılamıyor.</p>
            <button onClick={() => fetchInsights()} className="text-xs text-indigo-500 hover:underline ml-auto">Tekrar dene</button>
          </div>
        ) : !data?.insights?.length ? (
          <div className="flex items-center gap-2 py-2">
            <span className="text-base">💤</span>
            <p className="text-sm text-slate-400">Analiz için yeterli veri yok.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 py-1">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">{i + 1}</span>
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{insight}</p>
              </div>
            ))}
            {data.generatedAt && (
              <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">
                {new Date(data.generatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} güncellendi
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
