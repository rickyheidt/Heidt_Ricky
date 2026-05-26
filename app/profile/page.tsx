"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  Unlink,
  LogOut,
  Pencil,
  X,
  Save,
  User as UserIcon,
  CalendarDays,
  MapPin,
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

function formatBirthday(iso: string): string {
  // iso like "1990-06-15"
  const [year, month, day] = iso.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut, unlinkGhin, linkGhin, updateUser } =
    useAuthStore();
  const [ghinOpen, setGhinOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Handicap editing
  const [editingHandicap, setEditingHandicap] = useState(false);
  const [handicapInput, setHandicapInput] = useState("");

  // Account info editing
  const [editingAccount, setEditingAccount] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [birthdayInput, setBirthdayInput] = useState("");
  const [homeClubInput, setHomeClubInput] = useState("");

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

  const startEditAccount = () => {
    setNameInput(user.name);
    setBirthdayInput(user.birthday ?? "");
    setHomeClubInput(user.homeClub ?? "");
    setEditingAccount(true);
  };

  const handleSaveAccount = () => {
    const trimmed = nameInput.trim();
    updateUser({
      name: trimmed || user.name,
      birthday: birthdayInput || undefined,
      homeClub: homeClubInput.trim() || undefined,
    });
    setEditingAccount(false);
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

        {/* ── GHIN / Handicap Card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: "easeOut" }}
        >
          {user.ghinLinked ? (
            /* Linked state — forest green */
            <div className="bg-forest rounded-2xl p-5 shadow-card relative overflow-hidden">
              <span className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
              <span className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full border-[16px] border-white/5 pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gold text-white font-inter text-xs font-semibold px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  GHIN Linked
                </span>
              </div>

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
                  <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
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
            /* Not linked — editable handicap */
            <div className="flex flex-col gap-3">
              <div className="bg-forest rounded-2xl p-5 shadow-card relative overflow-hidden">
                <span className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
                <span className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full border-[16px] border-white/5 pointer-events-none" />

                {!editingHandicap && (
                  <button
                    onClick={() => {
                      setHandicapInput(String(user.handicap ?? ""));
                      setEditingHandicap(true);
                    }}
                    className="absolute top-4 right-4 text-white/60 active:text-white transition-colors p-1 z-10"
                    aria-label="Edit handicap"
                  >
                    <Pencil size={18} />
                  </button>
                )}

                {editingHandicap ? (
                  <div className="flex flex-col gap-3 relative z-10">
                    <p className="font-inter text-white/60 text-sm font-medium">
                      Handicap Index
                    </p>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={handicapInput}
                      onChange={(e) => setHandicapInput(e.target.value)}
                      placeholder="18.0"
                      className="bg-white/10 text-white font-fraunces text-3xl font-bold rounded-xl px-4 py-3 border border-transparent outline-none focus:border-white/30 transition-colors placeholder:text-white/30 w-full"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const val = parseFloat(handicapInput);
                          if (!isNaN(val)) updateUser({ handicap: val });
                          setEditingHandicap(false);
                        }}
                        className="flex-1 bg-gold text-white font-inter font-semibold text-sm rounded-xl py-2.5 active:scale-[0.97] transition-transform"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingHandicap(false)}
                        className="flex-1 border border-white/30 text-white font-inter font-semibold text-sm rounded-xl py-2.5 active:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <p className="font-inter text-white/60 text-sm font-medium mb-1">
                      Handicap Index
                    </p>
                    <p className="font-fraunces text-white text-6xl font-bold leading-none">
                      {formatHandicap(user.handicap)}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setGhinOpen(true)}
                className="font-inter text-muted text-sm active:opacity-60 transition-opacity text-center"
              >
                Link GHIN Account
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Stats Row ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
        >
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <div className="bg-cream-dark rounded-2xl p-4 shadow-card shrink-0 flex-1 min-w-[100px]">
              <p className="font-fraunces text-ink text-2xl font-bold">
                {user.stats.roundsPlayed}
              </p>
              <p className="font-inter text-muted text-xs mt-0.5 leading-tight">
                Rounds Played
              </p>
            </div>

            <div className="bg-cream-dark rounded-2xl p-4 shadow-card shrink-0 flex-1 min-w-[110px]">
              <p className="font-fraunces text-ink text-2xl font-bold">
                {formatMoney(user.stats.lifetimeWinnings)}
              </p>
              <p className="font-inter text-muted text-xs mt-0.5 leading-tight">
                Lifetime Winnings
              </p>
            </div>

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

        {/* ── Account Info ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          <p className="font-inter text-muted text-xs font-semibold uppercase tracking-wider px-1">
            Account Info
          </p>

          <div className="bg-cream-dark rounded-2xl shadow-card overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink/5">
              <p className="font-inter text-ink text-sm font-semibold">
                Personal Details
              </p>
              {editingAccount ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingAccount(false)}
                    className="text-muted active:opacity-60 transition-opacity"
                    aria-label="Cancel"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={handleSaveAccount}
                    className="flex items-center gap-1.5 bg-forest text-white font-inter font-semibold text-xs px-3 py-1.5 rounded-lg active:opacity-80 transition-opacity"
                  >
                    <Save size={13} />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditAccount}
                  className="text-muted active:text-ink transition-colors p-1"
                  aria-label="Edit account info"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            {/* Name row */}
            <div className="px-5 py-3.5 border-b border-ink/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon size={14} className="text-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-muted text-xs mb-0.5">Name</p>
                {editingAccount ? (
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white border border-ink/10 text-ink font-inter text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-forest/50 transition-colors"
                  />
                ) : (
                  <p className="font-inter text-ink text-sm font-medium truncate">
                    {user.name}
                  </p>
                )}
              </div>
            </div>

            {/* Birthday row */}
            <div className="px-5 py-3.5 border-b border-ink/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays size={14} className="text-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-muted text-xs mb-0.5">Birthday</p>
                {editingAccount ? (
                  <input
                    type="date"
                    value={birthdayInput}
                    onChange={(e) => setBirthdayInput(e.target.value)}
                    className="w-full bg-white border border-ink/10 text-ink font-inter text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-forest/50 transition-colors"
                  />
                ) : (
                  <p className="font-inter text-ink text-sm font-medium">
                    {user.birthday ? formatBirthday(user.birthday) : (
                      <span className="text-muted">Not set</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Home Club row */}
            <div className="px-5 py-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={14} className="text-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-muted text-xs mb-0.5">Home Club</p>
                {editingAccount ? (
                  <input
                    type="text"
                    value={homeClubInput}
                    onChange={(e) => setHomeClubInput(e.target.value)}
                    placeholder="e.g. Pebble Beach Golf Links"
                    className="w-full bg-white border border-ink/10 text-ink font-inter text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-forest/50 transition-colors"
                  />
                ) : (
                  <p className="font-inter text-ink text-sm font-medium truncate">
                    {user.homeClub ? user.homeClub : (
                      <span className="text-muted">Not set</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="bg-cream-dark rounded-2xl shadow-card overflow-hidden px-5 py-3.5">
            <p className="font-inter text-muted text-xs mb-0.5">Email</p>
            <p className="font-inter text-ink text-sm font-medium truncate">
              {user.email}
            </p>
            <p className="font-inter text-muted/60 text-[11px] mt-0.5">
              Email cannot be changed
            </p>
          </div>

          {/* Sign Out */}
          <p className="font-inter text-muted text-xs font-semibold uppercase tracking-wider px-1 mt-1">
            Account
          </p>
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
