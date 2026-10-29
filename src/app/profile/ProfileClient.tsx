"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const settingsLinks = [
  { href: "/analytics", icon: "📈", label: "Analiz", desc: "6 aylık gelir/gider trendi" },
  { href: "/recurring", icon: "🔁", label: "Tekrarlayan İşlemler", desc: "Otomatik işlem yönetimi" },
  { href: "/categories", icon: "🏷️", label: "Kategoriler", desc: "Kategori ekle veya düzenle" },
];

export default function ProfileClient({ email, name }: { email: string; name: string }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Profil</h2>

      {/* Avatar + info */}
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
          {(name || email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          {name && <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{name}</p>}
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
        </div>
      </Card>

      {/* Settings links */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Özellikler</p>
        <Card className="p-0 overflow-hidden">
          {settingsLinks.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                ${idx < settingsLinks.length - 1 ? "border-b border-slate-50 dark:border-slate-700/50" : ""}`}
            >
              <span className="text-xl w-8 text-center flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <span className="text-slate-300 dark:text-slate-600 text-sm">›</span>
            </Link>
          ))}
        </Card>
      </div>

      {/* Preferences */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Tercihler</p>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <span className="text-xl w-8 text-center">{theme === "dark" ? "🌙" : "☀️"}</span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {theme === "dark" ? "Karanlık Mod" : "Aydınlık Mod"}
              </p>
            </div>
            <button
              onClick={toggle}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                theme === "dark" ? "bg-indigo-500" : "bg-slate-300"
              }`}
              aria-label="Tema değiştir"
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                theme === "dark" ? "left-5" : "left-0.5"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-4">
              <span className="text-xl w-8 text-center">💳</span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Üyelik</p>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950 px-2.5 py-1 rounded-full">
              Ücretsiz
            </span>
          </div>
        </Card>
      </div>

      {/* Account */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Hesap</p>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <span className="text-xl w-8 text-center">🚪</span>
            <span className="text-sm font-medium">Çıkış Yap</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
