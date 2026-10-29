"use client";

import { useEffect, useRef } from "react";

interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  type?: "INCOME" | "EXPENSE";
  autoFocus?: boolean;
}

const KEYS = ["1","2","3","4","5","6","7","8","9",".",  "0","⌫"];

export default function AmountInput({ value, onChange, type = "EXPENSE", autoFocus }: AmountInputProps) {
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) displayRef.current?.focus();
  }, [autoFocus]);

  function press(key: string) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    // Only one decimal point
    if (key === "." && value.includes(".")) return;
    // Max 2 decimal places
    const dotIdx = value.indexOf(".");
    if (dotIdx !== -1 && value.length - dotIdx > 2) return;
    // Max 10 digits total
    if (value.replace(".", "").length >= 10) return;
    // Prevent leading zeros
    if (key !== "." && value === "0") { onChange(key); return; }

    onChange(value + key);
  }

  const display = value || "0";
  const isLarge = display.length <= 6;
  const isMedium = display.length <= 9;

  const accentColor = type === "INCOME" ? "text-green-500" : "text-red-500";
  const keyActive = type === "INCOME"
    ? "bg-green-50 dark:bg-green-950 active:bg-green-100 dark:active:bg-green-900"
    : "bg-red-50 dark:bg-red-950 active:bg-red-100 dark:active:bg-red-900";

  return (
    <div className="flex flex-col gap-4">
      {/* Display */}
      <div
        ref={displayRef}
        tabIndex={0}
        className="flex items-center justify-center gap-2 py-4 outline-none"
        aria-label="Tutar"
      >
        <span className={`font-bold text-2xl ${accentColor} opacity-60`}>₺</span>
        <span
          className={`font-extrabold tracking-tight text-slate-900 dark:text-white transition-all
            ${isLarge ? "text-6xl" : isMedium ? "text-4xl" : "text-3xl"}`}
        >
          {display}
        </span>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={`
              h-14 rounded-2xl text-xl font-semibold
              text-slate-800 dark:text-slate-100
              bg-slate-100 dark:bg-slate-800
              ${keyActive}
              transition-all active:scale-95 select-none
              ${key === "⌫" ? "text-slate-500 dark:text-slate-400" : ""}
              ${key === "." ? "text-slate-500 dark:text-slate-400 text-2xl" : ""}
            `}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
