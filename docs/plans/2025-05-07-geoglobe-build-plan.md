# GeoGlobe — Daily Geography Game Build Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a full-featured daily geography game web app with a 3D globe, daily challenges, multiplayer versus mode, groups, leaderboards, practice modes, and premium features — inspired by MapTap.gg but incorporating best features from across the genre.

**Architecture:** Next.js 14 (App Router) frontend with Three.js/Globe.GL for the 3D globe rendering, PostgreSQL database via Prisma ORM, NextAuth for authentication, and a scoring/leaderboard engine. Server-side API routes handle game state, daily puzzle generation, and real-time versus play via WebSockets.

**Tech Stack:**
- Frontend: Next.js 14 (React 18), TypeScript, Tailwind CSS, Globe.GL (Three.js wrapper)
- Backend: Next.js API routes, Prisma ORM, PostgreSQL
- Auth: NextAuth.js (email/password + OAuth providers)
- Real-time: Socket.io (for versus mode)
- Hosting: Vercel (frontend) + Railway/Supabase (database)
- Content: Daily puzzles sourced from "this day in history" API + curated dataset

---

## Competitive Research Summary

### MapTap.gg (Primary Inspiration)
- 3D globe with city lights, stars, moon, shooting stars
- Daily 5 locations tied to "this day in history" events
- Confirm-tap mode (prevents accidental guesses)
- Score = distance from correct answer (lower = better)
- Streaks, badges, XP/leveling system
- Versus mode (20-second, 5-location head-to-head)
- Groups with leaderboards and chat
- Practice modes (short/medium/long, challenge, picture clues, flags)
- Personalized practice (based on weak areas)
- Premium tier ($2.99/mo): better zoom, play missed days, create groups, special FX
- Multi-language support (12 languages)
- Regional leaderboards
- Replay system for versus games

### Globle
- Color-coded heat feedback (blue → red = closer)
- Unlimited guesses per day
- Minimalist — no account required
- 3D globe visualization
- Capital cities variant

### Worldle (Teuteuf Games)
- Country silhouette identification
- Distance + directional bearing hints
- 6 guesses per day (Wordle-style)
- Sharable emoji results grid
- Archive for past puzzles

### GeoGuessr
- Google Street View immersion
- Ranked competitive ladders (ELO)
- User-created custom maps
- Duels (real-time head-to-head)
- Streaks mode
- Team/party play

### Plonk.world
- Built with Globe.GL (open source)
- Photo clues with historical images
- Timer-based rounds (60 seconds)
- Groups (public + private)
- No paywall on core features
- Pin customization (anvil, standard pin)

### EarthChasers
- Google Maps Photorealistic 3D API
- 1,000+ cities and natural wonders
- Community-generated maps
- Free professional geo tools

### City Guesser
- Full-motion HD walking/driving tour videos
- Multiplayer lobby system
- No sign-up required

### Best Features to Incorporate (Beyond MapTap)

| Feature | Source | Priority |
|---------|--------|----------|
| Color-coded proximity heat feedback | Globle | High |
| Sharable emoji results grid | Worldle | High |
| Photo/image clues for locations | Plonk | High |
| ELO-based ranked ladder | GeoGuessr | High |
| No paywall on core daily game | Plonk | High |
| Community-created custom maps | GeoGuessr | Medium |
| Video clues (walking tours) | City Guesser | Medium |
| Streaks mode (endless until wrong) | GeoGuessr | Medium |
| Country silhouette hints | Worldle | Medium |
| Distance + direction hints after guess | Worldle | Medium |
| Party/lobby multiplayer (2-100 players) | Hide & Seek World | Medium |
| Archive of all past days | Worldle/MapTap+ | Low |
| Community Discord integration | MapTap | Low |

---

## Phase 1: Foundation & Core Infrastructure

### Task 1: Project Scaffolding

**Objective:** Initialize Next.js project with TypeScript, Tailwind, and essential dependencies.

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `prisma/schema.prisma`
- Create: `.env.example`

**Steps:**
1. `npx create-next-app@latest geoglobe --typescript --tailwind --eslint --app --src-dir`
2. Install deps: `npm install globe.gl three @types/three prisma @prisma/client next-auth socket.io socket.io-client`
3. Install dev deps: `npm install -D @types/node`
4. Create `.env.example` with required env vars
5. Initialize Prisma: `npx prisma init`

---

### Task 2: Database Schema Design

**Objective:** Design the full Prisma schema for users, games, scores, groups, and versus matches.

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String?
  avatar        String?
  flag          String?   // country flag emoji
  xp            Int       @default(0)
  level         Int       @default(1)
  streak        Int       @default(0)
  longestStreak Int       @default(0)
  elo           Int       @default(1200)
  isPremium     Boolean   @default(false)
  premiumUntil  DateTime?
  region        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  scores        Score[]
  versusAsP1    VersusMatch[] @relation("player1")
  versusAsP2    VersusMatch[] @relation("player2")
  groupMembers  GroupMember[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model DailyPuzzle {
  id          String   @id @default(cuid())
  date        DateTime @unique // one puzzle per day
  puzzleNumber Int     @unique // sequential (like MapTap #685)
  locations   Location[]
  scores      Score[]
  createdAt   DateTime @default(now())
}

model Location {
  id          String   @id @default(cuid())
  puzzleId    String
  order       Int      // 1-5 position in puzzle
  latitude    Float
  longitude   Float
  name        String
  country     String
  description String   // historical context / story
  imageUrl    String?  // photo clue (optional)
  date        String?  // historical date of event
  category    String?  // war, science, culture, etc.

  puzzle      DailyPuzzle @relation(fields: [puzzleId], references: [id])

  @@unique([puzzleId, order])
}

model Score {
  id         String   @id @default(cuid())
  userId     String
  puzzleId   String
  totalScore Int      // 0-5000 (1000 per location max)
  distances  Json     // [d1, d2, d3, d4, d5] in km
  roundScores Json    // [s1, s2, s3, s4, s5]
  timeTaken  Int?     // seconds
  createdAt  DateTime @default(now())

  user    User        @relation(fields: [userId], references: [id])
  puzzle  DailyPuzzle @relation(fields: [puzzleId], references: [id])

  @@unique([userId, puzzleId])
}

model VersusMatch {
  id        String   @id @default(cuid())
  player1Id String
  player2Id String
  winnerId  String?
  isRanked  Boolean  @default(false)
  status    String   @default("pending") // pending, active, completed
  locations Json     // shared 5 locations
  p1Scores  Json?
  p2Scores  Json?
  p1Time    Int?
  p2Time    Int?
  createdAt DateTime @default(now())

  player1 User @relation("player1", fields: [player1Id], references: [id])
  player2 User @relation("player2", fields: [player2Id], references: [id])
}

model Group {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique // join code
  isPublic    Boolean  @default(false)
  createdById String
  createdAt   DateTime @default(now())

  members GroupMember[]
}

model GroupMember {
  id       String @id @default(cuid())
  userId   String
  groupId  String
  role     String @default("member") // admin, member
  joinedAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  group Group @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])
}

model PracticeMap {
  id          String @id @default(cuid())
  name        String
  description String?
  category    String // capitals, countries, flags, themed, custom
  difficulty  String // easy, medium, hard
  locations   Json   // array of {lat, lng, name, country, clue}
  isOfficial  Boolean @default(true)
  createdById String?
  playCount   Int    @default(0)
  createdAt   DateTime @default(now())
}
```

**Steps:**
1. Write the schema file
2. Run `npx prisma generate`
3. Run `npx prisma db push` (or migrate in production)

---

### Task 3: Authentication System

**Objective:** Set up NextAuth with email/password and Google OAuth.

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/components/auth/SignInModal.tsx`
- Create: `src/components/auth/SignUpModal.tsx`

**Key implementation:**
- Email + password (bcrypt hashing)
- Google OAuth
- Session-based auth with JWT
- Protected API routes middleware

---

## Phase 2: 3D Globe & Core Game Engine

### Task 4: 3D Globe Component

**Objective:** Create the interactive 3D Earth globe using Globe.GL with realistic visuals.

**Files:**
- Create: `src/components/globe/GlobeView.tsx`
- Create: `src/components/globe/GlobeControls.tsx`
- Create: `src/lib/globe-config.ts`

**Features to implement:**
- Realistic Earth texture with cloud layer
- City lights on dark side of globe
- Stars/space background
- Smooth rotation (drag to rotate, scroll to zoom)
- Pin drop animation on tap/click
- Confirm-tap mode (tap once to preview, tap again to confirm)
- Responsive sizing
- WebGL fallback/error detection

**Globe.GL configuration:**
```typescript
import Globe from 'globe.gl';

const globe = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .showAtmosphere(true)
  .atmosphereColor('#3a228a')
  .atmosphereAltitude(0.25)
  .pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
```

---

### Task 5: Daily Game Engine

**Objective:** Build the core daily game loop — present 5 locations, accept taps, score, show results.

**Files:**
- Create: `src/lib/game-engine.ts`
- Create: `src/hooks/useGameState.ts`
- Create: `src/components/game/GameHeader.tsx`
- Create: `src/components/game/LocationCard.tsx`
- Create: `src/components/game/ScoreDisplay.tsx`
- Create: `src/components/game/ResultsScreen.tsx`

**Game flow:**
1. Load today's puzzle (5 locations)
2. Show location #1: name, historical description, optional photo clue
3. Player taps globe to place pin
4. Confirm-tap: show preview pin, click "Confirm" or reposition
5. Reveal correct answer with distance line drawn on globe
6. Score: `max(0, 1000 - (distance_km * 2))` (perfect = within 50km)
7. Show color-coded proximity feedback (Globle-style heat)
8. Repeat for locations 2-5
9. Show final results with total score, individual distances, sharable card

**Scoring formula:**
```typescript
function calculateScore(distanceKm: number): number {
  if (distanceKm <= 50) return 1000;  // Perfect
  if (distanceKm >= 5000) return 0;   // Too far
  return Math.max(0, Math.round(1000 - (distanceKm * 0.2)));
}
```

---

### Task 6: Daily Puzzle Content System

**Objective:** Build the puzzle generation system with "this day in history" content.

**Files:**
- Create: `src/lib/puzzle-generator.ts`
- Create: `src/app/api/puzzle/today/route.ts`
- Create: `src/app/api/puzzle/[date]/route.ts`
- Create: `prisma/seed-puzzles.ts`

**Content strategy:**
- Seed database with 365+ days of curated "this day in history" locations
- Each location has: coordinates, name, country, historical story, optional image
- Categories: wars/battles, discoveries, inventions, cultural events, natural events, famous births
- Fallback: Wikipedia "On this day" API + geocoding

---

## Phase 3: Social & Competitive Features

### Task 7: Leaderboard System

**Objective:** Global, regional, monthly, and group leaderboards.

**Files:**
- Create: `src/app/api/leaderboard/route.ts`
- Create: `src/components/leaderboard/LeaderboardTable.tsx`
- Create: `src/components/leaderboard/RegionalLeaderboard.tsx`
- Create: `src/app/leaderboard/page.tsx`

**Leaderboard types:**
- Today's top scores (global)
- Monthly cumulative scores
- Regional (auto-detected or user-set: NA, Europe, Asia, etc.)
- Streaks leaderboard
- Group-specific daily/monthly

---

### Task 8: Versus Mode

**Objective:** Real-time head-to-head geography duels.

**Files:**
- Create: `src/app/versus/page.tsx`
- Create: `src/components/versus/VersusLobby.tsx`
- Create: `src/components/versus/VersusGame.tsx`
- Create: `src/components/versus/VersusResults.tsx`
- Create: `src/app/api/versus/route.ts`
- Create: `src/lib/socket-server.ts`
- Create: `src/hooks/useVersusSocket.ts`

**Features:**
- Challenge a friend or random matchmaking
- Same 5 locations, 25-second timer per round
- Real-time score updates via WebSocket
- ELO rating changes for ranked matches
- Match replay viewing
- Group versus matches (tournament style)

---

### Task 9: Groups System

**Objective:** Create/join groups, group leaderboards, group chat.

**Files:**
- Create: `src/app/groups/page.tsx`
- Create: `src/app/groups/[id]/page.tsx`
- Create: `src/components/groups/GroupCard.tsx`
- Create: `src/components/groups/GroupChat.tsx`
- Create: `src/components/groups/GroupLeaderboard.tsx`
- Create: `src/app/api/groups/route.ts`

**Features:**
- Create group with shareable code/link
- Public vs private groups
- Group daily leaderboard (per-round breakdown)
- Simple chat/trash talk
- Admin controls (kick, manage)

---

### Task 10: Sharing & Social

**Objective:** Generate shareable score cards (emoji grid, image).

**Files:**
- Create: `src/lib/share-generator.ts`
- Create: `src/components/game/ShareCard.tsx`

**Share format (Worldle-inspired):**
```
🌍 GeoGlobe #685 — 4,250/5,000
📍 ⬛⬛⬛ 🟩 (12 km)
📍 ⬛⬛ 🟨 (340 km)
📍 ⬛⬛⬛⬛ 🟥 (2,100 km)
📍 ⬛⬛ 🟩 (48 km)
📍 ⬛⬛⬛ 🟩 (5 km)
🔥 Streak: 14
https://geoglobe.app
```

---

## Phase 4: Practice & Content Depth

### Task 11: Practice Mode Hub

**Objective:** Multiple practice modes for unlimited play.

**Files:**
- Create: `src/app/practice/page.tsx`
- Create: `src/app/practice/[mapId]/page.tsx`
- Create: `src/components/practice/PracticeCard.tsx`
- Create: `src/app/api/practice/route.ts`

**Practice map types:**
- World Capitals (all 195)
- Major Cities by continent
- Countries by Flag
- Famous Landmarks
- Natural Wonders
- US States
- European countries
- Themed: Ancient Wonders, World Wars, Space History, Sports Venues
- Short (5), Medium (10), Long (15) daily practice
- Challenge mode (5 locations in 25 seconds)
- Photo clue mode

---

### Task 12: Personalized Practice (Premium)

**Objective:** AI-driven practice that targets weak areas.

**Files:**
- Create: `src/lib/practice-recommender.ts`
- Create: `src/app/api/practice/personalized/route.ts`

**Logic:**
- Track per-region/country performance over time
- Identify continents/regions where user consistently scores low
- Generate daily custom practice maps targeting weak zones
- Spaced repetition: bring back locations they got wrong 3, 7, 14 days ago

---

### Task 13: XP, Leveling, and Badges

**Objective:** Progression system with levels, badges, and achievements.

**Files:**
- Create: `src/lib/progression.ts`
- Create: `src/components/profile/BadgeGrid.tsx`
- Create: `src/components/profile/LevelProgress.tsx`
- Create: `src/app/profile/page.tsx`

**XP sources:**
- Daily game completion (+50 XP)
- Perfect round (1000 pts) (+25 XP bonus)
- Streak milestones (+100 XP)
- Versus win (+30 XP)
- Practice completion (+15 XP)

**Badges:** Perfect Day, 7-Day Streak, 30-Day Streak, Continental Master (perfect on all 7 continents), Globe Trotter (played 100 days), Versus Champion (10 wins), etc.

---

## Phase 5: Premium & Polish

### Task 14: Premium Tier (GeoGlobe+)

**Objective:** Monetization via premium subscription.

**Files:**
- Create: `src/lib/premium.ts`
- Create: `src/app/api/subscription/route.ts`
- Create: `src/components/premium/UpgradeModal.tsx`

**Free tier includes:**
- Daily game (today only)
- Basic practice maps
- Global leaderboard
- Join 1 group
- Versus mode (unranked)

**Premium features ($2.99/mo or $19.99/yr):**
- Play missed days (up to 90 days back)
- Personalized practice maps
- Create unlimited groups
- Enhanced zoom on globe
- Special visual effects (shooting stars, aurora)
- Ad-free experience
- Ranked versus with ELO
- Archive access (all past puzzles)
- Priority support

---

### Task 15: Responsive Design & Mobile Optimization

**Objective:** Ensure perfect experience on mobile, tablet, and desktop.

**Files:**
- Modify: All component files for responsive breakpoints
- Create: `src/components/mobile/MobileNav.tsx`
- Create: `src/components/mobile/TouchControls.tsx`

**Mobile considerations:**
- Touch-friendly globe interaction (pinch-zoom, swipe-rotate)
- Bottom sheet for location cards (not overlaying globe)
- Haptic feedback on pin drop (where supported)
- Reduced polygon count on mobile for performance
- Progressive Web App (PWA) with offline support for cached puzzles

---

### Task 16: Internationalization (i18n)

**Objective:** Multi-language support (starting with 5 languages).

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/locales/en.json`
- Create: `src/locales/es.json`
- Create: `src/locales/fr.json`
- Create: `src/locales/de.json`
- Create: `src/locales/ja.json`

**Implementation:** next-intl or react-i18next with language detection and user preference storage.

---

## Phase 6: Deployment & Launch

### Task 17: API Rate Limiting & Security

**Objective:** Protect API endpoints, prevent cheating.

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/rate-limiter.ts`
- Create: `src/lib/anti-cheat.ts`

**Anti-cheat measures:**
- Server-side answer validation only (never send answers to client before guess)
- Rate limiting on guess submissions
- Time validation (can't submit faster than physically possible)
- Score verification on leaderboard entries

---

### Task 18: Deployment Setup

**Objective:** Deploy to Vercel (frontend) + Railway (database).

**Steps:**
1. Configure Vercel project with environment variables
2. Set up Railway PostgreSQL instance
3. Run Prisma migrations in production
4. Configure custom domain
5. Set up monitoring (Vercel Analytics, error tracking)
6. Configure CDN for globe textures/images

---

## File Structure Overview

```
geoglobe/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed-puzzles.ts
├── public/
│   ├── textures/          # Globe textures
│   ├── images/            # Location photos
│   └── icons/             # Badges, pins
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Daily game
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── puzzle/
│   │   │   ├── leaderboard/
│   │   │   ├── versus/
│   │   │   ├── groups/
│   │   │   ├── practice/
│   │   │   └── subscription/
│   │   ├── leaderboard/page.tsx
│   │   ├── versus/page.tsx
│   │   ├── groups/page.tsx
│   │   ├── practice/page.tsx
│   │   ├── profile/page.tsx
│   │   └── home/page.tsx
│   ├── components/
│   │   ├── globe/
│   │   ├── game/
│   │   ├── auth/
│   │   ├── leaderboard/
│   │   ├── versus/
│   │   ├── groups/
│   │   ├── practice/
│   │   ├── profile/
│   │   ├── premium/
│   │   ├── mobile/
│   │   └── ui/             # Shared UI components
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── game-engine.ts
│   │   ├── globe-config.ts
│   │   ├── scoring.ts
│   │   ├── share-generator.ts
│   │   ├── progression.ts
│   │   ├── premium.ts
│   │   ├── puzzle-generator.ts
│   │   ├── practice-recommender.ts
│   │   ├── socket-server.ts
│   │   ├── rate-limiter.ts
│   │   ├── anti-cheat.ts
│   │   └── i18n.ts
│   └── locales/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Development Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 2-3 days | Foundation (scaffold, DB, auth) |
| Phase 2 | 4-5 days | Globe + core game engine |
| Phase 3 | 3-4 days | Social features (leaderboard, versus, groups) |
| Phase 4 | 2-3 days | Practice modes + progression |
| Phase 5 | 2-3 days | Premium, mobile, i18n |
| Phase 6 | 1-2 days | Deployment + security |
| **Total** | **~2-3 weeks** | MVP with all major features |

---

## Key Technical Decisions

1. **Globe.GL over CesiumJS** — lighter weight, simpler API, purpose-built for globe visualization (same choice as Plonk.world)
2. **Next.js App Router** — SSR for SEO, API routes collocated, React Server Components for performance
3. **PostgreSQL over MongoDB** — relational data (users, scores, groups) fits SQL perfectly
4. **Socket.io for Versus** — proven real-time library, handles reconnection gracefully
5. **No Google Maps dependency** — avoids API costs, uses open texture data instead
6. **Progressive enhancement** — core game works without WebGL (flat map fallback)
