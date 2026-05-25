"use client";

import { cn } from "@/lib/utils";
import type { ScoringMode } from "@/lib/types";

interface ScoringToggleProps {
  value: ScoringMode;
  onChange: (value: ScoringMode) => void;
}

export default function ScoringToggle({ value, onChange }: ScoringToggleProps) {
  return (
    <div>
      <label className="font-inter text-sm font-medium text-ink block mb-2">
        Scoring
      </label>
      <div className="flex rounded-xl overflow-hidden bg-cream-dark p-1 gap-1">
        {(["gross", "net"] as ScoringMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "flex-1 py-2.5 rounded-lg font-inter text-sm font-semibold capitalize transition-all",
              value === mode
                ? "bg-forest text-white shadow-sm"
                : "text-muted active:opacity-70"
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
