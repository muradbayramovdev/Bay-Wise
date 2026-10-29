"use client";

import Navbar from "./Navbar";
import QuickAddSheet from "@/components/ui/QuickAddSheet";
import { useQuickAdd } from "@/context/QuickAddContext";
import { useRouter } from "next/navigation";

function FAB() {
  const { open, isOpen } = useQuickAdd();

  return (
    <button
      onClick={open}
      aria-label="Hızlı işlem ekle"
      className={`
        fixed z-40 flex items-center justify-center
        transition-all duration-200 select-none

        /* mobile: bottom center, above bottom nav */
        bottom-[76px] left-1/2 -translate-x-1/2
        w-14 h-14 rounded-full

        /* desktop: bottom right, clear of sidebar */
        md:bottom-8 md:right-8 md:left-auto md:translate-x-0
        md:w-auto md:h-auto md:px-5 md:py-3 md:rounded-2xl

        bg-indigo-600 text-white
        shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900/60
        hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-300/60
        active:scale-95

        ${isOpen ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
      `}
    >
      {/* Mobile: just + icon */}
      <span className="md:hidden text-2xl font-light leading-none">+</span>

      {/* Desktop: icon + label */}
      <span className="hidden md:flex items-center gap-2 text-sm font-semibold">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        İşlem Ekle
      </span>
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="md:ml-56 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>
      <FAB />
      <QuickAddSheet onSuccess={() => router.refresh()} />
    </div>
  );
}
