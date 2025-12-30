# Linguae Romanicae — Project Brief

## What You're Building

A mobile-first, gamified language learning Progressive Web App for Romance languages (Spanish, French, Italian, Portuguese).

## Core Concept

Users learn through 5 sequential tasks per lesson:
1. **Listen & Read** — Listen to audio while reading sentences (5x)
2. **Shadowing** — Listen, pause, repeat aloud with voice recording (5x per sentence)
3. **Scriptorium** — Type each sentence while speaking aloud
4. **Translation Written** — See English, type target language
5. **Translation Verbal** — See English, record yourself speaking target language

## Tech Stack (Non-negotiable)

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
State:     Zustand (with persistence)
Audio:     Howler.js
Recording: MediaRecorder API
Backend:   Express.js + TypeScript
Database:  PostgreSQL + Drizzle ORM
Auth:      JWT + Passport.js (email + Google + Apple OAuth)
PWA:       vite-plugin-pwa + Workbox
Storage:   Replit Object Storage (for audio files)
```

## Key Features

- 4 languages at launch (expandable to 42)
- Gamification: XP, levels, streaks, achievements, leaderboards
- Voice recording for self-review
- Audio player with speed control, A-B loop, sentence navigation
- Offline support (PWA)
- Dark/light theme toggle
- Admin panel for content management (2 admins max)
- Future monetization hooks (lesson locking)

## Files Included

| File | Purpose |
|------|---------|
| `02-SPEC.md` | Complete technical specification (database, API, components, design) |
| `03-PHASES.md` | Step-by-step build instructions with exact prompts |
| `04-lesson-1-sentences.json` | Seed data: 154 sentences in 4 languages |
| `audio/` | 8 MP3 files (4 languages × 2 audio types) |

## How to Use These Files

1. **Read this brief** — You're doing that now
2. **Read 02-SPEC.md completely** — This is your reference document
3. **Follow 03-PHASES.md** — Execute one phase at a time, verify, then continue

## Important Constraints

- Mobile-first responsive design
- Offline-capable (PWA)
- All progress must sync when back online
- Voice recordings stored locally first, optional cloud sync
- Admin panel is desktop-optimized but responsive
- Max 2 admin accounts

## Design Direction

"Neo-Mediterranean" aesthetic:
- Primary: Warm terracotta (#e67040)
- Secondary: Mediterranean blue (#0c9eeb)
- Accent: Olive gold (#c7b80e)
- Typography: Playfair Display (headings) + Source Sans 3 (body)

---

**Next Step:** Read `02-SPEC.md` in full, then confirm you're ready to start Phase 1.
