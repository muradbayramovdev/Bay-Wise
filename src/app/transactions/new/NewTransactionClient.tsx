"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AmountInput from "@/components/ui/AmountInput";
import CategoryPicker from "@/components/ui/CategoryPicker";
import { useToast } from "@/context/ToastContext";
import type { Category } from "@/types";

export default function NewTransactionClient() {
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        const data = JSON.parse(text);
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("[new-transaction] categories error:", err));
  }, []);

  const filtered = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) { setError("Kategori seçmelisin."); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), type, categoryId, note, date }),
    });

    setLoading(false);
    if (res.ok) {
      toast("İşlem başarıyla eklendi.");
      router.push("/transactions");
    } else {
      const data = await res.json();
      const msg = data.error || "Bir hata oluştu.";
      setError(msg);
      toast(msg, "error");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-700 text-xl"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Yeni İşlem</h2>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setType("EXPENSE"); setCategoryId(""); }}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${type === "EXPENSE" ? "bg-red-500 text-white" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"}`}
        >
          Gider
        </button>
        <button
          onClick={() => { setType("INCOME"); setCategoryId(""); }}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${type === "INCOME" ? "bg-green-500 text-white" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"}`}
        >
          Gelir
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AmountInput value={amount} onChange={setAmount} type={type} autoFocus />

        {/* Category picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
          <CategoryPicker categories={filtered} selected={categoryId} onSelect={setCategoryId} />
        </div>

        <Input
          label="Tarih"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Not (opsiyonel)"
          type="text"
          placeholder="Kısa bir not..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
          Kaydet
        </Button>
      </form>
    </div>
  );
}
