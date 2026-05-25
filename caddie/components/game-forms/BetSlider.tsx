"use client";

import { cn } from "@/lib/utils";

interface BetSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function BetSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = "$",
  suffix,
  className,
}: BetSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Label + current value */}
      <div className="flex items-center justify-between">
        <label className="font-inter text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-fraunces text-forest text-xl font-bold">
          {prefix}
          {value}
          {suffix && (
            <span className="font-inter text-sm font-medium text-muted ml-1">
              {suffix}
            </span>
          )}
        </span>
      </div>

      {/* Range slider */}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute inset-y-0 flex items-center w-full">
          <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Native input (transparent, on top) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-forest
            [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(26,77,58,0.4)]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-forest
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between">
        <span className="font-inter text-xs text-muted">
          {prefix}
          {min}
        </span>
        <span className="font-inter text-xs text-muted">
          {prefix}
          {max}
        </span>
      </div>
    </div>
  );
}
