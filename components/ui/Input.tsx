"use client";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "tel";
  error?: string;
  hint?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  hint,
  disabled = false,
  autoComplete,
  className = "",
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-muted font-inter text-sm font-medium">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={[
          "bg-cream-dark text-ink font-inter text-base",
          "rounded-xl px-4 py-3",
          "border border-transparent outline-none",
          "focus:border-forest transition-colors",
          "placeholder:text-muted/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-red-500 focus:border-red-500" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {error && (
        <p className="text-red-600 font-inter text-xs">{error}</p>
      )}

      {hint && !error && (
        <p className="text-muted font-inter text-xs">{hint}</p>
      )}
    </div>
  );
}
