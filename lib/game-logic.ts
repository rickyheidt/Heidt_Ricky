import type {
  Player,
  Scores,
  Course,
  SkinResult,
  PlayerResult,
  GameConfig,
  SkinsConfig,
  NassauConfig,
  WolfConfig,
  StrokeConfig,
  NinesConfig,
  StablefordConfig,
  ScotchConfig,
  MatchConfig,
} from "./types";
import { strokesOnHole, netScore } from "./handicap";

// ─── Score Helpers ────────────────────────────────────────────────────────────

function getScore(scores: Scores, holeNumber: number, playerId: string): number {
  return scores[`${holeNumber}-${playerId}`] ?? 0;
}

function getGrossTotal(scores: Scores, player: Player, holes: number): number {
  let total = 0;
  for (let h = 1; h <= holes; h++) {
    total += getScore(scores, h, player.id);
  }
  return total;
}

function getNetTotal(scores: Scores, player: Player, course: Course): number {
  let total = 0;
  for (let h = 1; h <= course.holeData.length; h++) {
    const gross = getScore(scores, h, player.id);
    const hole = course.holeData[h - 1];
    total += gross - strokesOnHole(player.handicap, hole.handicap);
  }
  return total;
}

// ─── Stableford Points ────────────────────────────────────────────────────────

export function stablefordPoints(
  score: number,
  par: number,
  format: "standard" | "modified"
): number {
  const diff = score - par;
  if (format === "standard") {
    if (diff <= -3) return 5;
    if (diff === -2) return 4;
    if (diff === -1) return 3;
    if (diff === 0) return 2;
    if (diff === 1) return 1;
    return 0;
  } else {
    // Modified (PGA)
    if (diff <= -3) return 8;
    if (diff === -2) return 5;
    if (diff === -1) return 2;
    if (diff === 0) return 0;
    if (diff === 1) return -1;
    return -3;
  }
}

// ─── Skins Logic ──────────────────────────────────────────────────────────────

export function calculateSkins(
  players: Player[],
  course: Course,
  scores: Scores,
  config: SkinsConfig,
  holesCompleted: number[]
): SkinResult[] {
  const results: SkinResult[] = [];
  let carryoverPot = 0;

  for (const hole of course.holeData) {
    if (!holesCompleted.includes(hole.number)) continue;

    const holeScores = players.map((p) => {
      const gross = getScore(scores, hole.number, p.id);
      const net =
        config.scoring === "net"
          ? netScore(gross, p.handicap, hole.handicap)
          : gross;
      return { player: p, score: net, gross };
    });

    // Par rule: filter out bogeys
    const eligible = config.parRule
      ? holeScores.filter((s) => s.score <= hole.par)
      : holeScores;

    if (eligible.length === 0) {
      // No one eligible, carry over
      carryoverPot += config.betPerHole;
      results.push({ holeNumber: hole.number, pot: carryoverPot, carriedOver: true });
      continue;
    }

    const minScore = Math.min(...eligible.map((s) => s.score));
    const winners = eligible.filter((s) => s.score === minScore);

    const potThisHole = config.betPerHole + carryoverPot;

    if (winners.length === 1) {
      const winner = winners[0];
      let skinsWon = 1;
      if (config.birdieBonus && winner.score < hole.par) {
        skinsWon = winner.score === hole.par - 2 ? 3 : 2;
      }
      carryoverPot = 0;
      results.push({
        holeNumber: hole.number,
        winnerId: winner.player.id,
        winnerName: winner.player.name,
        pot: potThisHole * skinsWon,
        carriedOver: false,
      });
    } else if (config.carryover) {
      // Tie: carry over
      carryoverPot += config.betPerHole;
      results.push({ holeNumber: hole.number, pot: carryoverPot, carriedOver: true });
    } else {
      results.push({ holeNumber: hole.number, pot: potThisHole, carriedOver: false });
    }
  }

  return results;
}

export function skinsMoney(
  players: Player[],
  skinResults: SkinResult[]
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  for (const skin of skinResults) {
    if (skin.winnerId) {
      money[skin.winnerId] = (money[skin.winnerId] ?? 0) + skin.pot;
    }
  }

  // Subtract equal share of total pot from each player
  const totalPot = skinResults
    .filter((s) => !s.carriedOver)
    .reduce((sum, s) => sum + s.pot, 0);

  // Actually calculate net: winners receive, non-winners pay
  // We already have gross winnings; net = gross - (totalPot / numPlayers)
  const perPlayerCost = totalPot / players.length;
  for (const p of players) {
    money[p.id] = (money[p.id] ?? 0) - perPlayerCost;
  }

  return money;
}

// ─── Stroke Play Logic ────────────────────────────────────────────────────────

export function calculateStroke(
  players: Player[],
  course: Course,
  scores: Scores,
  config: StrokeConfig
): Record<string, number> {
  const totals = players.map((p) => ({
    player: p,
    total:
      config.scoring === "net"
        ? getNetTotal(scores, p, course)
        : getGrossTotal(scores, p, course.holeData.length),
  }));

  totals.sort((a, b) => a.total - b.total);

  const totalPot = config.buyIn * players.length;
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = -config.buyIn));

  if (config.wagerType === "winner") {
    // Winner takes all
    const minTotal = totals[0].total;
    const winners = totals.filter((t) => t.total === minTotal);
    const share = totalPot / winners.length;
    for (const w of winners) {
      money[w.player.id] += share;
    }
  } else {
    // Pay 1st and 2nd
    money[totals[0].player.id] += totalPot * 0.7;
    if (totals.length > 1) {
      money[totals[1].player.id] += totalPot * 0.3;
    }
  }

  return money;
}

// ─── Nassau Logic ─────────────────────────────────────────────────────────────

export function calculateNassau(
  players: Player[],
  course: Course,
  scores: Scores,
  config: NassauConfig
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  // Simple 1v1 nassau
  if (players.length === 2) {
    const [p1, p2] = players;
    const bet = config.betPerSide;

    let frontDiff = 0; // + means p1 up
    let backDiff = 0;

    for (let h = 1; h <= 18; h++) {
      const hole = course.holeData[h - 1];
      let s1 = getScore(scores, h, p1.id);
      let s2 = getScore(scores, h, p2.id);

      if (config.scoring === "net") {
        s1 -= strokesOnHole(p1.handicap, hole.handicap);
        s2 -= strokesOnHole(p2.handicap, hole.handicap);
      }

      if (s1 < s2) {
        if (h <= 9) frontDiff++;
        else backDiff++;
      } else if (s2 < s1) {
        if (h <= 9) frontDiff--;
        else backDiff--;
      }
    }

    const totalDiff = frontDiff + backDiff;

    if (frontDiff > 0) {
      money[p1.id] += bet;
      money[p2.id] -= bet;
    } else if (frontDiff < 0) {
      money[p2.id] += bet;
      money[p1.id] -= bet;
    }

    if (backDiff > 0) {
      money[p1.id] += bet;
      money[p2.id] -= bet;
    } else if (backDiff < 0) {
      money[p2.id] += bet;
      money[p1.id] -= bet;
    }

    if (totalDiff > 0) {
      money[p1.id] += bet;
      money[p2.id] -= bet;
    } else if (totalDiff < 0) {
      money[p2.id] += bet;
      money[p1.id] -= bet;
    }
  }

  return money;
}

// ─── Match Play Logic ─────────────────────────────────────────────────────────

export function calculateMatch(
  players: Player[],
  course: Course,
  scores: Scores,
  config: MatchConfig
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  if (players.length === 2) {
    const [p1, p2] = players;
    let matchDiff = 0;

    for (let h = 1; h <= 18; h++) {
      const hole = course.holeData[h - 1];
      let s1 = getScore(scores, h, p1.id);
      let s2 = getScore(scores, h, p2.id);

      if (config.scoring === "net") {
        s1 -= strokesOnHole(p1.handicap, hole.handicap);
        s2 -= strokesOnHole(p2.handicap, hole.handicap);
      }

      if (s1 < s2) matchDiff++;
      else if (s2 < s1) matchDiff--;
    }

    if (matchDiff > 0) {
      money[p1.id] += config.matchBet;
      money[p2.id] -= config.matchBet;
    } else if (matchDiff < 0) {
      money[p2.id] += config.matchBet;
      money[p1.id] -= config.matchBet;
    }
  }

  return money;
}

// ─── Nines Logic ─────────────────────────────────────────────────────────────

export function calculateNines(
  players: Player[],
  course: Course,
  scores: Scores,
  config: NinesConfig
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  if (players.length !== 3) return money;

  const [p1, p2, p3] = players;
  const points: Record<string, number> = { [p1.id]: 0, [p2.id]: 0, [p3.id]: 0 };

  for (let h = 1; h <= 18; h++) {
    const hole = course.holeData[h - 1];
    const getS = (p: Player) => {
      const g = getScore(scores, h, p.id);
      return config.scoring === "net"
        ? g - strokesOnHole(p.handicap, hole.handicap)
        : g;
    };

    const scores3 = [
      { player: p1, score: getS(p1) },
      { player: p2, score: getS(p2) },
      { player: p3, score: getS(p3) },
    ].sort((a, b) => a.score - b.score);

    const [low, mid, high] = scores3;

    if (config.blitz && low.score + 2 <= mid.score) {
      points[low.player.id] += 9;
      points[mid.player.id] += 0;
      points[high.player.id] += 0;
    } else if (low.score === mid.score && mid.score === high.score) {
      points[low.player.id] += 3;
      points[mid.player.id] += 3;
      points[high.player.id] += 3;
    } else if (low.score === mid.score) {
      points[low.player.id] += 4;
      points[mid.player.id] += 4;
      points[high.player.id] += 1;
    } else if (mid.score === high.score) {
      points[low.player.id] += 5;
      points[mid.player.id] += 2;
      points[high.player.id] += 2;
    } else {
      points[low.player.id] += 5;
      points[mid.player.id] += 3;
      points[high.player.id] += 1;
    }
  }

  const avg = (points[p1.id] + points[p2.id] + points[p3.id]) / 3;
  for (const p of players) {
    money[p.id] = (points[p.id] - avg) * config.dollarPerPoint;
  }

  return money;
}

// ─── Stableford Logic ─────────────────────────────────────────────────────────

export function calculateStableford(
  players: Player[],
  course: Course,
  scores: Scores,
  config: StablefordConfig
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  const points: Record<string, number> = {};
  players.forEach((p) => (points[p.id] = 0));

  for (let h = 1; h <= 18; h++) {
    const hole = course.holeData[h - 1];
    for (const player of players) {
      const gross = getScore(scores, h, player.id);
      const effectivePar =
        config.scoring === "net"
          ? hole.par + strokesOnHole(player.handicap, hole.handicap)
          : hole.par;
      points[player.id] += stablefordPoints(gross, effectivePar, config.format);
    }
  }

  const avg = Object.values(points).reduce((a, b) => a + b, 0) / players.length;
  for (const p of players) {
    money[p.id] = (points[p.id] - avg) * config.dollarPerPoint;
  }

  return money;
}

// ─── Wolf Logic ───────────────────────────────────────────────────────────────

export function calculateWolf(
  players: Player[],
  course: Course,
  scores: Scores,
  config: WolfConfig
): Record<string, number> {
  // Simplified wolf calculation (full wolf needs per-hole partner tracking)
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));
  return money;
}

// ─── Scotch Logic ─────────────────────────────────────────────────────────────

export function calculateScotch(
  players: Player[],
  course: Course,
  scores: Scores,
  config: ScotchConfig
): Record<string, number> {
  const money: Record<string, number> = {};
  players.forEach((p) => (money[p.id] = 0));

  if (players.length !== 4) return money;

  // Team assignment (auto: low+high vs middle two)
  const sorted = [...players].sort((a, b) => a.handicap - b.handicap);
  const team1 = [sorted[0], sorted[3]]; // low + high
  const team2 = [sorted[1], sorted[2]]; // middles

  let team1Dots = 0;
  let team2Dots = 0;

  for (let h = 1; h <= 18; h++) {
    const hole = course.holeData[h - 1];
    const getS = (p: Player) => {
      const g = getScore(scores, h, p.id);
      return config.scoring === "net"
        ? g - strokesOnHole(p.handicap, hole.handicap)
        : g;
    };

    const t1best = Math.min(getS(team1[0]), getS(team1[1]));
    const t2best = Math.min(getS(team2[0]), getS(team2[1]));

    if (t1best < t2best) team1Dots += 2;
    else if (t2best < t1best) team2Dots += 2;
  }

  const netDots = team1Dots - team2Dots;
  const dollars = Math.abs(netDots) * config.dollarPerDot;

  if (netDots > 0) {
    team1.forEach((p) => (money[p.id] += dollars / 2));
    team2.forEach((p) => (money[p.id] -= dollars / 2));
  } else if (netDots < 0) {
    team2.forEach((p) => (money[p.id] += dollars / 2));
    team1.forEach((p) => (money[p.id] -= dollars / 2));
  }

  return money;
}

// ─── Master Calculation ───────────────────────────────────────────────────────

export function calculateResults(
  gameType: string,
  players: Player[],
  course: Course,
  scores: Scores,
  config: GameConfig | Record<string, unknown>,
  skinResults: SkinResult[]
): Record<string, number> {
  switch (gameType) {
    case "skins":
      return skinsMoney(players, skinResults);
    case "stroke":
      return calculateStroke(players, course, scores, config as unknown as StrokeConfig);
    case "nassau":
      return calculateNassau(players, course, scores, config as unknown as NassauConfig);
    case "match":
      return calculateMatch(players, course, scores, config as unknown as MatchConfig);
    case "nines":
      return calculateNines(players, course, scores, config as unknown as NinesConfig);
    case "stableford":
      return calculateStableford(players, course, scores, config as unknown as StablefordConfig);
    case "wolf":
      return calculateWolf(players, course, scores, config as unknown as WolfConfig);
    case "scotch":
      return calculateScotch(players, course, scores, config as unknown as ScotchConfig);
    default:
      return {};
  }
}

export function buildPlayerResults(
  players: Player[],
  money: Record<string, number>,
  scores: Scores,
  course: Course,
  isNet: boolean
): PlayerResult[] {
  const results = players.map((p) => {
    const grossTotal = Array.from({ length: 18 }, (_, i) =>
      getScore(scores, i + 1, p.id)
    ).reduce((a, b) => a + b, 0);

    const netTotal = isNet ? getNetTotal(scores, p, course) : grossTotal;
    const m = money[p.id] ?? 0;

    return {
      player: p,
      grossTotal,
      netTotal,
      moneyWon: m > 0 ? m : 0,
      moneyLost: m < 0 ? Math.abs(m) : 0,
      position: 0,
    };
  });

  // Sort by money won desc
  results.sort((a, b) => b.moneyWon - a.moneyWon || a.moneyLost - b.moneyLost);
  results.forEach((r, i) => (r.position = i + 1));

  return results;
}
