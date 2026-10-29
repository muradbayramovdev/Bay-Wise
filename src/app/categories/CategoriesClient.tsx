"use client";


import type { Category } from "@/types";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
const PRESET_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316",
  "#f59e0b","#22c55e","#10b981","#06b6d4","#0ea5e9",
];

const PRESET_ICONS = ["💰","🛒","🏠","🚗","🍔","💊","🎮","👕","📄","📚","✈️","🎁","💻","📈","💸"];

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "💰", color: "#6366f1", type: "EXPENSE" as "INCOME" | "EXPENSE" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function fetchCategories() {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (!text) return;
        const data = JSON.parse(text);
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("[categories] fetch error:", err));
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      toast("Kategori eklendi.");
      setShowForm(false);
      setForm({ name: "", icon: "💰", color: "#6366f1", type: "EXPENSE" });
      fetchCategories();
    } else {
      toast("Kategori eklenemedi.", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Kategori silindi.");
      fetchCategories();
    } else {
      toast("Silinemedi.", "error");
    }
  }

  const income = categories.filter((c) => c.type === "INCOME");
  const expense = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Kategoriler</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "İptal" : "+ Yeni"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "EXPENSE" })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                  ${form.type === "EXPENSE" ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                Gider
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "INCOME" })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                  ${form.type === "INCOME" ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                Gelir
              </button>
            </div>
            <Input
              label="Kategori Adı"
              placeholder="Örn: Spor"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">İkon</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all
                      ${form.icon === icon ? "bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-400" : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Renk</label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full">Ekle</Button>
          </form>
        </Card>
      )}

      {[{ label: "Gelir Kategorileri", items: income }, { label: "Gider Kategorileri", items: expense }].map(
        ({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>            <div className="flex flex-col gap-2">
              {items.map((cat) => (
                <Card key={cat.id} className="flex items-center gap-3 py-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cat.color + "22" }}
                  >
                    {cat.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                  {cat.isDefault ? (
                    <span className="text-xs text-slate-300 dark:text-slate-600">Varsayılan</span>
                  ) : (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors text-lg"
                      aria-label="Sil"
                    >
                      ×
                    </button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
