"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useQuickAdd } from "@/context/QuickAddContext";
import AiChat from "@/components/ui/AiChat";

const navItems = [
  { href: "/dashboard", label: "Ana Sayfa", icon: "🏠" },
  { href: "/transactions", label: "İşlemler", icon: "📋" },
  { href: "/budgets", label: "Bütçeler", icon: "🎯" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

// Desktop sidebar shows all pages
const sidebarExtras = [
  { href: "/analytics", label: "Analiz", icon: "📈" },
  { href: "/recurring", label: "Tekrarlayan", icon: "🔁" },
  { href: "/categories", label: "Kategoriler", icon: "🏷️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { open } = useQuickAdd();
  const [aiOpen, setAiOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-4 fixed left-0 top-0">
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">BayWise</h1>
            <p className="text-xs text-slate-400 mt-0.5">Finans Takibi</p>
          </div>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tema değiştir"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {[...navItems, ...sidebarExtras].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors mb-1"
          >
            <span>✦</span> AI Asistan
          </button>
          <button
            onClick={open}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors mb-1"
          >
            <span>+</span> Hızlı Ekle
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>🚪</span> Çıkış
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav — 4 items, 44px touch targets ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors"
              >
                <span className={`text-xl leading-none transition-transform ${active ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-medium leading-none transition-colors ${
                  active ? "text-indigo-600" : "text-slate-400 dark:text-slate-500"
                }`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile AI floating button */}
      <button
        onClick={() => setAiOpen(true)}
        className="md:hidden fixed bottom-20 left-4 z-40 w-10 h-10 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
        aria-label="AI Asistan"
      >
        ✦
      </button>

      <AiChat isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
