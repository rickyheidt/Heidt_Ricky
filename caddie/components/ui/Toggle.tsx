"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 min-h-[44px] ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={handleToggle}
    >
      {/* Label + Description */}
      {(label || description) && (
        <div className="flex flex-col gap-0.5 flex-1">
          {label && (
            <span className="font-inter text-sm font-medium text-ink">
              {label}
            </span>
          )}
          {description && (
            <span className="font-inter text-xs text-muted">{description}</span>
          )}
        </div>
      )}

      {/* Toggle track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          // Prevent double-fire when both button and div click
          e.stopPropagation();
          handleToggle();
        }}
        className={`
          relative inline-flex shrink-0 items-center
          w-[51px] h-[31px] rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2
          ${checked ? "bg-forest" : "bg-muted/40"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {/* Thumb */}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`
            absolute top-[2px]
            w-[27px] h-[27px] rounded-full bg-white
            shadow-[0_2px_4px_rgba(0,0,0,0.25)]
          `}
          style={{ left: checked ? "calc(100% - 29px)" : "2px" }}
        />
      </button>
    </div>
  );
}
