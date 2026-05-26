// ─── User & Auth ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  handicap: number;
  ghin?: string;
  lowHi?: string;
  homeClub?: string;
  avatar?: string;
  ghinLinked: boolean;
  ghinSyncedAt?: string;
  stats: {
    roundsPlayed: number;
    lifetimeWinnings: number;
    wins: number;
  };
}

// ─── Friends ───────────────────────────────────────────────────────────────────

export interface Friend {
  id: string;
  name: string;
  handicap: number;
  ghin?: string;
  avatar?: string;
  online: boolean;
  email?: string;
}

// ─── Games ─────────────────────────────────────────────────────────────────────

export type GameType =
  | "skins"
  | "nassau"
  | "wolf"
  | "stroke"
  | "match"
  | "nines"
  | "stableford"
  | "scotch";

export interface Game {
  id: GameType;
  name: string;
  tagline: string;
  summary: string;
  rules: string[];
  icon: string;
  minPlayers: number;
  maxPlayers: number;
}

// ─── Course & Holes ───────────────────────────────────────────────────────────

export interface Hole {
  number: number;
  par: number;
  yards: number;
  handicap: number; // 1-18 difficulty rating
}

export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  distance?: string; // "2.3 mi" etc
  holes: number;
  par: number;
  rating: number;
  slope: number;
  holeData: Hole[];
}

// ─── Game Config ──────────────────────────────────────────────────────────────

export type ScoringMode = "gross" | "net";
export type WagerType = "winner" | "pay_two";
export type MatchFormat = "1v1" | "2v2";
export type StablefordFormat = "standard" | "modified";
export type ScotchPoints = "5point" | "6point";
export type TeamPairing = "manual" | "auto";

export interface SkinsConfig {
  scoring: ScoringMode;
  betPerHole: number;
  carryover: boolean;
  validation: boolean;
  parRule: boolean;
  birdieBonus: boolean;
}

export interface NassauConfig {
  scoring: ScoringMode;
  format: MatchFormat;
  betPerSide: number;
  autoPress: boolean;
  manualPress: boolean;
  pressThePress: boolean;
}

export interface WolfConfig {
  scoring: ScoringMode;
  pointValue: number;
  pigOption: boolean;
  tripleLastThree: boolean;
}

export interface StrokeConfig {
  scoring: ScoringMode;
  wagerType: WagerType;
  buyIn: number;
}

export interface MatchConfig {
  scoring: ScoringMode;
  format: MatchFormat;
  matchBet: number;
}

export interface NinesConfig {
  scoring: ScoringMode;
  blitz: boolean;
  dollarPerPoint: number;
}

export interface StablefordConfig {
  scoring: ScoringMode;
  format: StablefordFormat;
  dollarPerPoint: number;
}

export interface ScotchConfig {
  scoring: ScoringMode;
  pointSystem: ScotchPoints;
  teamPairing: TeamPairing;
  teePress: boolean;
  gamePress: boolean;
  dollarPerDot: number;
}

export type GameConfig =
  | SkinsConfig
  | NassauConfig
  | WolfConfig
  | StrokeConfig
  | MatchConfig
  | NinesConfig
  | StablefordConfig
  | ScotchConfig;

// ─── Players ─────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  handicap: number;
  ghin?: string;
  avatar?: string;
  ghinLinked: boolean;
  isHost?: boolean;
}

// ─── Round / Scoring ─────────────────────────────────────────────────────────

export type Scores = Record<string, number>; // key: `${holeNumber}-${playerId}`

export interface SkinResult {
  holeNumber: number;
  winnerId?: string;
  winnerName?: string;
  pot: number;
  carriedOver: boolean;
}

export interface RoundState {
  gameType: GameType;
  course: Course;
  players: Player[];
  config: GameConfig;
  scores: Scores;
  currentHole: number;
  holesCompleted: number[];
  skinResults: SkinResult[];
  startedAt: string;
}

// ─── Results ─────────────────────────────────────────────────────────────────

export interface PlayerResult {
  player: Player;
  grossTotal: number;
  netTotal: number;
  moneyWon: number;
  moneyLost: number;
  position: number;
}

export interface RoundResult {
  gameType: GameType;
  course: Course;
  players: Player[];
  results: PlayerResult[];
  skinResults?: SkinResult[];
  completedAt: string;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface AppState {
  user: User | null;
  friends: Friend[];
  round: RoundState | null;
  isAuthenticated: boolean;
}
