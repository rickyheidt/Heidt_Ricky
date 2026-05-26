"use client";

import type { ScotchConfig, ScotchPoints, TeamPairing } from "@/lib/types";
import { cn } from "@/lib/utils";
import ScoringToggle from "./ScoringToggle";
import BetSlider from "./BetSlider";
import Toggle from "@/components/ui/Toggle";

interface ScotchFormProps {
  config: ScotchConfig;
  onChange: (config: ScotchConfig) => void;
}

const POINT_SYSTEMS: { value: ScotchPoints; label: string }[] = [
  { value: "5point", label: "5-Point" },
  { value: "6point", label: "6-Point" },
];

const TEAM_PAIRINGS: { value: TeamPairing; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "auto", label: "Auto" },
];

export default function ScotchForm({ config, onChange }: ScotchFormProps) {
  const update = <K extends keyof ScotchConfig>(key: K, value: ScotchConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      <ScoringToggle
        value={config.scoring}
        onChange={(v) => update("scoring", v)}
      />

      {/* Point System */}
      <div>
        <label className="font-inter text-sm font-medium text-ink block mb-2">
          Point System
        </label>
        <div className="flex rounded-xl overflow-hidden bg-cream-dark p-1 gap-1">
          {POINT_SYSTEMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update("pointSystem", p.value)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-inter text-sm font-semibold transition-all",
                config.pointSystem === p.value
                  ? "bg-forest text-white shadow-sm"
                  : "text-muted active:opacity-70"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="font-inter text-muted text-xs mt-2 px-1">
          {config.pointSystem === "5point"
            ? "Best ball wins 2 dots · worst ball loses 2 dots · 1 dot for middle scores"
            : "Best ball + worst ball vs best ball + worst ball · 2 dots for middle ball"}
        </p>
      </div>

      {/* Team Pairing */}
      <div>
        <label className="font-inter text-sm font-medium text-ink block mb-2">
          Team Pairing
        </label>
        <div className="flex rounded-xl overflow-hidden bg-cream-dark p-1 gap-1">
          {TEAM_PAIRINGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update("teamPairing", t.value)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-inter text-sm font-semibold transition-all",
                config.teamPairing === t.value
                  ? "bg-forest text-white shadow-sm"
                  : "text-muted active:opacity-70"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {config.teamPairing === "auto" && (
          <div className="mt-2 bg-gold/10 rounded-xl px-4 py-2.5">
            <p className="font-inter text-gold text-xs font-medium">
              Low + High handicap vs Middle Two
            </p>
          </div>
        )}
      </div>

      <BetSlider
        label="Dollar Per Dot"
        value={config.dollarPerDot}
        onChange={(v) => update("dollarPerDot", v)}
        min={1}
        max={20}
        prefix="$"
        suffix="per dot"
      />

      <div className="flex flex-col gap-4">
        <Toggle
          checked={config.teePress}
          onChange={(v) => update("teePress", v)}
          label="Tee Press"
          description="Teams can press on the tee, doubling dots for that hole"
        />
        <div className="h-px bg-ink/5" />
        <Toggle
          checked={config.gamePress}
          onChange={(v) => update("gamePress", v)}
          label="Game Press"
          description="A trailing team can call a game press to start a new dots match"
        />
      </div>
    </div>
  );
}
