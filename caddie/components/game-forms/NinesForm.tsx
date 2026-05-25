"use client";

import type { NinesConfig } from "@/lib/types";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";
import Toggle from "@/components/ui/Toggle";

interface NinesFormProps {
  config: NinesConfig;
  onChange: (config: NinesConfig) => void;
}

export default function NinesForm({ config, onChange }: NinesFormProps) {
  const update = <K extends keyof NinesConfig>(key: K, value: NinesConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      <ScoringToggle
        value={config.scoring}
        onChange={(v) => update("scoring", v)}
      />

      {/* Info card */}
      <div className="bg-forest/8 border border-forest/15 rounded-xl p-4">
        <p className="font-inter text-forest text-sm font-semibold mb-2">
          🎯 5-3-1 Point System
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">Low score</span>
            <span className="font-inter text-forest text-sm font-semibold">5 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">Middle score</span>
            <span className="font-inter text-forest text-sm font-semibold">3 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">High score</span>
            <span className="font-inter text-forest text-sm font-semibold">1 pt</span>
          </div>
          <div className="h-px bg-forest/10 my-1" />
          <p className="font-inter text-muted text-xs">
            Ties split points evenly (e.g., tied for low = 4-4-1)
          </p>
        </div>
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

      <div className="flex flex-col gap-4">
        <Toggle
          checked={config.blitz}
          onChange={(v) => update("blitz", v)}
          label="Blitz"
          description="Win by 2+ strokes and take all 9 points"
        />
      </div>
    </div>
  );
}
