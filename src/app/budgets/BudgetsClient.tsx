"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import type { Category } from "@/types";

interface BudgetItem {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  exceeded: boolean;
  category: Category;
}

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
}

export default function BudgetsClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ categoryId: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function fetchBudgets() {
    fetch(`/api/budgets?month=${month}&year=${year}`)
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setBudgets(Array.isArray(d) ? d : []);
      })
      .catch((err) => console.error("[budgets]", err));
  }

  useEffect(() => { fetchBudgets(); }, [month, year]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setCategories(Array.isArray(d) ? d.filter((c: Category) => c.type === "EXPENSE") : []);
      })
      .catch((err) => console.error("[budgets categories]", err));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId || !form.amount) return;
    setLoading(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount), month, year }),
    });
    setLoading(false);
    if (res.ok) {
      toast("Bütçe kaydedildi.");
      setShowForm(false);
      setForm({ categoryId: "", amount: "" });
      fetchBudgets();
    } else {
      toast("Kaydedilemedi.", "error");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Bütçe silindi."); fetchBudgets(); }
    else toast("Silinemedi.", "error");
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  const exceededCount = budgets.filter((b) => b.exceeded).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Bütçeler</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "İptal" : "+ Yeni"}
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3">
        <button onClick={prevMonth} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg px-2">‹</button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg px-2">›</button>
      </div>

      {/* Exceeded alert */}
      {exceededCount > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            {exceededCount} kategoride bütçen aşıldı.
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Seç...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aylık Limit (₺)</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">Kaydet</Button>
          </form>
        </Card>
      )}

      {/* Budget list */}
      {budgets.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Henüz bütçe yok"
          description="Kategorilere aylık harcama limiti belirle."
          ctaLabel="İlk bütçeyi ekle"
          ctaHref="#"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((b) => {
            const pct = Math.min((b.spent / b.amount) * 100, 100);
            const isOver = b.exceeded;
            const isWarning = !isOver && pct >= 80;

            return (
              <Card key={b.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.category.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{b.category.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">Aşıldı!</span>}
                    {isWarning && <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">%{Math.round(pct)}</span>}
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors text-lg"
                      aria-label="Sil"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-indigo-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 text-right">
                  {formatCurrency(Math.max(b.amount - b.spent, 0))} kaldı
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
