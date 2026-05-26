"use client";

import type { StablefordConfig, StablefordFormat } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";

interface StablefordFormProps {
  config: StablefordConfig;
  onChange: (config: StablefordConfig) => void;
}

const FORMATS: { value: StablefordFormat; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "modified", label: "Modified" },
];

const STANDARD_POINTS = [
  { score: "Eagle (−2)", pts: "4 pts" },
  { score: "Birdie (−1)", pts: "3 pts" },
  { score: "Par (E)", pts: "2 pts" },
  { score: "Bogey (+1)", pts: "1 pt" },
  { score: "Double+ (≥+2)", pts: "0 pts" },
];

const MODIFIED_POINTS = [
  { score: "Eagle (−2)", pts: "+5 pts" },
  { score: "Birdie (−1)", pts: "+2 pts" },
  { score: "Par (E)", pts: "0 pts" },
  { score: "Bogey (+1)", pts: "−1 pt" },
  { score: "Double+ (≥+2)", pts: "−3 pts" },
];

export default function StablefordForm({ config, onChange }: StablefordFormProps) {
  const update = <K extends keyof StablefordConfig>(key: K, value: StablefordConfig[K]) =>
    onChange({ ...config, [key]: value });

  const pointsTable = config.format === "standard" ? STANDARD_POINTS : MODIFIED_POINTS;

  return (
    <div className="flex flex-col gap-6">
      <ScoringToggle
        value={config.scoring}
        onChange={(v) => update("scoring", v)}
      />

      {/* Format */}
      <div>
        <label className="font-inter text-sm font-medium text-ink block mb-2">
          Format
        </label>
        <div className="flex rounded-xl overflow-hidden bg-cream-dark p-1 gap-1">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => update("format", f.value)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-inter text-sm font-semibold transition-all",
                config.format === f.value
                  ? "bg-forest text-white shadow-sm"
                  : "text-muted active:opacity-70"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Points table */}
      <div className="bg-cream-dark rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-ink/5">
          <p className="font-inter text-ink text-sm font-semibold">
            📊 {config.format === "standard" ? "Standard" : "Modified (PGA)"} Points
          </p>
        </div>
        {pointsTable.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between px-4 py-2.5",
              i < pointsTable.length - 1 && "border-b border-ink/5"
            )}
          >
            <span className="font-inter text-ink text-sm">{row.score}</span>
            <span
              className={cn(
                "font-inter text-sm font-semibold",
                config.format === "modified" && row.pts.startsWith("−")
                  ? "text-red-500"
                  : "text-forest"
              )}
            >
              {row.pts}
            </span>
          </div>
        ))}
      </div>

      <BetSlider
        label="Dollar Per Point"
        value={config.dollarPerPoint}
        onChange={(v) => update("dollarPerPoint", v)}
        min={1}
        max={20}
        prefix="$"
        suffix="per point"
      />
    </div>
  );
}
