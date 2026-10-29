"use client";

import { useRef, useState } from "react";

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

const THRESHOLD = 72; // px to reveal actions
const MAX_SWIPE = 144; // max drag distance

export default function SwipeableRow({ children, onEdit, onDelete }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return;

    // Only allow left swipe (negative dx)
    const clamped = Math.max(-MAX_SWIPE, Math.min(0, dx + offset));
    // Prevent page scroll when swiping horizontally
    e.preventDefault();
    setOffset(clamped);
  }

  function onTouchEnd() {
    setIsDragging(false);
    isHorizontal.current = null;
    // Snap open or closed
    setOffset(offset < -THRESHOLD / 2 ? -THRESHOLD : 0);
  }

  function close() {
    setOffset(0);
  }

  const isOpen = offset <= -THRESHOLD / 2;

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed behind */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={() => { close(); onEdit(); }}
          className="w-16 flex flex-col items-center justify-center bg-indigo-500 text-white text-xs font-semibold gap-1 transition-opacity"
          style={{ opacity: isOpen ? 1 : 0.6 }}
          aria-label="Düzenle"
        >
          <span className="text-base">✎</span>
          Düzenle
        </button>
        <button
          onClick={() => { close(); onDelete(); }}
          className="w-16 flex flex-col items-center justify-center bg-red-500 text-white text-xs font-semibold gap-1 transition-opacity"
          style={{ opacity: isOpen ? 1 : 0.6 }}
          aria-label="Sil"
        >
          <span className="text-base">🗑</span>
          Sil
        </button>
      </div>

      {/* Foreground row */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.25,1,0.5,1)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        // Close on tap when open
        onClick={() => { if (isOpen) close(); }}
        className="relative bg-white dark:bg-slate-800 will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
