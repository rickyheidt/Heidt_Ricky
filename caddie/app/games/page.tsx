"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { GAMES } from "@/lib/data";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/ui/BottomNav";
import Sheet from "@/components/ui/Sheet";

export default function GamesPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleCardTap = (game: Game) => {
    router.push(`/courses?game=${game.id}`);
  };

  const handleInfoTap = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setSelectedGame(game);
  };

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-6">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-forest mb-6 active:opacity-60 transition-opacity min-h-[44px]"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
          <span className="font-inter text-sm font-medium">Home</span>
        </button>

        <h1 className="font-fraunces text-ink text-4xl font-bold leading-tight">
          Choose a Game
        </h1>
        <p className="font-inter text-muted text-base mt-1">
          Select a format to start your round
        </p>
      </div>

      {/* ── Games Grid ──────────────────────────────────────────────── */}
      <div className="px-5 grid grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => handleCardTap(game)}
            className={cn(
              "relative bg-cream-dark rounded-2xl shadow-card p-5 text-left",
              "active:scale-[0.97] transition-transform",
              "flex flex-col gap-3"
            )}
          >
            {/* Info button */}
            <button
              onClick={(e) => handleInfoTap(e, game)}
              className={cn(
                "absolute top-3 right-3",
                "w-8 h-8 flex items-center justify-center",
                "text-muted active:text-forest transition-colors",
                "rounded-full hover:bg-cream"
              )}
              aria-label={`Info about ${game.name}`}
            >
              <Info size={18} />
            </button>

            {/* Icon */}
            <span className="text-4xl leading-none">{game.icon}</span>

            {/* Name */}
            <div>
              <h2 className="font-fraunces text-ink text-lg font-semibold leading-tight">
                {game.name}
              </h2>
              <p className="font-inter text-muted text-xs mt-0.5 leading-snug pr-6">
                {game.tagline}
              </p>
            </div>

            {/* Player count badge */}
            <span className="inline-flex self-start items-center bg-forest/10 text-forest font-inter text-xs font-medium px-2 py-0.5 rounded-full">
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} players`
                : `${game.minPlayers}–${game.maxPlayers} players`}
            </span>
          </button>
        ))}
      </div>

      {/* ── Game Info Bottom Sheet ──────────────────────────────────── */}
      <Sheet
        isOpen={selectedGame !== null}
        onClose={() => setSelectedGame(null)}
      >
        {selectedGame && (
          <div className="flex flex-col gap-5">
            {/* Icon + Name */}
            <div className="flex flex-col items-center text-center gap-2 pb-2">
              <span className="text-6xl leading-none">{selectedGame.icon}</span>
              <h2 className="font-fraunces text-ink text-2xl font-bold">
                {selectedGame.name}
              </h2>
              <p className="font-inter text-muted text-sm">
                {selectedGame.tagline}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-cream-dark rounded-xl p-4">
              <p className="font-inter text-ink text-sm leading-relaxed">
                {selectedGame.summary}
              </p>
            </div>

            {/* How to Play */}
            <div>
              <h3 className="font-fraunces text-ink text-lg font-semibold mb-3">
                How to Play
              </h3>
              <ul className="flex flex-col gap-2.5">
                {selectedGame.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-forest flex items-center justify-center mt-0.5">
                      <span className="font-inter text-white text-[10px] font-bold">
                        {i + 1}
                      </span>
                    </span>
                    <p className="font-inter text-ink text-sm leading-relaxed flex-1">
                      {rule}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                setSelectedGame(null);
                router.push(`/courses?game=${selectedGame.id}`);
              }}
              className={cn(
                "w-full bg-forest text-white font-inter font-semibold text-base",
                "rounded-xl py-4 mt-2",
                "active:bg-forest-light transition-colors"
              )}
            >
              Set Up {selectedGame.name}
            </button>
          </div>
        )}
      </Sheet>

      {/* ── Bottom Nav ──────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
