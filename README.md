# SKINZ ⛳

> Golf betting, elevated.

A progressive web app for tracking golf betting games with friends. Supports 8 game formats, GHIN handicap integration, and real-time scoring.

## Features

- **8 Game Formats**: Skins, Nassau, Wolf, Stroke Play, Match Play, Nines, Stableford, Scotch
- **GHIN Integration**: Mock GHIN handicap sync (production-ready to swap real API)
- **Live Scoring**: Hole-by-hole scoring with handicap adjustments
- **Friends System**: Manage your golf group with GHIN numbers and handicaps
- **14 Courses**: Pre-loaded with top US courses including Pebble Beach, Torrey Pines, Augusta National
- **PWA Ready**: Installable on iOS/Android as a home screen app

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom design system)
- **Framer Motion** (animations)
- **Zustand** (state management with localStorage persistence)
- **Lucide React** (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or use Chrome DevTools mobile view.

## Deployment

Deploy instantly to Vercel:

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## App Flow

```
/ (Sign In)
  ↓
/signup (Create Account)
  ↓
/home (Dashboard)
  ├── /profile (GHIN linking, stats)
  ├── /friends (Manage golf crew)
  ├── /games (Select game format)
  │     ↓
  │   /courses (Pick course)
  │     ↓
  │   /setup (Configure game + players)
  │     ↓
  │   /live (Live scoring)
  │     ↓
  │   /summary (Results + payouts)
  └── /rounds (Round history)
```

## Design System

| Token | Value |
|-------|-------|
| Cream | `#f5f1e8` |
| Cream Dark | `#e8e0d0` |
| Forest | `#1a4d3a` |
| Forest Light | `#2d6e54` |
| Gold | `#c4943c` |
| Ink | `#1a1a1a` |
| Muted | `#8a7d6a` |

**Fonts**: Fraunces (display/headings) · Inter (body/UI)

## Game Formats

| Game | Players | Description |
|------|---------|-------------|
| Skins | 2-8 | Win the hole, collect the pot. Ties carry over. |
| Nassau | 2-4 | Three match play bets: Front 9, Back 9, Total 18 |
| Wolf | 4 | Rotate as Wolf; pick partner or go lone for 2x |
| Stroke Play | 2-8 | Lowest total score wins the pot |
| Match Play | 2-4 | Win holes, not strokes. First to win more than remain. |
| Nines | 3 | 9 points distributed per hole (5-3-1) |
| Stableford | 2-8 | Points for good holes; bad holes score 0 |
| Scotch | 4 | Team dots game with press bets |

## Mock Data

The app ships with 6 sample friends and 14 courses. GHIN sync is mocked with a 1.5s delay and generates a random handicap. For production, replace `linkGhin` in `lib/store.ts` with a real GHIN API call.

## Contributing

This is an MVP. Production enhancements would include:
- Real authentication (NextAuth / Supabase)
- Real GHIN API integration
- Cloud storage for round history
- Push notifications for live rounds
- Apple/Google Pay for real money flows (where legal)
