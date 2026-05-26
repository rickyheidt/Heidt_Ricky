"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Flag } from "lucide-react";
import { useRoundStore, useAuthStore } from "@/lib/store";
import { calculateResults, buildPlayerResults, calculateSkins, skinsMoney } from "@/lib/game-logic";
import { cn, formatMoney, ordinal } from "@/lib/utils";
import type { PlayerResult, SkinsConfig } from "@/lib/types";

// ─── Position Badge ───────────────────────────────────────────────────────────

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
        <Trophy size={14} className="text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
      <span className="text-sm font-bold text-muted">{position}</span>
    </div>
  );
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({
  result,
  index,
}: {
  result: PlayerResult;
  index: number;
}) {
  const initials = result.player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const net = result.moneyWon - result.moneyLost;
  const isWinner = result.position === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-2xl p-4 flex items-center gap-4",
        isWinner
          ? "bg-forest text-white shadow-lg"
          : "bg-white shadow-card"
      )}
    >
      <PositionBadge position={result.position} />

      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isWinner ? "bg-white/20" : "bg-cream-dark"
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold",
            isWinner ? "text-white" : "text-ink"
          )}
        >
          {initials}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-semibold truncate",
            isWinner ? "text-white" : "text-ink"
          )}
        >
          {result.player.name}
          {result.player.isHost && (
            <span
              className={cn(
                "ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded",
                isWinner ? "bg-white/20 text-white" : "bg-cream-dark text-muted"
              )}
            >
              You
            </span>
          )}
        </p>
        <p
          className={cn(
            "text-xs mt-0.5",
            isWinner ? "text-white/70" : "text-muted"
          )}
        >
          {net > 0
            ? `Winner · ${formatMoney(net)} won`
            : net < 0
            ? `Down ${formatMoney(Math.abs(net))}`
            : "Break even"}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className={cn(
            "font-fraunces text-xl font-bold",
            net > 0
              ? isWinner
                ? "text-gold"
                : "text-forest"
              : net < 0
              ? isWinner
                ? "text-white/60"
                : "text-red-500"
              : isWinner
              ? "text-white/70"
              : "text-muted"
          )}
        >
          {net > 0 ? `+${formatMoney(net)}` : net < 0 ? `-${formatMoney(Math.abs(net))}` : "$0"}
        </p>
        <p
          className={cn(
            "text-xs",
            isWinner ? "text-white/50" : "text-muted"
          )}
        >
          {ordinal(result.position)} place
        </p>
      </div>
    </motion.div>
  );
}

// ─── Skins Summary ────────────────────────────────────────────────────────────

function SkinsSummarySection({ results: skinResults }: { results: import("@/lib/types").SkinResult[] }) {
  const total = skinResults.reduce(
    (acc, r) => (!r.carriedOver && r.winnerName ? acc + r.pot : acc),
    0
  );

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Flag size={16} className="text-forest" />
        <h3 className="font-fraunces text-base text-ink">Skins Summary</h3>
        <span className="ml-auto text-sm font-medium text-forest">
          {formatMoney(total)} distributed
        </span>
      </div>
      <div className="space-y-1.5">
        {skinResults
          .filter((r) => !r.carriedOver && r.winnerName)
          .map((r) => (
            <div
              key={r.holeNumber}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted">Hole {r.holeNumber}</span>
              <span className="font-medium text-ink">{r.winnerName}</span>
              <span className="text-forest font-semibold">
                {formatMoney(r.pot)}
              </span>
            </div>
          ))}
        {skinResults.filter((r) => !r.carriedOver && r.winnerName).length ===
          0 && (
          <p className="text-muted text-sm text-center py-2">
            No skins won yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const router = useRouter();
  const { round, resetRound } = useRoundStore();
  const { user, updateUser } = useAuthStore();
  const userRef = useRef(user);
  userRef.current = user;

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [skinResults, setSkinResults] = useState<import("@/lib/types").SkinResult[]>([]);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    if (!round) return;

    // Calculate final skin results if skins game
    let finalSkinResults = round.skinResults;
    if (round.gameType === "skins") {
      finalSkinResults = calculateSkins(
        round.players,
        round.course,
        round.scores,
        round.config as SkinsConfig,
        round.holesCompleted
      );
      setSkinResults(finalSkinResults);
    }

    // Calculate money
    const money = calculateResults(
      round.gameType,
      round.players,
      round.course,
      round.scores,
      round.config as unknown as Record<string, unknown>,
      finalSkinResults
    );

    // Build results
    const isNet = (round.config as unknown as Record<string, unknown>).scoring === "net";
    const playerResults = buildPlayerResults(
      round.players,
      money,
      round.scores,
      round.course,
      isNet
    );

    setResults(playerResults);
    setCalculated(true);

    // Update user stats
    const hostResult = playerResults.find((r) => r.player.isHost);
    if (hostResult) {
      const net = hostResult.moneyWon - hostResult.moneyLost;
      const currentUser = userRef.current;
      updateUser({
        stats: {
          roundsPlayed: (currentUser?.stats.roundsPlayed ?? 0) + 1,
          lifetimeWinnings: (currentUser?.stats.lifetimeWinnings ?? 0) + (net > 0 ? net : 0),
          wins: (currentUser?.stats.wins ?? 0) + (hostResult.position === 1 ? 1 : 0),
        },
      });
    }
  }, [round]);

  const handleGoHome = () => {
    resetRound();
    router.push("/home");
  };

  if (!round || !calculated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  const totalPot = results.reduce((acc, r) => acc + r.moneyWon, 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest px-4 pt-safe pb-8">
        <div className="pt-8 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4"
          >
            <Trophy size={36} className="text-gold" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/60 text-sm uppercase tracking-widest font-medium">
              Round Complete
            </p>
            <h1 className="font-fraunces text-3xl font-bold text-white mt-1">
              Final Results
            </h1>
            <p className="text-white/60 text-sm mt-1">{round.course.name}</p>
          </motion.div>

          {/* Game type pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5"
          >
            <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
              {round.gameType === "stroke"
                ? "Stroke Play"
                : round.gameType.charAt(0).toUpperCase() + round.gameType.slice(1)}
              {" · "}
              {(round.config as unknown as Record<string, unknown>).scoring === "net"
                ? "Net"
                : "Gross"}
            </span>
            {totalPot > 0 && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-gold text-xs font-bold">
                  {formatMoney(totalPot)} pot
                </span>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4 -mt-4 space-y-3 pb-32">
        {results.map((result, i) => (
          <ResultRow key={result.player.id} result={result} index={i} />
        ))}

        {/* Skins breakdown */}
        {round.gameType === "skins" && skinResults.length > 0 && (
          <SkinsSummarySection results={skinResults} />
        )}

        {/* Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: results.length * 0.1 + 0.1 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-cream-dark flex items-center justify-between">
            <h3 className="font-fraunces text-base text-ink">Scorecard</h3>
            <span className="text-xs text-muted">
              {round.holesCompleted.length} of 18 holes
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted sticky left-0 bg-cream">
                    Player
                  </th>
                  {round.course.holeData
                    .filter((h) => round.holesCompleted.includes(h.number))
                    .map((h) => (
                      <th
                        key={h.number}
                        className="text-center px-2 py-2 text-xs font-medium text-muted min-w-[32px]"
                      >
                        {h.number}
                      </th>
                    ))}
                  <th className="text-center px-3 py-2 text-xs font-semibold text-ink">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-cream/50">
                  <td className="px-4 py-1 text-xs text-muted sticky left-0 bg-cream/50">
                    Par
                  </td>
                  {round.course.holeData
                    .filter((h) => round.holesCompleted.includes(h.number))
                    .map((h) => (
                      <td
                        key={h.number}
                        className="text-center px-2 py-1 text-xs text-muted"
                      >
                        {h.par}
                      </td>
                    ))}
                  <td className="text-center px-3 py-1 text-xs font-medium text-muted">
                    {round.course.holeData
                      .filter((h) => round.holesCompleted.includes(h.number))
                      .reduce((acc, h) => acc + h.par, 0)}
                  </td>
                </tr>
                {round.players.map((player, pi) => {
                  const completedHoles = round.course.holeData.filter((h) =>
                    round.holesCompleted.includes(h.number)
                  );
                  const grossTotal = completedHoles.reduce(
                    (acc, h) =>
                      acc + (round.scores[`${h.number}-${player.id}`] ?? 0),
                    0
                  );

                  return (
                    <tr
                      key={player.id}
                      className={pi % 2 === 0 ? "bg-white" : "bg-cream/30"}
                    >
                      <td className={cn("px-4 py-2 font-medium text-ink text-xs sticky left-0", pi % 2 === 0 ? "bg-white" : "bg-cream/30")}>
                        {player.name.split(" ")[0]}
                      </td>
                      {completedHoles.map((h) => {
                        const s =
                          round.scores[`${h.number}-${player.id}`] ?? 0;
                        const diff = s - h.par;
                        return (
                          <td
                            key={h.number}
                            className={cn(
                              "text-center px-2 py-2 text-xs font-medium",
                              diff < 0
                                ? "text-forest font-bold"
                                : diff > 1
                                ? "text-red-500"
                                : "text-ink"
                            )}
                          >
                            {s || "—"}
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-2 text-xs font-bold text-ink">
                        {grossTotal || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-cream px-4 pb-safe pt-3">
        <button
          onClick={handleGoHome}
          className="w-full h-14 bg-forest text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
        >
          Back to Home
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
