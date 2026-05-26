"use client";

import type { MatchConfig, MatchFormat } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";

interface MatchFormProps {
  config: MatchConfig;
  onChange: (config: MatchConfig) => void;
}

const FORMATS: { value: MatchFormat; label: string }[] = [
  { value: "1v1", label: "1v1" },
  { value: "2v2", label: "2v2" },
];

export default function MatchForm({ config, onChange }: MatchFormProps) {
  const update = <K extends keyof MatchConfig>(key: K, value: MatchConfig[K]) =>
    onChange({ ...config, [key]: value });

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

      <BetSlider
        label="Match Bet"
        value={config.matchBet}
        onChange={(v) => update("matchBet", v)}
        min={1}
        max={100}
        prefix="$"
        suffix="total"
      />

      {/* Info note */}
      <div className="bg-forest/8 border border-forest/15 rounded-xl p-4">
        <p className="font-inter text-forest text-sm">
          {config.format === "2v2"
            ? "Best ball of each team compares on every hole."
            : "Win a hole, go 1-up. First to lead by more holes than remain wins."}
        </p>
      </div>
    </div>
  );
}
