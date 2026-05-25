"use client";

import type { StrokeConfig, WagerType } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";

interface StrokeFormProps {
  config: StrokeConfig;
  onChange: (config: StrokeConfig) => void;
}

const WAGER_TYPES: { value: WagerType; label: string }[] = [
  { value: "winner", label: "Winner Takes All" },
  { value: "pay_two", label: "Pay 1st & 2nd" },
];

export default function StrokeForm({ config, onChange }: StrokeFormProps) {
  const update = <K extends keyof StrokeConfig>(key: K, value: StrokeConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      <ScoringToggle
        value={config.scoring}
        onChange={(v) => update("scoring", v)}
      />

      {/* Wager Type */}
      <div>
        <label className="font-inter text-sm font-medium text-ink block mb-2">
          Wager Type
        </label>
        <div className="flex flex-col gap-2">
          {WAGER_TYPES.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => update("wagerType", w.value)}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-inter text-sm font-semibold text-left transition-all",
                config.wagerType === w.value
                  ? "bg-forest text-white shadow-sm"
                  : "bg-cream-dark text-muted active:opacity-70"
              )}
            >
              {w.label}
              {w.value === "pay_two" && config.wagerType === "pay_two" && (
                <span className="block font-inter text-xs text-white/70 font-normal mt-0.5">
                  70% to winner · 30% to runner-up
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <BetSlider
        label="Buy-In Per Player"
        value={config.buyIn}
        onChange={(v) => update("buyIn", v)}
        min={1}
        max={100}
        prefix="$"
        suffix="per player"
      />
    </div>
  );
}
