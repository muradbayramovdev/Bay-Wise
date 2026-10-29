"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: {
    transactions: number;
    categories: number;
    budgets: number;
    recurring: number;
  };
}

interface AdminData {
  users: UserRow[];
  stats: { totalUsers: number; totalTransactions: number };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  function fetchData() {
    fetch("/api/admin")
      .then((r) => r.text())
      .then((text) => {
        if (!text) return;
        setData(JSON.parse(text));
        setLoading(false);
      })
      .catch(console.error);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`"${email}" kullanıcısını silmek istediğine emin misin? Tüm verileri silinecek.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Kullanıcı silindi."); fetchData(); }
    else { const d = await res.json(); toast(d.error || "Silinemedi.", "error"); }
  }

  async function handleRoleToggle(id: string, current: "USER" | "ADMIN") {
    const next = current === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    if (res.ok) { toast(`Rol güncellendi: ${next}`); fetchData(); }
    else toast("Güncellenemedi.", "error");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Paneli</h1>
            <p className="text-sm text-slate-400 mt-0.5">BayWise yönetim ekranı</p>
          </div>
          <a href="/dashboard" className="text-sm text-indigo-600 hover:underline">← Dashboard</a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Toplam Kullanıcı", value: data.stats.totalUsers, icon: "👥" },
                { label: "Toplam İşlem", value: data.stats.totalTransactions, icon: "📋" },
                { label: "Admin", value: data.users.filter(u => u.role === "ADMIN").length, icon: "🔑" },
                { label: "Bu Ay Kayıt", value: data.users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, icon: "🆕" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Users table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kullanıcılar</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left px-5 py-3 font-medium">Kullanıcı</th>
                      <th className="text-left px-4 py-3 font-medium">Kayıt</th>
                      <th className="text-center px-4 py-3 font-medium">İşlem</th>
                      <th className="text-center px-4 py-3 font-medium">Bütçe</th>
                      <th className="text-center px-4 py-3 font-medium">Tekrarlayan</th>
                      <th className="text-center px-4 py-3 font-medium">Rol</th>
                      <th className="text-center px-4 py-3 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                            {u.name || "—"}
                            {u.id === currentUserId && <span className="ml-1 text-xs text-indigo-500">(sen)</span>}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">{u._count.transactions}</td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">{u._count.budgets}</td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">{u._count.recurring}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            disabled={u.id === currentUserId}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors
                              ${u.role === "ADMIN"
                                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {u.role}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={u.id === currentUserId}
                            className="text-slate-300 hover:text-red-400 transition-colors text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Sil"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
