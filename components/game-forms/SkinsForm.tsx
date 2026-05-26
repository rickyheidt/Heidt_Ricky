"use client";

import type { SkinsConfig } from "@/lib/types";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";
import Toggle from "@/components/ui/Toggle";

interface SkinsFormProps {
  config: SkinsConfig;
  onChange: (config: SkinsConfig) => void;
}

export default function SkinsForm({ config, onChange }: SkinsFormProps) {
  const update = <K extends keyof SkinsConfig>(key: K, value: SkinsConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      <ScoringToggle
        value={config.scoring}
        onChange={(v) => update("scoring", v)}
      />

      <BetSlider
        label="Bet Per Hole"
        value={config.betPerHole}
        onChange={(v) => update("betPerHole", v)}
        min={1}
        max={50}
        prefix="$"
        suffix="per hole"
      />

      <div className="flex flex-col gap-4">
        <Toggle
          checked={config.carryover}
          onChange={(v) => update("carryover", v)}
          label="Carryover"
          description="Ties carry the pot to the next hole"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.validation}
          onChange={(v) => update("validation", v)}
          label="Validation"
          description="Must par next hole to keep skin"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.parRule}
          onChange={(v) => update("parRule", v)}
          label="Par Rule"
          description="Must be par or better to win"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.birdieBonus}
          onChange={(v) => update("birdieBonus", v)}
          label="Birdie Bonus"
          description="Birdies win 2 skins"
        />
      </div>
    </div>
  );
}
