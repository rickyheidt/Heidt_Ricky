"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  Unlink,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { formatHandicap, formatMoney, cn } from "@/lib/utils";
import BottomNav from "@/components/ui/BottomNav";
import Avatar from "@/components/ui/Avatar";
import GhinModal from "@/components/modals/GhinModal";

function timeSince(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut, unlinkGhin, linkGhin } =
    useAuthStore();
  const [ghinOpen, setGhinOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!user || !isAuthenticated) return null;

  const winRate =
    user.stats.roundsPlayed > 0
      ? Math.round((user.stats.wins / user.stats.roundsPlayed) * 100)
      : 0;

  const handleSync = async () => {
    if (!user.ghin) return;
    setSyncing(true);
    await linkGhin(user.ghin, "");
    setSyncing(false);
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-5">
        <h1 className="font-fraunces text-ink text-3xl font-semibold">
          Profile
        </h1>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* ── Avatar Section ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 py-2"
        >
          <Avatar name={user.name} size="xl" />
          <div className="text-center">
            <h2 className="font-fraunces text-ink text-2xl font-semibold">
              {user.name}
            </h2>
            <p className="font-inter text-muted text-sm mt-0.5">{user.email}</p>
          </div>
        </motion.div>

        {/* ── GHIN Card ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: "easeOut" }}
        >
          {user.ghinLinked ? (
            /* Linked state — forest green */
            <div className="bg-forest rounded-2xl p-5 shadow-card relative overflow-hidden">
              {/* Decorative rings */}
              <span className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
              <span className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full border-[16px] border-white/5 pointer-events-none" />

              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gold text-white font-inter text-xs font-semibold px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  GHIN Linked
                </span>
              </div>

              {/* Handicap */}
              <p className="font-fraunces text-white text-6xl font-bold leading-none mb-1">
                {formatHandicap(user.handicap)}
              </p>
              <p className="font-inter text-white/60 text-sm font-medium mb-1">
                Handicap Index
              </p>

              {user.ghin && (
                <p className="font-inter text-white/50 text-xs mb-4">
                  GHIN #{user.ghin}
                </p>
              )}

              {user.ghinSyncedAt && (
                <p className="font-inter text-white/40 text-xs mb-5">
                  Last synced {timeSince(user.ghinSyncedAt)}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2",
                    "border border-white/30 text-white font-inter font-semibold text-sm",
                    "rounded-xl py-2.5 active:bg-white/10 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <RefreshCw
                    size={15}
                    className={syncing ? "animate-spin" : ""}
                  />
                  {syncing ? "Syncing..." : "Sync Handicap"}
                </button>
                <button
                  onClick={unlinkGhin}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-400/40 text-red-300 font-inter font-semibold text-sm rounded-xl py-2.5 active:bg-red-500/10 transition-colors"
                >
                  <Unlink size={15} />
                  Unlink
                </button>
              </div>
            </div>
          ) : (
            /* Not linked state — cream-dark */
            <button
              onClick={() => setGhinOpen(true)}
              className="w-full bg-cream-dark rounded-2xl p-5 shadow-card active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex flex-col items-center gap-3 py-3">
                <span className="font-fraunces text-forest text-5xl font-bold tracking-wider">
                  GHIN
                </span>
                <p className="font-inter text-muted text-sm text-center leading-relaxed">
                  Connect your GHIN account to sync your official handicap
                  index.
                </p>
                <span className="inline-flex items-center justify-center bg-forest text-white font-inter font-semibold text-sm px-5 py-2.5 rounded-xl mt-1">
                  Link GHIN Account
                </span>
              </div>
            </button>
          )}
        </motion.div>

        {/* ── Stats Row ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
        >
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {/* Rounds Played */}
            <div className="bg-cream-dark rounded-2xl p-4 shadow-card shrink-0 flex-1 min-w-[100px]">
              <p className="font-fraunces text-ink text-2xl font-bold">
                {user.stats.roundsPlayed}
              </p>
              <p className="font-inter text-muted text-xs mt-0.5 leading-tight">
                Rounds Played
              </p>
            </div>

            {/* Lifetime Winnings */}
            <div className="bg-cream-dark rounded-2xl p-4 shadow-card shrink-0 flex-1 min-w-[110px]">
              <p className="font-fraunces text-ink text-2xl font-bold">
                {formatMoney(user.stats.lifetimeWinnings)}
              </p>
              <p className="font-inter text-muted text-xs mt-0.5 leading-tight">
                Lifetime Winnings
              </p>
            </div>

            {/* Win Rate */}
            <div className="bg-cream-dark rounded-2xl p-4 shadow-card shrink-0 flex-1 min-w-[90px]">
              <p className="font-fraunces text-ink text-2xl font-bold">
                {winRate}%
              </p>
              <p className="font-inter text-muted text-xs mt-0.5 leading-tight">
                Win Rate
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Settings Section ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          {/* Home Club row */}
          <div className="bg-cream-dark rounded-2xl shadow-card overflow-hidden">
            <button className="w-full flex items-center gap-4 px-5 py-4 active:bg-ink/5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
                <Home size={18} className="text-forest" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-inter text-ink text-sm font-semibold">
                  Home Club
                </p>
                <p className="font-inter text-muted text-xs mt-0.5">
                  {user.homeClub || "Not set"}
                </p>
              </div>
              <ChevronRight size={18} className="text-muted shrink-0" />
            </button>
          </div>

          {/* Account section */}
          <p className="font-inter text-muted text-xs font-semibold uppercase tracking-wider px-1 mt-1">
            Account
          </p>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 font-inter font-semibold text-sm rounded-2xl py-4 active:bg-red-100 transition-colors shadow-card"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </motion.div>
      </div>

      {/* ── GHIN Modal ────────────────────────────────────────────── */}
      <GhinModal isOpen={ghinOpen} onClose={() => setGhinOpen(false)} />

      {/* ── Bottom Nav ────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
