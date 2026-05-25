"use client";

import type { NassauConfig, MatchFormat } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";
import Toggle from "@/components/ui/Toggle";

interface NassauFormProps {
  config: NassauConfig;
  onChange: (config: NassauConfig) => void;
}

const FORMATS: { value: MatchFormat; label: string }[] = [
  { value: "1v1", label: "1v1" },
  { value: "2v2", label: "2v2" },
];

export default function NassauForm({ config, onChange }: NassauFormProps) {
  const update = <K extends keyof NassauConfig>(key: K, value: NassauConfig[K]) =>
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
        label="Bet Per Side"
        value={config.betPerSide}
        onChange={(v) => update("betPerSide", v)}
        min={1}
        max={50}
        prefix="$"
      />

      {/* Nassau summary */}
      <div className="bg-forest/5 rounded-xl p-4">
        <p className="font-inter text-forest text-sm font-medium text-center">
          Front ${config.betPerSide} · Back ${config.betPerSide} · Total ${config.betPerSide}
        </p>
        <p className="font-inter text-muted text-xs text-center mt-1">
          Max exposure: ${config.betPerSide * 3}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Toggle
          checked={config.autoPress}
          onChange={(v) => update("autoPress", v)}
          label="Auto-Press at 2-Down"
          description="Automatic press bet when a side falls 2 holes behind"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.manualPress}
          onChange={(v) => update("manualPress", v)}
          label="Manual Presses"
          description="Either side can call a press at any time"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.pressThePress}
          onChange={(v) => update("pressThePress", v)}
          label="Press the Press"
          description="Allow pressing an active press for a third bet"
        />
      </div>
    </div>
  );
}
