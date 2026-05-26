import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number): string {
  const abs = Math.abs(amount);
  const formatted =
    abs >= 1000
      ? `$${(abs / 1000).toFixed(1)}k`
      : `$${abs.toFixed(0)}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatMoneyPrecise(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = `$${abs.toFixed(2)}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatHandicap(handicap: number): string {
  if (handicap < 0) return `+${Math.abs(handicap).toFixed(1)}`;
  return handicap.toFixed(1);
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
