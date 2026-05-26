import type { Game, Course, Hole, Friend } from "./types";

// ─── Sample Hole Data Generator ───────────────────────────────────────────────

function generateHoles(pars: number[], yards: number[]): Hole[] {
  // Handicap ratings shuffled per course personality
  const handicaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  return pars.map((par, i) => ({
    number: i + 1,
    par,
    yards: yards[i],
    handicap: handicaps[i],
  }));
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  {
    id: "torrey-south",
    name: "Torrey Pines (South)",
    city: "La Jolla",
    state: "CA",
    distance: "2.3 mi",
    holes: 18,
    par: 72,
    rating: 74.6,
    slope: 144,
    holeData: generateHoles(
      [4,4,3,4,4,3,4,3,4,4,5,4,3,4,5,3,4,5],
      [449,389,198,477,424,162,460,223,529,400,568,454,221,430,572,193,401,521]
    ),
  },
  {
    id: "pebble-beach",
    name: "Pebble Beach Golf Links",
    city: "Pebble Beach",
    state: "CA",
    distance: "127 mi",
    holes: 18,
    par: 72,
    rating: 75.5,
    slope: 145,
    holeData: generateHoles(
      [4,5,4,4,3,5,3,4,4,4,4,3,4,5,4,3,4,5],
      [381,502,388,327,188,516,107,431,466,446,380,202,400,573,397,178,393,543]
    ),
  },
  {
    id: "bandon-dunes",
    name: "Bandon Dunes",
    city: "Bandon",
    state: "OR",
    distance: "612 mi",
    holes: 18,
    par: 72,
    rating: 75.2,
    slope: 140,
    holeData: generateHoles(
      [4,4,4,3,5,3,5,4,4,4,3,4,5,4,4,3,4,5],
      [422,392,371,156,532,163,596,369,453,398,201,430,562,442,430,162,404,558]
    ),
  },
  {
    id: "augusta-national",
    name: "Augusta National",
    city: "Augusta",
    state: "GA",
    distance: "2,186 mi",
    holes: 18,
    par: 72,
    rating: 76.2,
    slope: 148,
    holeData: generateHoles(
      [4,5,4,3,4,3,4,5,4,4,4,3,5,4,4,3,4,4],
      [445,575,350,240,495,180,450,570,460,495,505,155,510,440,530,170,440,465]
    ),
  },
  {
    id: "bethpage-black",
    name: "Bethpage Black",
    city: "Farmingdale",
    state: "NY",
    distance: "2,792 mi",
    holes: 18,
    par: 71,
    rating: 76.6,
    slope: 148,
    holeData: generateHoles(
      [4,4,3,5,4,4,4,3,4,4,4,4,5,4,4,3,5,4],
      [430,389,230,517,478,408,492,213,431,492,435,499,614,161,459,249,529,411]
    ),
  },
  {
    id: "tpc-sawgrass",
    name: "TPC Sawgrass (Stadium)",
    city: "Ponte Vedra Beach",
    state: "FL",
    distance: "2,351 mi",
    holes: 18,
    par: 72,
    rating: 74.0,
    slope: 135,
    holeData: generateHoles(
      [4,5,3,4,4,4,5,3,4,4,3,4,5,4,4,3,4,4],
      [423,532,177,384,466,393,442,219,583,424,535,358,181,467,460,216,391,447]
    ),
  },
  {
    id: "pinehurst-2",
    name: "Pinehurst No. 2",
    city: "Pinehurst",
    state: "NC",
    distance: "2,376 mi",
    holes: 18,
    par: 70,
    rating: 75.9,
    slope: 135,
    holeData: generateHoles(
      [4,4,4,5,4,3,4,4,3,5,4,4,4,4,3,4,4,4],
      [408,447,337,572,482,216,402,487,197,614,453,409,383,436,204,532,190,445]
    ),
  },
  {
    id: "shinnecock-hills",
    name: "Shinnecock Hills",
    city: "Southampton",
    state: "NY",
    distance: "2,841 mi",
    holes: 18,
    par: 70,
    rating: 75.0,
    slope: 144,
    holeData: generateHoles(
      [3,5,4,3,4,5,4,4,4,4,4,4,3,4,4,3,4,4],
      [251,545,453,146,537,474,189,375,432,415,158,469,373,447,400,546,130,450]
    ),
  },
  {
    id: "riviera",
    name: "Riviera Country Club",
    city: "Pacific Palisades",
    state: "CA",
    distance: "18 mi",
    holes: 18,
    par: 71,
    rating: 75.7,
    slope: 145,
    holeData: generateHoles(
      [5,4,4,3,4,4,4,3,4,4,4,3,4,4,4,3,4,5],
      [501,462,434,236,433,163,430,133,490,406,564,245,464,176,453,468,419,491]
    ),
  },
  {
    id: "sherwood-country",
    name: "Sherwood Country Club",
    city: "Thousand Oaks",
    state: "CA",
    distance: "31 mi",
    holes: 18,
    par: 72,
    rating: 75.1,
    slope: 143,
    holeData: generateHoles(
      [4,3,4,4,5,4,3,4,4,5,4,3,4,5,4,3,4,5],
      [456,197,422,430,571,415,161,420,455,580,390,205,445,565,410,175,430,558]
    ),
  },
  {
    id: "pelican-hill-north",
    name: "Pelican Hill (North)",
    city: "Newport Coast",
    state: "CA",
    distance: "47 mi",
    holes: 18,
    par: 71,
    rating: 73.6,
    slope: 131,
    holeData: generateHoles(
      [4,3,4,5,4,3,4,4,5,4,4,3,4,5,4,3,4,4],
      [390,175,400,530,415,185,395,420,545,380,435,165,410,560,395,180,415,430]
    ),
  },
  {
    id: "crossings-carlsbad",
    name: "The Crossings at Carlsbad",
    city: "Carlsbad",
    state: "CA",
    distance: "35 mi",
    holes: 18,
    par: 72,
    rating: 72.3,
    slope: 131,
    holeData: generateHoles(
      [4,4,3,4,5,4,3,4,4,4,3,5,4,4,3,5,4,4],
      [380,395,165,415,530,400,170,390,445,410,180,555,385,420,155,545,395,420]
    ),
  },
  {
    id: "aviara",
    name: "Park Hyatt Aviara",
    city: "Carlsbad",
    state: "CA",
    distance: "37 mi",
    holes: 18,
    par: 72,
    rating: 73.9,
    slope: 135,
    holeData: generateHoles(
      [4,4,3,5,4,3,4,5,4,4,4,3,5,4,3,4,5,4],
      [402,388,163,550,432,182,418,548,395,425,395,171,548,415,178,398,545,420]
    ),
  },
  {
    id: "la-costa",
    name: "Omni La Costa Resort",
    city: "Carlsbad",
    state: "CA",
    distance: "38 mi",
    holes: 18,
    par: 72,
    rating: 72.8,
    slope: 134,
    holeData: generateHoles(
      [4,3,4,5,4,4,3,4,5,4,4,3,5,4,3,4,4,5],
      [375,168,392,535,418,405,171,385,552,412,398,165,542,408,172,380,420,548]
    ),
  },
];

// ─── Games ────────────────────────────────────────────────────────────────────

export const GAMES: Game[] = [
  {
    id: "skins",
    name: "Skins",
    tagline: "Win the hole, collect the pot",
    icon: "💰",
    minPlayers: 2,
    maxPlayers: 8,
    summary:
      "Each hole has a monetary value (skin). Win the hole outright to collect. Ties carry the pot to the next hole.",
    rules: [
      "Each hole is worth one skin at the agreed-upon dollar amount.",
      "To win a skin, you must have the lowest score on the hole among all players.",
      "If two or more players tie for the lowest score, the skin carries over to the next hole, increasing the pot.",
      "Carryover skins accumulate until someone wins a hole outright.",
      "With Validation: After winning a skin, you must make par or better on the next hole to keep it. If you fail, the skin is returned to the pot.",
      "With Par Rule: You must score par or better to win a skin — bogeys cannot win.",
      "With Birdie Bonus: A birdie counts as 2 skins, eagle counts as 3 skins.",
      "The player with the most money at the end wins.",
    ],
  },
  {
    id: "nassau",
    name: "Nassau",
    tagline: "Three bets in one round",
    icon: "🏆",
    minPlayers: 2,
    maxPlayers: 4,
    summary:
      "Three simultaneous match play bets: front 9, back 9, and the overall 18. Press bets when you're down.",
    rules: [
      "Nassau consists of three separate match play bets: Front 9, Back 9, and Full 18.",
      "All three bets are typically the same amount (e.g., $5 Front / $5 Back / $5 Total).",
      "Match play scoring: win a hole to go 1-up, tie stays even.",
      "Auto Press: When a player/team falls 2-down, a new match play bet automatically starts.",
      "Manual Press: Either side can request a press at any time; opponents must accept.",
      "Press the Press: When behind in a press match, you can press again for a third bet.",
      "In 2v2 format, the best ball score of the team counts on each hole.",
      "Final payouts settle all active bets at the end of each 9 and the full round.",
    ],
  },
  {
    id: "wolf",
    name: "Wolf",
    tagline: "Hunt alone or form a pack",
    icon: "🐺",
    minPlayers: 4,
    maxPlayers: 4,
    summary:
      "The Wolf picks a partner (or goes alone) after watching each player tee off. Lone Wolf wins double points.",
    rules: [
      "Players rotate as the Wolf each hole in a set order (1-2-3-4-1-2-3-4...).",
      "On each tee, players hit in order. The Wolf watches each drive and can immediately choose that player as a partner.",
      "If the Wolf partners up, it's 2v2 best ball. Team scores 1 point per player.",
      "If the Wolf waits to see all drives and no partner is chosen, the Wolf plays alone (Lone Wolf) for 2 points per player.",
      "Blind Wolf: Wolf declares 'Lone Wolf' before anyone tees off for 3 points per player.",
      "Pig Option: A player who the Wolf passes on can declare 'Pig' — forcing the Wolf to take them as a partner (doubles the point value).",
      "Triple on Last 3: Points are tripled on holes 16, 17, and 18.",
      "After 18 holes, players settle up based on point differentials.",
    ],
  },
  {
    id: "stroke",
    name: "Stroke Play",
    tagline: "Lowest total score wins",
    icon: "⛳",
    minPlayers: 2,
    maxPlayers: 8,
    summary:
      "Classic stroke play. Count every shot. Lowest total score after 18 holes wins the pot.",
    rules: [
      "Count every stroke on every hole.",
      "The player with the lowest total score after 18 holes wins.",
      "With Net scoring, each player's handicap strokes are subtracted from their gross score.",
      "Winner Takes All: The lowest score wins the entire pot.",
      "Pay 1st & 2nd: The pot is split with 70% to the winner and 30% to second place (customizable).",
      "All players contribute the agreed buy-in amount to the pot.",
      "In case of a tie, the pot is split evenly among tied players.",
    ],
  },
  {
    id: "match",
    name: "Match Play",
    tagline: "Hole by hole head-to-head",
    icon: "⚔️",
    minPlayers: 2,
    maxPlayers: 4,
    summary:
      "Win holes, not strokes. First to win more holes than remain wins the match.",
    rules: [
      "Match play is scored by holes won rather than total strokes.",
      "Win a hole by having the lowest score. Tie a hole and it's halved (no points change).",
      "The match is won when a player/team is up by more holes than remain to be played.",
      "For example, if you're 3-up with 2 holes left, you win 3&2.",
      "A match can end before the 18th hole if one side is mathematically ahead.",
      "In 2v2, the best ball of each team is compared on each hole.",
      "Net scoring applies handicap strokes hole-by-hole based on the hole's handicap rating.",
      "The agreed bet is paid by the losing side to the winner.",
    ],
  },
  {
    id: "nines",
    name: "Nines",
    tagline: "9 points to share every hole",
    icon: "🎯",
    minPlayers: 3,
    maxPlayers: 3,
    summary:
      "9 points distributed each hole based on score. 5-3-1 if all different, 4-4-1 if tied for best, etc.",
    rules: [
      "Nines is a 3-player game with 9 points distributed each hole.",
      "Standard distribution: Low score = 5 pts, Middle = 3 pts, High = 1 pt.",
      "If two players tie for low: 4-4-1 (tied get 4 pts, high gets 1 pt).",
      "If two players tie for high: 5-2-2 (low gets 5 pts, tied get 2 pts).",
      "If all three players tie: 3-3-3 (everyone gets 3 pts).",
      "Blitz option: If the low scorer beats both opponents by 2+ strokes, they win all 9 points.",
      "After 18 holes, sum all points. The player with the most points wins.",
      "Points are converted to dollars: (your points - average points) × dollar per point.",
    ],
  },
  {
    id: "stableford",
    name: "Stableford",
    tagline: "Points for good holes, not penalty for bad",
    icon: "📊",
    minPlayers: 2,
    maxPlayers: 8,
    summary:
      "Score points based on your performance vs par. Only great holes help you — disasters don't hurt.",
    rules: [
      "Standard Stableford: Bogey = 1 pt, Par = 2 pts, Birdie = 3 pts, Eagle = 4 pts, Double Eagle = 5 pts.",
      "Scores worse than bogey (double bogey or worse) score 0 points — no penalty.",
      "Modified (PGA) Stableford: Bogey = -1 pt, Par = 0 pts, Birdie = +2 pts, Eagle = +5 pts, Double Eagle = +8 pts.",
      "With net scoring, your handicap strokes are applied hole-by-hole before calculating points.",
      "The player with the most points wins.",
      "Dollar per point: At the end, players settle based on point differentials from the average.",
      "Stableford rewards aggressive play — go for birdies without fearing blow-up holes.",
    ],
  },
  {
    id: "scotch",
    name: "Scotch",
    tagline: "Team dots game with press bets",
    icon: "🥃",
    minPlayers: 4,
    maxPlayers: 4,
    summary:
      "4-player team game distributing 5 or 6 dots per hole. Press bets add extra action.",
    rules: [
      "Scotch is a 4-player game played as 2 teams of 2.",
      "5-Point System: Best ball wins 2 dots, worst ball loses 2 dots, 1 dot for middle scores.",
      "6-Point System: Each team's best and worst ball compete, plus a middle-ball contest for 2 dots.",
      "Team Pairing Auto: Low handicap + High handicap on one team; the two middle handicaps together.",
      "Tee Press: A team can press on the tee before the hole starts, doubling the dots on that hole.",
      "Game Press: A team that's behind by a set amount can call a game press, creating a new dots match.",
      "Dots are tallied after each hole. Final settlement = net dots × dollar per dot.",
      "Communication between partners about pressing and strategy is a key part of Scotch.",
    ],
  },
];

// ─── Sample Friends ───────────────────────────────────────────────────────────

export const DEFAULT_FRIENDS: Friend[] = [
  {
    id: "friend-1",
    name: "Mike Chen",
    handicap: 8.4,
    ghin: "5821349",
    avatar: undefined,
    online: true,
    email: "mchen@example.com",
  },
  {
    id: "friend-2",
    name: "Tyler Brooks",
    handicap: 14.2,
    ghin: "7234981",
    avatar: undefined,
    online: false,
    email: "tbrooks@example.com",
  },
  {
    id: "friend-3",
    name: "James Whitfield",
    handicap: 5.1,
    ghin: "3901827",
    avatar: undefined,
    online: true,
    email: "jwhitfield@example.com",
  },
  {
    id: "friend-4",
    name: "Sam Rivera",
    handicap: 19.7,
    ghin: "6128374",
    avatar: undefined,
    online: false,
    email: "srivera@example.com",
  },
  {
    id: "friend-5",
    name: "Drew Patterson",
    handicap: 11.3,
    ghin: "9087261",
    avatar: undefined,
    online: true,
    email: "dpatterson@example.com",
  },
  {
    id: "friend-6",
    name: "Alex Kim",
    handicap: 2.8,
    ghin: "4512893",
    avatar: undefined,
    online: false,
    email: "akim@example.com",
  },
];
