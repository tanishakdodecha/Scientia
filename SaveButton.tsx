"use client";

import { useEffect, useState } from "react";
import { isSaved, toggleSaved, type SavedItem } from "@/lib/bookmarks";

export function SaveButton({ item, compact = false }: { item: SavedItem; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isSaved(item.slug));
    sync();
    window.addEventListener("scientia:saved", sync);
    return () => window.removeEventListener("scientia:saved", sync);
  }, [item.slug]);

  return (
    <button
      type="button"
      className={`save-btn${saved ? " saved" : ""}${compact ? " compact" : ""}`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleSaved(item));
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12v18l-6-4.5L6 21z" />
      </svg>
      {!compact ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
