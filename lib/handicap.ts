import type { Player, Hole } from "./types";

/**
 * Calculate how many strokes a player receives on a specific hole.
 * Based on USGA course handicap allocation:
 *  - If player's handicap >= hole's handicap rating → 1 stroke
 *  - If player's handicap >= 18 + hole's handicap rating → 2 strokes
 *  - Negative handicaps can give back strokes
 */
export function strokesOnHole(playerHandicap: number, holeHandicap: number): number {
  const hcp = Math.round(playerHandicap);
  if (hcp <= 0) return 0;
  if (hcp >= 36 + holeHandicap) return 3;
  if (hcp >= 18 + holeHandicap) return 2;
  if (hcp >= holeHandicap) return 1;
  return 0;
}

/**
 * Calculate net score for a player on a given hole.
 */
export function netScore(grossScore: number, playerHandicap: number, holeHandicap: number): number {
  return grossScore - strokesOnHole(playerHandicap, holeHandicap);
}

/**
 * Score label relative to par (e.g., "Eagle", "Birdie", "Par", etc.)
 */
export function scoreToPar(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -3) return "Albatross";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  if (diff === 3) return "Triple";
  return `+${diff}`;
}

/**
 * Score to par label (short version)
 */
export function scoreLabel(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  return `+${diff}`;
}

/**
 * Get playing handicap for each player on a given course
 * (simplified: just use the stored handicap index)
 */
export function getPlayingHandicap(player: Player): number {
  return Math.round(player.handicap);
}

/**
 * Given a list of players and a hole, return stroke counts keyed by player id.
 * Uses ABSOLUTE handicap (each player vs scratch).
 */
export function strokesPerPlayer(
  players: Player[],
  hole: Hole
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const player of players) {
    result[player.id] = strokesOnHole(player.handicap, hole.handicap);
  }
  return result;
}

/**
 * In group play, strokes are allocated RELATIVE to the lowest handicap in the group.
 * e.g. if players are 5, 15, 22 — relative handicaps become 0, 10, 17.
 * Returns strokes received on a hole for one player relative to the field.
 */
export function strokesOnHoleRelative(
  playerHandicap: number,
  holeHandicap: number,
  allPlayers: Player[]
): number {
  const minHcp = Math.min(...allPlayers.map((p) => p.handicap));
  const relHcp = Math.max(0, playerHandicap - minHcp);
  return strokesOnHole(relHcp, holeHandicap);
}

/**
 * Given a list of players and a hole, return stroke counts keyed by player id.
 * Uses RELATIVE handicap (adjusted against the lowest handicap in the group).
 */
export function strokesPerPlayerRelative(
  players: Player[],
  hole: Hole
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const player of players) {
    result[player.id] = strokesOnHoleRelative(player.handicap, hole.handicap, players);
  }
  return result;
}
