"use client";

import type { WolfConfig } from "@/lib/types";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";
import Toggle from "@/components/ui/Toggle";

interface WolfFormProps {
  config: WolfConfig;
  onChange: (config: WolfConfig) => void;
}

export default function WolfForm({ config, onChange }: WolfFormProps) {
  const update = <K extends keyof WolfConfig>(key: K, value: WolfConfig[K]) =>
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
          🐺 Point Values
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">Team (2v2)</span>
            <span className="font-inter text-forest text-sm font-semibold">1 pt per player</span>
          </div>
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">Lone Wolf</span>
            <span className="font-inter text-forest text-sm font-semibold">2 pts per player</span>
          </div>
          <div className="flex justify-between">
            <span className="font-inter text-ink text-sm">Blind Wolf</span>
            <span className="font-inter text-forest text-sm font-semibold">3 pts per player</span>
          </div>
        </div>
      </div>

      <BetSlider
        label="Point Value"
        value={config.pointValue}
        onChange={(v) => update("pointValue", v)}
        min={1}
        max={10}
        prefix="$"
        suffix="per point"
      />

      <div className="flex flex-col gap-4">
        <Toggle
          checked={config.pigOption}
          onChange={(v) => update("pigOption", v)}
          label="Pig Option"
          description="A passed player can force the Wolf to take them as partner"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.tripleLastThree}
          onChange={(v) => update("tripleLastThree", v)}
          label="Triple Last 3 Holes"
          description="Points tripled on holes 16, 17, and 18"
        />
      </div>
    </div>
  );
}
