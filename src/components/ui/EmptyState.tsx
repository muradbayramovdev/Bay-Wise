import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  hint?: string; // small tip below CTA
}

export default function EmptyState({
  icon = "💸",
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  hint,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Icon with soft glow ring */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-inner">
          {icon}
        </div>
        <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-700" />
      </div>

      <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</p>

      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[260px] leading-relaxed mb-6">
          {description}
        </p>
      )}

      {(ctaLabel && (ctaHref || onCtaClick)) && (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900"
            >
              <span className="text-base leading-none">+</span>
              {ctaLabel}
            </Link>
          ) : (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900"
            >
              <span className="text-base leading-none">+</span>
              {ctaLabel}
            </button>
          )}
        </>
      )}

      {hint && (
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-3">{hint}</p>
      )}
    </div>
  );
}
