"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import SwipeableRow from "@/components/ui/SwipeableRow";
import { useToast } from "@/context/ToastContext";
import type { Transaction } from "@/types";

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
}

function groupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (same(d, today)) return "Bugün";
  if (same(d, yesterday)) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function groupByDate(txs: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    const label = groupLabel(t.date);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(t);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function useDebounce<T>(value: T, delay = 350): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

export default function TransactionsClient() {
  const now = new Date();
  const router = useRouter();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const debouncedSearch = useDebounce(search);
  const dateRangeActive = !!(dateFrom || dateTo);
  const abortRef = useRef<AbortController | null>(null);

  function fetchTransactions() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const params = new URLSearchParams();
    if (dateRangeActive) {
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
    } else {
      params.set("month", String(month));
      params.set("year", String(year));
    }
    if (filter !== "ALL") params.set("type", filter);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/transactions?${params}`, { signal: controller.signal })
      .then((r) => r.text())
      .then((text) => {
        if (!text) { setTransactions([]); setLoading(false); return; }
        setTransactions(JSON.parse(text) ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") { console.error(err); setLoading(false); }
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTransactions(); }, [month, year, filter, debouncedSearch, dateFrom, dateTo]);

  async function handleDelete(id: string) {
    if (!confirm("Bu işlemi silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) { toast("İşlem silindi."); fetchTransactions(); }
    else toast("Silinemedi.", "error");
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  const groups = groupByDate(transactions);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">İşlemler</h2>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg">×</button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || dateRangeActive
              ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-300 text-indigo-600"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
          }`}
        >
          {dateRangeActive ? "📅 Aktif" : "📅"}
        </button>
      </div>

      {/* Date range */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Başlangıç</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Bitiş</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400" />
            </div>
          </div>
          {dateRangeActive && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-400 hover:text-red-600 text-left">
              Tarihi temizle
            </button>
          )}
        </div>
      )}

      {/* Month picker */}
      {!dateRangeActive && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-2 py-1">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl">‹</button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl">›</button>
        </div>
      )}

      {/* Type tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}>
            {f === "ALL" ? "Tümü" : f === "INCOME" ? "Gelir" : "Gider"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="İşlem bulunamadı"
          description={debouncedSearch ? `"${debouncedSearch}" için sonuç yok.` : "Bu dönemde işlem yok."}
          ctaLabel={debouncedSearch ? undefined : "Yeni işlem ekle"}
          ctaHref={debouncedSearch ? undefined : "/transactions/new"}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {label}
                </p>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {formatCurrency(Math.abs(
                    items.reduce((s, t) => t.type === "EXPENSE" ? s - t.amount : s + t.amount, 0)
                  ))}
                </p>
              </div>

              {/* Swipeable rows grouped in a card */}
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                {items.map((t, idx) => (
                  <div key={t.id} className={idx < items.length - 1 ? "border-b border-slate-50 dark:border-slate-700/50" : ""}>
                    <SwipeableRow
                      onEdit={() => router.push(`/transactions/${t.id}/edit`)}
                      onDelete={() => handleDelete(t.id)}
                    >
                      <div className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-800">
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: t.category.color + "18" }}
                        >
                          {t.category.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {t.category.name}
                          </p>
                          {t.note && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{t.note}</p>
                          )}
                        </div>

                        {/* Amount */}
                        <p className={`text-base font-bold flex-shrink-0 ${
                          t.type === "INCOME" ? "text-green-600" : "text-slate-800 dark:text-slate-100"
                        }`}>
                          {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                        </p>
                      </div>
                    </SwipeableRow>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-center text-xs text-slate-300 dark:text-slate-600 py-1">
            {transactions.length} işlem · sola kaydır: düzenle / sil
          </p>
        </div>
      )}
    </div>
  );
}
