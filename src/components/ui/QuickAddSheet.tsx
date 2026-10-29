"use client";

import { useEffect, useState } from "react";
import { useQuickAdd } from "@/context/QuickAddContext";
import { useToast } from "@/context/ToastContext";
import AmountInput from "@/components/ui/AmountInput";
import CategoryPicker from "@/components/ui/CategoryPicker";
import type { Category } from "@/types";

export default function QuickAddSheet({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, close } = useQuickAdd();
  const toast = useToast();

  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const d = JSON.parse(text);
        setCategories(Array.isArray(d) ? d : []);
      });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setCategoryId("");
      setType("EXPENSE");
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const filtered = categories.filter((c) => c.type === type);

  async function handleSubmit() {
    if (!amount || !categoryId) return;
    setLoading(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), type, categoryId, date: new Date().toISOString() }),
    });

    setLoading(false);
    if (res.ok) { toast("İşlem eklendi."); close(); onSuccess?.(); }
    else toast("Eklenemedi.", "error");
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={close} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {/* Type toggle */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => { setType(t); setCategoryId(""); }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all
                    ${type === t
                      ? t === "EXPENSE" ? "bg-red-500 text-white shadow-sm" : "bg-green-500 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                    }`}>
                  {t === "EXPENSE" ? "Gider" : "Gelir"}
                </button>
              ))}
            </div>
            <button onClick={close}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              ×
            </button>
          </div>

          {/* Amount display + numpad */}
          <AmountInput value={amount} onChange={setAmount} type={type} autoFocus={isOpen} />

          {/* Category row */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Kategori</p>
            <CategoryPicker categories={filtered} selected={categoryId} onSelect={setCategoryId} />
          </div>

          {/* Save */}
          <button
            onClick={handleSubmit}
            disabled={loading || !amount || amount === "0" || !categoryId}
            className="mt-4 w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base
              hover:bg-indigo-700 active:scale-95 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
              flex items-center justify-center"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : "Kaydet"
            }
          </button>
        </div>
      </div>
    </>
  );
}
