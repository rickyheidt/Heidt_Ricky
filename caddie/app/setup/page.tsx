"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X, Users } from "lucide-react";
import { GAMES, COURSES } from "@/lib/data";
import { useAuthStore, useFriendsStore, useRoundStore } from "@/lib/store";
import { cn, formatHandicap } from "@/lib/utils";
import type {
  Player,
  GameType,
  GameConfig,
  SkinsConfig,
  NassauConfig,
  WolfConfig,
  StrokeConfig,
  MatchConfig,
  NinesConfig,
  StablefordConfig,
  ScotchConfig,
} from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

// Game form components
import SkinsForm from "@/components/game-forms/SkinsForm";
import NassauForm from "@/components/game-forms/NassauForm";
import WolfForm from "@/components/game-forms/WolfForm";
import StrokeForm from "@/components/game-forms/StrokeForm";
import MatchForm from "@/components/game-forms/MatchForm";
import NinesForm from "@/components/game-forms/NinesForm";
import StablefordForm from "@/components/game-forms/StablefordForm";
import ScotchForm from "@/components/game-forms/ScotchForm";

// ─── Default configs ──────────────────────────────────────────────────────────

function getDefaultConfig(gameType: GameType): GameConfig {
  switch (gameType) {
    case "skins":
      return {
        scoring: "gross",
        betPerHole: 5,
        carryover: true,
        validation: false,
        parRule: false,
        birdieBonus: false,
      } satisfies SkinsConfig;
    case "nassau":
      return {
        scoring: "gross",
        format: "1v1",
        betPerSide: 5,
        autoPress: false,
        manualPress: true,
        pressThePress: false,
      } satisfies NassauConfig;
    case "wolf":
      return {
        scoring: "gross",
        pointValue: 2,
        pigOption: false,
        tripleLastThree: false,
      } satisfies WolfConfig;
    case "stroke":
      return {
        scoring: "gross",
        wagerType: "winner",
        buyIn: 20,
      } satisfies StrokeConfig;
    case "match":
      return {
        scoring: "gross",
        format: "1v1",
        matchBet: 20,
      } satisfies MatchConfig;
    case "nines":
      return {
        scoring: "gross",
        blitz: false,
        dollarPerPoint: 2,
      } satisfies NinesConfig;
    case "stableford":
      return {
        scoring: "gross",
        format: "standard",
        dollarPerPoint: 2,
      } satisfies StablefordConfig;
    case "scotch":
      return {
        scoring: "gross",
        pointSystem: "5point",
        teamPairing: "auto",
        teePress: false,
        gamePress: false,
        dollarPerDot: 5,
      } satisfies ScotchConfig;
  }
}

// ─── Player count validation ──────────────────────────────────────────────────

function getPlayerCountMessage(
  gameType: GameType,
  count: number
): { valid: boolean; message: string } {
  const game = GAMES.find((g) => g.id === gameType);
  if (!game) return { valid: true, message: "" };

  const { minPlayers, maxPlayers } = game;

  if (count < minPlayers) {
    return {
      valid: false,
      message: `${game.name} requires at least ${minPlayers} players. Add ${minPlayers - count} more.`,
    };
  }
  if (count > maxPlayers) {
    return {
      valid: false,
      message: `${game.name} supports at most ${maxPlayers} players. Remove ${count - maxPlayers}.`,
    };
  }
  if (minPlayers === maxPlayers) {
    return {
      valid: true,
      message: `${game.name} requires exactly ${minPlayers} players. ✓`,
    };
  }
  return { valid: true, message: "" };
}

// ─── Game Form renderer ───────────────────────────────────────────────────────

interface GameFormRendererProps {
  gameType: GameType;
  config: GameConfig;
  onChange: (config: GameConfig) => void;
}

function GameFormRenderer({ gameType, config, onChange }: GameFormRendererProps) {
  switch (gameType) {
    case "skins":
      return (
        <SkinsForm
          config={config as SkinsConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "nassau":
      return (
        <NassauForm
          config={config as NassauConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "wolf":
      return (
        <WolfForm
          config={config as WolfConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "stroke":
      return (
        <StrokeForm
          config={config as StrokeConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "match":
      return (
        <MatchForm
          config={config as MatchConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "nines":
      return (
        <NinesForm
          config={config as NinesConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "stableford":
      return (
        <StablefordForm
          config={config as StablefordConfig}
          onChange={(c) => onChange(c)}
        />
      );
    case "scotch":
      return (
        <ScotchForm
          config={config as ScotchConfig}
          onChange={(c) => onChange(c)}
        />
      );
    default:
      return null;
  }
}

// ─── GHIN Badge ──────────────────────────────────────────────────────────────

function GhinBadge() {
  return (
    <span className="inline-flex items-center bg-gold/15 text-gold font-inter text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">
      GHIN
    </span>
  );
}

// ─── Setup Content ────────────────────────────────────────────────────────────

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameTypeParam = (searchParams.get("game") ?? "skins") as GameType;
  const courseId = searchParams.get("course") ?? "";

  const { user } = useAuthStore();
  const { friends } = useFriendsStore();
  const { setRound } = useRoundStore();

  const game = GAMES.find((g) => g.id === gameTypeParam);
  const course = COURSES.find((c) => c.id === courseId);

  // Build host player from user
  const hostPlayer: Player = useMemo(
    () => ({
      id: user?.id ?? "host",
      name: user?.name ?? "You",
      handicap: user?.handicap ?? 18,
      ghin: user?.ghin,
      avatar: user?.avatar,
      ghinLinked: user?.ghinLinked ?? false,
      isHost: true,
    }),
    [user]
  );

  const [players, setPlayers] = useState<Player[]>([hostPlayer]);
  const [config, setConfig] = useState<GameConfig>(
    getDefaultConfig(gameTypeParam)
  );

  // Add a friend as player
  const addFriend = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;
    if (players.find((p) => p.id === friend.id)) return;
    setPlayers((prev) => [
      ...prev,
      {
        id: friend.id,
        name: friend.name,
        handicap: friend.handicap,
        ghin: friend.ghin,
        avatar: friend.avatar,
        ghinLinked: !!friend.ghin,
        isHost: false,
      },
    ]);
  };

  // Remove a player (not the host)
  const removePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId || p.isHost));
  };

  const addedIds = new Set(players.map((p) => p.id));
  const { valid, message } = getPlayerCountMessage(gameTypeParam, players.length);

  const handleStartRound = () => {
    if (!course || !game) return;
    const round = {
      gameType: gameTypeParam,
      course,
      players,
      config,
      scores: {},
      currentHole: 1,
      holesCompleted: [],
      skinResults: [],
      startedAt: new Date().toISOString(),
    };
    setRound(round);
    router.push("/live");
  };

  if (!game || !course) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-5">
        <div className="text-center">
          <p className="font-fraunces text-ink text-xl font-semibold mb-2">
            Setup Error
          </p>
          <p className="font-inter text-muted text-sm mb-6">
            {!game ? "Game not found." : "Course not found."}
          </p>
          <button
            onClick={() => router.push("/games")}
            className="font-inter text-forest text-sm font-medium underline"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-forest mb-6 active:opacity-60 transition-opacity min-h-[44px]"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
          <span className="font-inter text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl leading-none">{game.icon}</span>
          <h1 className="font-fraunces text-ink text-3xl font-bold leading-tight">
            {game.name}
          </h1>
        </div>

        {/* Course subtitle */}
        <div className="flex items-center gap-2 mt-2 ml-0.5">
          <span className="font-inter text-muted text-sm">⛳</span>
          <p className="font-inter text-muted text-sm">
            {course.name} · {course.city}, {course.state}
          </p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-8">
        {/* ── SECTION A: Players ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-forest" />
            <h2 className="font-fraunces text-ink text-xl font-semibold">
              Players
            </h2>
          </div>

          {/* Added players list */}
          <div className="flex flex-col gap-2 mb-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-cream-dark rounded-2xl px-4 py-3"
              >
                <Avatar name={player.name} size="sm" src={player.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-ink text-sm font-semibold truncate">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="inline-flex items-center bg-forest/15 text-forest font-inter text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                        Host
                      </span>
                    )}
                    {player.ghinLinked && <GhinBadge />}
                  </div>
                  <p className="font-inter text-muted text-xs mt-0.5">
                    HCP {formatHandicap(player.handicap)}
                  </p>
                </div>
                {!player.isHost && (
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-ink/8 text-muted active:opacity-60 transition-opacity shrink-0"
                    aria-label={`Remove ${player.name}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Validation message */}
          {message && (
            <div
              className={cn(
                "rounded-xl px-4 py-2.5 mb-4",
                valid ? "bg-forest/8" : "bg-red-50"
              )}
            >
              <p
                className={cn(
                  "font-inter text-sm",
                  valid ? "text-forest" : "text-red-600"
                )}
              >
                {message}
              </p>
            </div>
          )}

          {/* Add Players subsection */}
          <div>
            <p className="font-inter text-sm font-semibold text-ink mb-3">
              Add Players
            </p>
            <div className="flex flex-col gap-2">
              {friends.map((friend) => {
                const alreadyAdded = addedIds.has(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => !alreadyAdded && addFriend(friend.id)}
                    disabled={alreadyAdded}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-left w-full transition-all",
                      alreadyAdded
                        ? "bg-cream-dark/50 opacity-50 cursor-not-allowed"
                        : "bg-cream-dark active:scale-[0.98]"
                    )}
                  >
                    <Avatar name={friend.name} size="sm" src={friend.avatar} online={friend.online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-inter text-ink text-sm font-semibold truncate">
                          {friend.name}
                        </span>
                        {friend.ghin && <GhinBadge />}
                        {friend.online && (
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="font-inter text-muted text-xs mt-0.5">
                        HCP {formatHandicap(friend.handicap)}
                      </p>
                    </div>
                    {alreadyAdded && (
                      <span className="font-inter text-forest text-xs font-semibold shrink-0">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION B: Game Config ─────────────────────────────────── */}
        <section>
          <h2 className="font-fraunces text-ink text-xl font-semibold mb-4">
            Game Settings
          </h2>
          <div className="bg-cream-dark rounded-2xl p-5 shadow-card">
            <GameFormRenderer
              gameType={gameTypeParam}
              config={config}
              onChange={setConfig}
            />
          </div>
        </section>
      </div>

      {/* ── Fixed Start Round Button ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 bg-cream border-t border-ink/10">
        <button
          type="button"
          onClick={handleStartRound}
          disabled={!valid}
          className={cn(
            "w-full font-inter font-semibold text-base rounded-xl py-4",
            "transition-all active:scale-[0.97]",
            valid
              ? "bg-forest text-white active:bg-forest-light"
              : "bg-cream-dark text-muted cursor-not-allowed"
          )}
        >
          {valid
            ? `Start Round · ${players.length} Player${players.length !== 1 ? "s" : ""}`
            : "Add More Players"}
        </button>
      </div>
    </div>
  );
}

// ─── Page export with Suspense ────────────────────────────────────────────────

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="font-inter text-muted">Loading...</p>
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
