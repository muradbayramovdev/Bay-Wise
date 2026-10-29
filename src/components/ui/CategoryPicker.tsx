"use client";

import type { Category } from "@/types";

interface CategoryPickerProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryPicker({ categories, selected, onSelect }: CategoryPickerProps) {
  if (categories.length === 0) {
    return <p className="text-xs text-slate-400 py-2">Kategori yükleniyor...</p>;
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`
              flex-shrink-0 flex flex-col items-center gap-1.5
              w-16 py-2.5 rounded-2xl border transition-all duration-150
              text-xs font-medium select-none active:scale-95
              ${isSelected
                ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }
            `}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: isSelected ? cat.color + "22" : "transparent" }}
            >
              {cat.icon}
            </span>
            <span className="truncate w-full text-center leading-tight px-0.5">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
