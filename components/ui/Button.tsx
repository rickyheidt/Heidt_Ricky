"use client";

import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-forest text-white active:bg-forest-light",
  secondary: "bg-cream-dark text-forest active:bg-cream",
  ghost: "bg-transparent text-forest border border-forest active:bg-forest/5",
  danger: "bg-red-600 text-white active:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 min-h-[44px]",
  md: "text-base px-5 py-3 min-h-[44px]",
  lg: "text-lg px-6 py-3.5 min-h-[52px]",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-inter font-semibold rounded-xl",
        "transition-transform active:scale-[0.97]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}
