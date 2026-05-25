"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flag,
  Minus,
  Plus,
  Trophy,
} from "lucide-react";
import { useRoundStore } from "@/lib/store";
import { strokesOnHole, scoreToPar } from "@/lib/handicap";
import { calculateSkins } from "@/lib/game-logic";
import { cn, formatMoney } from "@/lib/utils";
import type { SkinsConfig, SkinResult } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, string> = {
  Albatross: "text-purple-600 bg-purple-50",
  Eagle: "bg-gold/10 text-gold",
  Birdie: "text-forest bg-forest/10",
  Par: "text-ink bg-cream-dark",
  Bogey: "text-orange-500 bg-orange-50",
  Double: "text-red-500 bg-red-50",
  Triple: "text-red-700 bg-red-100",
};

function scoreColor(label: string) {
  for (const [key, cls] of Object.entries(SCORE_COLORS)) {
    if (label.startsWith(key)) return cls;
  }
  return "text-ink bg-cream-dark";
}

// ─── Score Adjuster ───────────────────────────────────────────────────────────

interface ScoreAdjusterProps {
  playerId: string;
  playerName: string;
  playerHandicap: number;
  ghinLinked: boolean;
  holePar: number;
  holeHandicap: number;
  isNet: boolean;
  score: number;
  onChangeScore: (score: number) => void;
}

function ScoreAdjuster({
  playerName,
  playerHandicap,
  ghinLinked,
  holePar,
  holeHandicap,
  isNet,
  score,
  onChangeScore,
}: ScoreAdjusterProps) {
  const strokes = strokesOnHole(playerHandicap, holeHandicap);
  const effectiveScore = isNet ? score - strokes : score;
  const label = score > 0 ? scoreToPar(effectiveScore, holePar) : "—";
  const clr = score > 0 ? scoreColor(label) : "text-muted bg-cream-dark";

  const initials = playerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-card"
    >
      {/* Player header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-ink truncate">{playerName}</p>
            {ghinLinked && (
              <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded font-medium">
                GHIN
              </span>
            )}
          </div>
          <p className="text-xs text-muted">HCP {playerHandicap.toFixed(1)}</p>
        </div>
        {/* Stroke dots */}
        {strokes > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: strokes }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-forest-light"
              />
            ))}
          </div>
        )}
      </div>

      {/* Score adjuster */}
      <div className="flex items-center gap-4">
        <button
          onPointerDown={() => onChangeScore(Math.max(1, score - 1))}
          className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center active:scale-90 transition-transform"
        >
          <Minus size={20} className="text-ink" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-4xl font-fraunces font-bold text-ink leading-none">
            {score > 0 ? score : "—"}
          </div>
          {score > 0 && (
            <div
              className={cn(
                "inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full",
                clr
              )}
            >
              {label}
            </div>
          )}
          {isNet && strokes > 0 && score > 0 && (
            <p className="text-xs text-muted mt-1">
              Net {score - strokes}
            </p>
          )}
        </div>

        <button
          onPointerDown={() => onChangeScore(Math.min(15, score + 1))}
          className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus size={20} className="text-ink" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Skins History ────────────────────────────────────────────────────────────

function SkinsHistory({ skinResults }: { skinResults: SkinResult[] }) {
  if (skinResults.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-fraunces text-lg text-ink mb-3 px-1">Skins History</h3>
      <div className="space-y-2">
        {skinResults.map((result) => (
          <div
            key={result.holeNumber}
            className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
                <span className="text-sm font-semibold text-ink">
                  {result.holeNumber}
                </span>
              </div>
              <div>
                {result.carriedOver ? (
                  <p className="text-sm text-muted font-medium">Carried Over</p>
                ) : (
                  <p className="text-sm font-semibold text-ink">
                    {result.winnerName ?? "Unclaimed"}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-fraunces font-bold",
                  result.carriedOver ? "text-muted" : "text-forest"
                )}
              >
                {formatMoney(result.pot)}
              </p>
              {result.carriedOver && (
                <p className="text-[10px] text-gold font-medium">POT GROWS</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LivePage() {
  const router = useRouter();
  const { round, updateScore, completeHole, advanceHole, resetRound } =
    useRoundStore();

  const [saving, setSaving] = useState(false);
  const [skinResults, setSkinResults] = useState<SkinResult[]>([]);

  // Redirect if no round
  useEffect(() => {
    if (!round) {
      router.replace("/games");
    }
  }, [round, router]);

  // Recalculate skins on score change
  useEffect(() => {
    if (!round || round.gameType !== "skins") return;
    const results = calculateSkins(
      round.players,
      round.course,
      round.scores,
      round.config as SkinsConfig,
      round.holesCompleted
    );
    setSkinResults(results);
  }, [round]);

  if (!round) return null;

  const currentHoleData = round.course.holeData[round.currentHole - 1];
  const isLastHole = round.currentHole === 18;
  const isFirstHole = round.currentHole === 1;
  const isNet = (round.config as unknown as Record<string, unknown>).scoring === "net";
  const isSkins = round.gameType === "skins";
  const skinsConfig = isSkins ? (round.config as SkinsConfig) : null;

  // Current skin pot
  const currentPot = isSkins
    ? skinResults.reduce((acc, r) => (r.carriedOver ? r.pot : acc), 0) +
      (skinsConfig?.betPerHole ?? 0)
    : 0;

  const getScore = (playerId: string) =>
    round.scores[`${round.currentHole}-${playerId}`] ?? 0;

  const handleSaveHole = async () => {
    setSaving(true);

    // Mark hole completed
    completeHole(round.currentHole);

    await new Promise((r) => setTimeout(r, 200));

    if (isLastHole) {
      // Navigate to summary
      setSaving(false);
      router.push("/summary");
    } else {
      advanceHole();
      setSaving(false);
    }
  };

  const handlePrevHole = () => {
    if (!isFirstHole) {
      useRoundStore.setState((state) => ({
        round: state.round
          ? { ...state.round, currentHole: state.round.currentHole - 1 }
          : null,
      }));
    }
  };

  const allScoresEntered = round.players.every(
    (p) => (round.scores[`${round.currentHole}-${p.id}`] ?? 0) > 0
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-forest px-4 pt-safe pb-4">
        <div className="flex items-center justify-between mb-4 pt-3">
          <button
            onClick={() => {
              if (confirm("End round? Your progress will be saved.")) {
                router.push("/summary");
              }
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <p className="text-white/70 text-xs uppercase tracking-widest font-medium">
              {round.course.name}
            </p>
            <p className="text-white text-sm font-medium capitalize mt-0.5">
              {round.gameType === "stroke"
                ? "Stroke Play"
                : round.gameType.charAt(0).toUpperCase() +
                  round.gameType.slice(1)}
            </p>
          </div>
          <button
            onClick={() => router.push("/summary")}
            className="text-white/70 hover:text-white transition-colors"
          >
            <Trophy size={20} />
          </button>
        </div>

        {/* Hole navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevHole}
            disabled={isFirstHole}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 disabled:opacity-30 active:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          <div className="text-center">
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-5xl font-fraunces font-bold text-white leading-none">
                {round.currentHole}
              </span>
              <span className="text-white/50 text-lg">/18</span>
            </div>
            <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">
              Hole
            </p>
          </div>

          <button
            onClick={() => {
              if (round.currentHole < 18) advanceHole();
            }}
            disabled={isLastHole}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 disabled:opacity-30 active:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Hole info */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">
              Par
            </p>
            <p className="text-white font-fraunces text-xl font-bold">
              {currentHoleData.par}
            </p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">
              Yards
            </p>
            <p className="text-white font-fraunces text-xl font-bold">
              {currentHoleData.yards}
            </p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-white/50 text-[10px] uppercase tracking-wide">
              HCP
            </p>
            <p className="text-white font-fraunces text-xl font-bold">
              {currentHoleData.handicap}
            </p>
          </div>
          {isSkins && currentPot > 0 && (
            <>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white/50 text-[10px] uppercase tracking-wide">
                  Pot
                </p>
                <p className="text-gold font-fraunces text-xl font-bold">
                  {formatMoney(currentPot)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Skins carryover badge */}
        {isSkins && currentPot > (skinsConfig?.betPerHole ?? 0) && (
          <div className="mt-3 bg-gold/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <Flag size={14} className="text-gold" />
            <p className="text-gold text-xs font-medium">
              Carryover pot — {formatMoney(currentPot)} on the line!
            </p>
          </div>
        )}
      </div>

      {/* Score cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={round.currentHole}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {round.players.map((player) => (
              <ScoreAdjuster
                key={player.id}
                playerId={player.id}
                playerName={player.name}
                playerHandicap={player.handicap}
                ghinLinked={player.ghinLinked}
                holePar={currentHoleData.par}
                holeHandicap={currentHoleData.handicap}
                isNet={isNet}
                score={getScore(player.id)}
                onChangeScore={(score) =>
                  updateScore(round.currentHole, player.id, score)
                }
              />
            ))}

            {/* Skins history */}
            {isSkins && <SkinsHistory skinResults={skinResults} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Hole button */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream px-4 pb-safe pt-3 shadow-bottom mx-auto max-w-[430px]">
        {!allScoresEntered && (
          <p className="text-center text-xs text-muted mb-2">
            Enter scores for all players to continue
          </p>
        )}
        <button
          onClick={handleSaveHole}
          disabled={!allScoresEntered || saving}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2",
            allScoresEntered && !saving
              ? "bg-forest text-white shadow-lg"
              : "bg-cream-dark text-muted cursor-not-allowed"
          )}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={20} />
              {isLastHole ? "Finish Round" : `Save Hole ${round.currentHole}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
