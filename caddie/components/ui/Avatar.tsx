"use client";

import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  online?: boolean;
}

const sizeConfig: Record<AvatarSize, { container: string; text: string; dot: string; dotSize: number }> = {
  sm: {
    container: "w-8 h-8",
    text: "text-xs",
    dot: "w-2.5 h-2.5 bottom-0 right-0",
    dotSize: 8,
  },
  md: {
    container: "w-10 h-10",
    text: "text-sm",
    dot: "w-3 h-3 bottom-0 right-0",
    dotSize: 10,
  },
  lg: {
    container: "w-14 h-14",
    text: "text-lg",
    dot: "w-3.5 h-3.5 bottom-0.5 right-0.5",
    dotSize: 14,
  },
  xl: {
    container: "w-20 h-20",
    text: "text-2xl",
    dot: "w-4 h-4 bottom-1 right-1",
    dotSize: 20,
  },
};

// Deterministic color palette derived from name hash
const BG_COLORS = [
  "bg-forest text-white",
  "bg-forest-light text-white",
  "bg-gold text-white",
  "bg-muted text-white",
  "bg-ink text-white",
];

function nameHash(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = "md", src, online = false }: AvatarProps) {
  const cfg = sizeConfig[size];
  const initials = getInitials(name);
  const colorClass = BG_COLORS[nameHash(name) % BG_COLORS.length];

  return (
    <div className={`relative inline-flex shrink-0 ${cfg.container}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${cfg.dotSize * 4}px`}
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className={`${cfg.container} rounded-full flex items-center justify-center font-inter font-semibold ${cfg.text} ${colorClass}`}
        >
          {initials}
        </div>
      )}

      {online && (
        <span
          className={`absolute ${cfg.dot} rounded-full bg-green-500 border-2 border-cream`}
        />
      )}
    </div>
  );
}
