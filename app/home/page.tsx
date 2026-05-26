"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Flag,
  Users,
  PenLine,
  Disc3,
  CheckCircle2,
  ChevronRight,
  Play,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { GAMES } from "@/lib/data";
import { formatHandicap } from "@/lib/utils";
import BottomNav from "@/components/ui/BottomNav";
import GhinModal from "@/components/modals/GhinModal";

// Greeting based on hour
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    label: "Start Group Game",
    icon: Flag,
    href: "/games",
    accent: "text-forest",
    bg: "bg-forest/10",
  },
  {
    label: "Friends",
    icon: Users,
    href: "/friends",
    accent: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Post Score",
    icon: PenLine,
    href: "/games",
    accent: "text-forest-light",
    bg: "bg-forest-light/10",
  },
  {
    label: "Track Solo Round",
    icon: Disc3,
    href: "/games",
    accent: "text-muted",
    bg: "bg-muted/10",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [ghinOpen, setGhinOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!user || !isAuthenticated) return null;

  const wolfGame = GAMES.find((g) => g.id === "wolf")!;
  const featuredGames = GAMES.slice(0, 4);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <span className="font-fraunces text-forest text-2xl font-bold tracking-tight">
          SKINZ
        </span>
        <button
          className="relative text-forest active:opacity-60 transition-opacity p-1"
          aria-label="Notifications"
        >
          <Bell size={24} />
          {/* Unread dot */}
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-cream" />
        </button>
      </div>

      {/* ── Greeting ────────────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <p className="font-inter text-muted text-sm">{getGreeting()},</p>
        <h1 className="font-fraunces text-ink text-3xl font-semibold leading-tight">
          {firstName}
        </h1>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* ── Handicap Card ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <button
            onClick={() => {
              if (!user.ghinLinked) router.push("/profile");
            }}
            className="w-full text-left bg-forest rounded-2xl p-5 shadow-card relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {/* Decorative rings */}
            <span className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
            <span className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full border-[16px] border-white/5 pointer-events-none" />

            {/* GHIN badge */}
            <div className="flex items-center justify-between mb-3">
              {user.ghinLinked ? (
                <span className="inline-flex items-center gap-1.5 bg-gold text-white font-inter text-xs font-semibold px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  GHIN Linked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 border border-white/30 text-white/70 font-inter text-xs font-medium px-3 py-1 rounded-full">
                  Not linked
                </span>
              )}
            </div>

            {/* Handicap number */}
            <p className="font-fraunces text-white text-6xl font-bold leading-none mb-1">
              {formatHandicap(user.handicap)}
            </p>
            <p className="font-inter text-white/60 text-sm font-medium">
              Handicap Index
            </p>

            {/* GHIN number or link prompt */}
            <div className="mt-4">
              {user.ghinLinked && user.ghin ? (
                <p className="font-inter text-white/50 text-xs">
                  GHIN #{user.ghin}
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="font-inter text-white/70 text-sm font-medium">
                    Tap to edit handicap
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setGhinOpen(true);
                    }}
                    className="font-inter text-white/40 text-xs active:text-white/60 transition-colors text-left"
                  >
                    or Link GHIN
                  </button>
                </div>
              )}
            </div>
          </button>
        </motion.div>

        {/* ── Featured Wolf Game Card ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07, ease: "easeOut" }}
        >
          <Link href="/games" className="block">
            <div className="bg-cream-dark rounded-2xl p-5 shadow-card relative overflow-hidden active:scale-[0.98] transition-transform">
              {/* Live badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex items-center gap-1.5">
                  <span className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-red-500" />
                </span>
                <span className="font-inter text-xs font-bold text-red-500 tracking-wide uppercase">
                  Now Live
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{wolfGame.icon}</span>
                    <h3 className="font-fraunces text-ink text-xl font-semibold">
                      {wolfGame.name}
                    </h3>
                  </div>
                  <p className="font-inter text-muted text-sm">
                    {wolfGame.tagline}
                  </p>
                </div>

                <button className="bg-gold text-white font-inter font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 active:bg-gold-light transition-colors shrink-0 ml-3">
                  <Play size={14} fill="white" />
                  Play
                </button>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── Quick Actions Grid ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: "easeOut" }}
        >
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <div className="bg-cream-dark rounded-xl p-4 shadow-card active:shadow-card-hover active:scale-[0.97] transition-all">
                    <div
                      className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon size={20} className={action.accent} />
                    </div>
                    <p className="font-inter text-ink text-sm font-semibold leading-tight">
                      {action.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* ── Games Section ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.21, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fraunces text-ink text-xl font-semibold">
              Games
            </h2>
            <Link
              href="/games"
              className="font-inter text-forest text-sm font-medium flex items-center gap-0.5 active:opacity-70 transition-opacity"
            >
              See all
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Game cards list */}
          <div className="flex flex-col gap-2">
            {featuredGames.map((game) => (
              <Link key={game.id} href="/games">
                <div className="bg-cream-dark rounded-xl px-4 py-3.5 shadow-card flex items-center gap-4 active:scale-[0.98] transition-transform">
                  <span className="text-2xl shrink-0">{game.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-ink text-sm font-semibold truncate">
                      {game.name}
                    </p>
                    <p className="font-inter text-muted text-xs truncate">
                      {game.tagline}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── GHIN Modal ──────────────────────────────────────────────── */}
      <GhinModal isOpen={ghinOpen} onClose={() => setGhinOpen(false)} />

      {/* ── Bottom Nav ──────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
