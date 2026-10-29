"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import type { Category } from "@/types";

interface RecurringItem {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string | null;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  nextRunAt: string;
  lastRunAt: string | null;
  isActive: boolean;
  category: Category;
}

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Her gün",
  WEEKLY: "Her hafta",
  MONTHLY: "Her ay",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function RecurringClient() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    categoryId: "",
    note: "",
    frequency: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
  });
  const toast = useToast();

  function fetchItems() {
    fetch("/api/recurring")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setItems(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }

  useEffect(() => {
    fetchItems();
    fetch("/api/categories")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setCategories(Array.isArray(d) ? d : []);
      });
  }, []);

  // Auto-process on mount
  useEffect(() => {
    fetch("/api/recurring/process", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.created > 0) {
          toast(`${d.created} tekrarlayan işlem otomatik oluşturuldu.`, "info");
          fetchItems();
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setLoading(false);
    if (res.ok) {
      toast("Tekrarlayan işlem eklendi.");
      setShowForm(false);
      setForm({ type: "EXPENSE", amount: "", categoryId: "", note: "", frequency: "MONTHLY", startDate: new Date().toISOString().split("T")[0] });
      fetchItems();
    } else {
      toast("Eklenemedi.", "error");
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/recurring/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) { fetchItems(); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tekrarlayan işlemi silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Silindi."); fetchItems(); }
    else toast("Silinemedi.", "error");
  }

  async function handleProcess() {
    setProcessing(true);
    const res = await fetch("/api/recurring/process", { method: "POST" });
    const d = await res.json();
    setProcessing(false);
    toast(d.created > 0 ? `${d.created} işlem oluşturuldu.` : "Bekleyen işlem yok.", d.created > 0 ? "success" : "info");
    fetchItems();
  }

  const filtered = categories.filter((c) => c.type === form.type);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tekrarlayan İşlemler</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleProcess} loading={processing}>Çalıştır</Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? "İptal" : "+ Yeni"}</Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, type: t, categoryId: "" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
                    ${form.type === t
                      ? t === "EXPENSE" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                  {t === "EXPENSE" ? "Gider" : "Gelir"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tutar (₺)</label>
              <input type="number" min="0.01" step="0.01" placeholder="0.00" required
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                <option value="">Seç...</option>
                {filtered.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            {/* Frequency */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sıklık</label>
              <div className="flex gap-2">
                {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((f) => (
                  <button key={f} type="button"
                    onClick={() => setForm({ ...form, frequency: f })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
                      ${form.frequency === f ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                    {FREQ_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Start date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Başlangıç Tarihi</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Not (opsiyonel)</label>
              <input type="text" placeholder="Kısa bir not..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            <Button type="submit" loading={loading} className="w-full">Kaydet</Button>
          </form>
        </Card>
      )}

      {/* List */}
      {items.length === 0 ? (
        <EmptyState icon="🔁" title="Tekrarlayan işlem yok"
          description="Kira, fatura gibi düzenli işlemleri otomatikleştir." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className={!item.isActive ? "opacity-50" : ""}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.category.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.category.name}</p>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {FREQ_LABELS[item.frequency]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sonraki: {formatDate(item.nextRunAt)}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold ${item.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                    {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount)}
                  </span>
                  <button onClick={() => toggleActive(item.id, item.isActive)}
                    className={`w-8 h-5 rounded-full transition-colors relative ${item.isActive ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    aria-label={item.isActive ? "Durdur" : "Başlat"}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.isActive ? "left-3.5" : "left-0.5"}`} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors text-lg" aria-label="Sil">×</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
        Tekrarlayan işlemler sayfa açıldığında otomatik kontrol edilir.
      </p>
    </div>
  );
}
