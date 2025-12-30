# Linguae Romanicae — Build Phases

## How to Use This Document

1. Copy-paste each **PROMPT** into Claude Code
2. Wait for Claude Code to complete the phase
3. Test/verify the checklist items
4. Move to next phase

> ⚠️ **Important:** Give Claude Code the `02-SPEC.md` file first. These prompts assume it has already read the full specification.

---

## Pre-Flight: Orient Claude Code

### PROMPT 0 — Initial Setup

```
I'm giving you the complete specification for a language learning app called "Linguae Romanicae."

Please read these files completely:
1. 01-PROJECT-BRIEF.md — Overview and context
2. 02-SPEC.md — Full technical specification

After reading, confirm:
- You understand the 5-task learning methodology
- You understand the tech stack
- You understand the database schema
- You have questions (if any)

Don't write any code yet. Just confirm understanding.
```

**✓ Expected Response:** Claude Code summarizes the project and confirms understanding or asks clarifying questions.

---

## Phase 1: Project Foundation

### PROMPT 1A — Project Structure

```
Start Phase 1: Project Foundation

Create the project structure with proper configuration files:

1. Root workspace setup:
   - package.json with workspaces (client, server, shared)
   - replit.nix for Node.js 20
   - .gitignore
   - tsconfig.base.json

2. Server setup (server/):
   - package.json with all dependencies from spec
   - tsconfig.json extending base
   - drizzle.config.ts

3. Client setup (client/):
   - package.json with all dependencies from spec
   - vite.config.ts with PWA plugin
   - tsconfig.json
   - tailwind.config.ts
   - postcss.config.js
   - index.html

4. Shared types (shared/):
   - package.json
   - types.ts with all interfaces from spec
   - schemas.ts with Zod validation schemas

Create all config files with the exact dependencies from the spec. Don't create component files yet.
```

**✓ Checklist:**
- [ ] Root package.json has workspace config
- [ ] Server has all dependencies (drizzle-orm, express, passport, etc.)
- [ ] Client has all dependencies (react, vite, tailwind, howler, zustand, etc.)
- [ ] TypeScript configs are properly linked
- [ ] Tailwind config includes custom colors from design system

---

### PROMPT 1B — Database Schema

```
Create the complete database schema.

File: server/src/db/schema.ts

Include ALL tables from the spec:
- users (with OAuth fields)
- refreshTokens
- languages
- lessons
- sentences
- userLanguages
- lessonProgress
- taskProgress
- recordings
- streaks
- xpLogs
- achievementDefinitions
- userAchievements
- contentUploads

Use Drizzle ORM with PostgreSQL. Include all indexes from the spec.

Also create:
- server/src/config/database.ts — Drizzle connection setup
- server/src/config/env.ts — Environment variable validation with Zod
```

**✓ Checklist:**
- [ ] All 14 tables defined
- [ ] Proper foreign key relationships
- [ ] Indexes on frequently queried columns
- [ ] UUID primary keys with defaultRandom()
- [ ] Timestamps with defaultNow()

---

### PROMPT 1C — Express Server Skeleton

```
Create the Express server foundation.

Files to create:

1. server/src/app.ts
   - Express app setup
   - CORS configuration
   - JSON body parser
   - Cookie parser
   - Route mounting
   - Error handler middleware

2. server/src/index.ts
   - Server entry point
   - Database connection
   - Port configuration

3. server/src/middleware/errorHandler.ts
   - Global error handler
   - Consistent error response format

4. server/src/middleware/auth.ts
   - JWT verification middleware
   - Extract user from token

5. server/src/middleware/admin.ts
   - Admin role check middleware

6. server/src/utils/jwt.ts
   - Sign access token
   - Sign refresh token
   - Verify tokens

7. server/src/utils/password.ts
   - Hash password (bcrypt)
   - Compare password

Create placeholder route files (empty exports for now):
- server/src/routes/auth.ts
- server/src/routes/users.ts
- server/src/routes/languages.ts
- server/src/routes/lessons.ts
- server/src/routes/progress.ts
- server/src/routes/gamification.ts
- server/src/routes/recordings.ts
- server/src/routes/admin.ts

The server should start without errors even with empty routes.
```

**✓ Checklist:**
- [ ] `npm run dev:server` starts without errors
- [ ] Environment variables validated on startup
- [ ] Middleware chain is correct
- [ ] JWT utilities work

---

### PROMPT 1D — Authentication (Email/Password)

```
Implement email/password authentication.

Files to create/update:

1. server/src/services/authService.ts
   - register(email, password, displayName)
   - login(email, password)
   - logout(refreshToken)
   - refreshAccessToken(refreshToken)
   - validateRefreshToken(token)

2. server/src/controllers/authController.ts
   - Handle HTTP requests/responses
   - Set httpOnly cookies for refresh token

3. server/src/routes/auth.ts
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/refresh
   - GET /api/auth/me (protected)

Implement proper error handling:
- 400 for validation errors
- 401 for invalid credentials
- 409 for duplicate email

Use the response format from spec:
{ success: true, data: {...} } or { success: false, error: {...} }
```

**✓ Checklist:**
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Access token expires in 15 minutes
- [ ] Refresh token stored in httpOnly cookie
- [ ] Can refresh access token
- [ ] Can logout (invalidates refresh token)
- [ ] GET /api/auth/me returns user data when authenticated

---

### PROMPT 1E — React App Foundation

```
Create the React app foundation.

Files to create:

1. client/src/main.tsx — Entry point with React 18

2. client/src/App.tsx
   - React Router setup
   - Route definitions (placeholder pages for now)
   - Theme provider wrapper

3. client/src/styles/globals.css
   - Tailwind imports
   - CSS variables for entire color system from spec
   - Dark theme variables
   - Font imports (Playfair Display, Source Sans 3)

4. client/src/stores/authStore.ts
   - Zustand store for auth state
   - user, isAuthenticated, isLoading
   - login, logout, setUser actions
   - Persist to localStorage

5. client/src/stores/settingsStore.ts
   - theme ('light' | 'dark' | 'system')
   - soundEffects boolean
   - Persist to localStorage

6. client/src/hooks/useTheme.ts
   - Apply theme to document
   - Handle system preference

7. client/src/services/api.ts
   - Fetch wrapper with auth headers
   - Automatic token refresh on 401
   - Base URL configuration

8. client/src/pages/Home.tsx — Simple placeholder
9. client/src/pages/Auth.tsx — Simple placeholder
10. client/src/components/layout/ThemeToggle.tsx

The app should render with working dark/light toggle.
```

**✓ Checklist:**
- [ ] `npm run dev:client` starts Vite
- [ ] App renders without errors
- [ ] Theme toggle works (dark/light)
- [ ] CSS variables apply correctly
- [ ] Fonts load

---

## Phase 2: Content & Display

### PROMPT 2A — Language & Lesson API

```
Create the content API endpoints.

1. server/src/services/lessonService.ts
   - getLanguages() — active languages
   - getLanguage(code)
   - getLessons(languageId)
   - getLesson(id) — with sentences
   - getSentences(lessonId)

2. server/src/controllers/lessonController.ts

3. server/src/routes/languages.ts
   - GET /api/languages
   - GET /api/languages/:code
   - GET /api/languages/:code/lessons

4. server/src/routes/lessons.ts
   - GET /api/lessons
   - GET /api/lessons/:id
   - GET /api/lessons/:id/sentences

Include proper typing and error handling.
```

**✓ Checklist:**
- [ ] GET /api/languages returns array of languages
- [ ] GET /api/languages/es returns Spanish details
- [ ] GET /api/lessons?language=es returns Spanish lessons
- [ ] GET /api/lessons/:id returns lesson with metadata
- [ ] GET /api/lessons/:id/sentences returns all sentences

---

### PROMPT 2B — Database Seed Script

```
Create the database seed script.

File: server/src/db/seed.ts

Use the data from 04-lesson-1-sentences.json to seed:

1. Languages (4 records):
   - Spanish (es, 🇪🇸)
   - French (fr, 🇫🇷)
   - Italian (it, 🇮🇹)
   - Portuguese (pt, 🇧🇷)

2. Lesson 1 for each language:
   - lessonNumber: 1
   - title: "150 Conversation Sentences"
   - sentenceCount: 154
   - estimatedMinutes: 60
   - xpReward: 100

3. Sentences (154 per language = 616 total):
   - Map from JSON structure
   - english field is same for all
   - target field is language-specific

4. Achievement definitions (all from spec)

5. Admin user:
   - Use ADMIN_EMAIL and ADMIN_PASSWORD from env
   - role: 'admin'

Make the script idempotent (can run multiple times safely).
```

**✓ Checklist:**
- [ ] `npm run db:seed` completes without errors
- [ ] 4 languages in database
- [ ] 4 lessons (one per language)
- [ ] 616 sentences total
- [ ] Achievement definitions created
- [ ] Admin user exists

---

### PROMPT 2C — Language Selection Page

```
Create the language selection UI.

Files:

1. client/src/pages/LanguageSelect.tsx
   - Grid of 4 language cards
   - Flag, name, native name
   - Progress indicator if user has started
   - Click navigates to lesson list

2. client/src/components/ui/Card.tsx
   - Reusable card component
   - Hover effects
   - Optional accent border

3. client/src/components/ui/Progress.tsx
   - Linear progress bar
   - Animated fill
   - Percentage label option

4. client/src/services/languages.ts
   - API calls for languages
   - Type definitions

Use the Neo-Mediterranean design system:
- Warm terracotta accents
- Subtle shadows
- Rounded corners (radius-xl)
- Smooth hover transitions

Make it mobile-first (single column on mobile, 2x2 grid on tablet+).
```

**✓ Checklist:**
- [ ] Shows 4 language cards
- [ ] Cards have flag, name, native name
- [ ] Hover effect works
- [ ] Mobile layout is single column
- [ ] Clicking card navigates to /lessons/:languageCode

---

### PROMPT 2D — Lesson List Page

```
Create the lesson list UI.

Files:

1. client/src/pages/LessonList.tsx
   - Header with language name and flag
   - Back button to language select
   - List of lesson cards
   - Each card shows: number, title, task progress (5 dots), time, XP

2. client/src/components/lessons/LessonCard.tsx
   - Lesson number badge
   - Title
   - Task completion indicator (5 small circles)
   - Time spent
   - XP earned
   - Lock icon if isLocked
   - Progress percentage

3. client/src/components/lessons/TaskProgress.tsx
   - 5 circles in a row
   - Filled = completed, empty = not started, partial = in progress
   - Animated on state change

4. client/src/services/lessons.ts
   - getLessons(languageCode)
   - getLesson(id)

For now, only Lesson 1 will appear. The architecture should support multiple lessons.
```

**✓ Checklist:**
- [ ] Shows lessons for selected language
- [ ] Lesson card displays all info
- [ ] Task progress shows 5 circles
- [ ] Back navigation works
- [ ] Clicking lesson navigates to /lesson/:id

---

### PROMPT 2E — Sentence Display Component

```
Create the sentence display component used across tasks.

Files:

1. client/src/components/lessons/SentenceDisplay.tsx
   - Shows target language sentence (large)
   - Shows English translation (smaller, muted)
   - Optional: show/hide English toggle
   - Optional: pronunciation hint
   - Index indicator (e.g., "42 of 154")

2. client/src/components/lessons/SentenceList.tsx
   - Scrollable list of all sentences
   - Current sentence highlighted
   - Click to jump to sentence
   - Used in Listen & Read task

3. client/src/stores/lessonStore.ts
   - Zustand store for active lesson
   - currentLesson, sentences
   - currentSentenceIndex
   - setCurrentSentence action

Make sentences beautiful with proper typography:
- Target language: text-2xl, font-medium
- English: text-base, text-muted
- Good spacing between sentences
```

**✓ Checklist:**
- [ ] SentenceDisplay shows both languages
- [ ] Can toggle English visibility
- [ ] SentenceList scrolls smoothly
- [ ] Current sentence is visually distinct
- [ ] Click on sentence updates currentSentenceIndex

---

## Phase 3: Audio System

### PROMPT 3A — Audio Player Core

```
Create the audio player using Howler.js.

Files:

1. client/src/hooks/useAudio.ts
   - Initialize Howl instance
   - play, pause, stop, seek
   - Get current position
   - Get duration
   - Set playback rate (0.5x to 2x)
   - Set volume
   - onEnd callback
   - Loading state

2. client/src/stores/audioStore.ts
   - isPlaying, isPaused
   - currentTime, duration
   - playbackRate
   - volume
   - isLoading
   - Actions to control playback

3. client/src/components/audio/AudioPlayer.tsx
   - Play/pause button (large, touch-friendly)
   - Progress bar (seekable)
   - Current time / duration display
   - Loading indicator

4. client/src/components/audio/PlaybackControls.tsx
   - Speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
   - Volume slider
   - Compact design

The player should be fixed at the bottom on mobile.
Use large touch targets (min 48px).
```

**✓ Checklist:**
- [ ] Audio loads and plays
- [ ] Play/pause toggles correctly
- [ ] Progress bar shows position
- [ ] Can seek by clicking progress bar
- [ ] Speed control changes playback rate
- [ ] Volume control works
- [ ] Loading state shows spinner

---

### PROMPT 3B — A-B Loop & Sentence Navigation

```
Add A-B loop and sentence navigation features.

Files:

1. client/src/components/audio/ABLoopControl.tsx
   - Set A point button
   - Set B point button
   - Clear loop button
   - Visual indicator showing loop region
   - When active, audio loops between A and B

2. client/src/hooks/useABLoop.ts
   - pointA, pointB state
   - setA() — sets to current position
   - setB() — sets to current position
   - clear() — removes loop
   - isActive computed

3. client/src/components/audio/SentenceNavigator.tsx
   - Previous sentence button
   - Next sentence button
   - Jump to sentence dropdown/modal
   - Uses audioStartMs/audioEndMs from sentence data

4. Update useAudio.ts:
   - seekToSentence(index) — uses sentence timestamps
   - Handle loop logic in onEnd

For MVP, sentence timestamps can be estimated (evenly divided).
Make the A-B loop region visible on the progress bar.
```

**✓ Checklist:**
- [ ] Can set A point
- [ ] Can set B point
- [ ] Audio loops between A and B
- [ ] Can clear loop
- [ ] Loop region visible on progress bar
- [ ] Previous/Next sentence buttons work
- [ ] Can jump to specific sentence

---

### PROMPT 3C — Voice Recorder

```
Create the voice recording system.

Files:

1. client/src/hooks/useRecorder.ts
   - Request microphone permission
   - start() — begin recording
   - stop() — end recording, return Blob
   - pause() / resume()
   - isRecording, isPaused, duration
   - Error handling for denied permission

2. client/src/components/audio/VoiceRecorder.tsx
   - Record button (red when recording)
   - Stop button
   - Recording duration display
   - Waveform visualization (simple amplitude bars)
   - Permission request UI

3. client/src/components/audio/RecordingPlayback.tsx
   - Play recorded audio
   - Delete recording
   - Compare button (play original, then user recording)
   - Simple waveform display

4. client/src/stores/recordingStore.ts
   - recordings array (stored in IndexedDB)
   - addRecording, deleteRecording
   - getRecordingsForSentence

Use MediaRecorder API with audio/webm format.
Store recordings locally in IndexedDB (don't upload to server yet).
```

**✓ Checklist:**
- [ ] Microphone permission requested
- [ ] Recording starts/stops
- [ ] Duration displays while recording
- [ ] Can playback recording
- [ ] Can delete recording
- [ ] Recordings persist in IndexedDB

---

## Phase 4: The Five Tasks

### PROMPT 4A — Task 1: Listen & Read

```
Create the Listen & Read task.

File: client/src/components/tasks/ListenReadTask.tsx

Requirements:
- Display all sentences in scrollable list
- Current sentence highlighted during playback
- Audio player at bottom (short audio file)
- Repetition counter: "Listen 3 of 5"
- Auto-increment rep counter when audio completes
- Complete button after 5 listens
- Progress auto-saves

UI Flow:
1. User sees all 154 sentences
2. Presses play, audio starts
3. Current sentence highlights as audio plays (estimated timing)
4. When audio ends, rep counter increments
5. User replays (manual or auto-loop option)
6. After 5 complete listens, task marked complete

Also create:
- client/src/pages/Task.tsx — Container that loads correct task component
- client/src/pages/Lesson.tsx — Shows lesson overview and task navigation
```

**✓ Checklist:**
- [ ] Sentence list displays
- [ ] Audio plays short audio file
- [ ] Rep counter increments on complete
- [ ] After 5 reps, shows completion
- [ ] Progress saves to store
- [ ] Can navigate back to lesson overview

---

### PROMPT 4B — Task 3: Scriptorium

```
Create the Scriptorium task (typing exercise).

File: client/src/components/tasks/ScriptoriumTask.tsx

Requirements:
- Show target sentence at top
- Text input field below
- Optional: play sentence audio button
- Character-by-character feedback (green = correct, red = wrong)
- Submit button to check full sentence
- If correct: auto-advance to next sentence
- If incorrect: highlight errors, allow retry
- Progress: "Sentence 42 of 154"
- Skip button (with confirmation)

UI Details:
- Large, clear text input
- On mobile: input should not be covered by keyboard
- Gentle error feedback (not harsh)
- Celebration micro-animation on correct

Also track:
- Sentences completed
- Time spent on task
- Accuracy percentage (optional)
```

**✓ Checklist:**
- [ ] Target sentence displays
- [ ] Can type in input field
- [ ] Character feedback shows correctness
- [ ] Correct submission advances
- [ ] Incorrect shows errors
- [ ] Progress indicator updates
- [ ] Task completes after all sentences

---

### PROMPT 4C — Task 4: Translation (Written)

```
Create the Written Translation task.

File: client/src/components/tasks/TranslationWriteTask.tsx

Requirements:
- Show English sentence only
- User types target language translation
- Submit to check
- Reveal correct answer
- Self-assessment: "Got it" / "Needs practice"
- If "Needs practice": add to review queue (optional)
- Progress through all sentences
- Flashcard-style navigation

UI Flow:
1. English sentence displayed prominently
2. Empty text input
3. User types their translation
4. Press "Check" or Enter
5. Correct answer revealed below
6. User compares and self-assesses
7. Next sentence

Don't do exact string matching — user self-assesses.
```

**✓ Checklist:**
- [ ] English sentence shows
- [ ] Target language hidden initially
- [ ] Can type translation
- [ ] Reveal shows correct answer
- [ ] Self-assessment buttons work
- [ ] Progress through all sentences
- [ ] Task completes after all sentences

---

### PROMPT 4D — Task 2: Shadowing

```
Create the Shadowing task (most complex).

File: client/src/components/tasks/ShadowingTask.tsx

Requirements:
- Show single sentence (large)
- Play button plays sentence audio (from long audio file, using timestamps)
- After playback, auto-start recording
- User repeats sentence aloud
- Auto-stop recording after ~5 seconds or manual stop
- Show playback controls for recording
- "Compare" button: plays original then user recording
- Rep counter per sentence (0/5)
- After 5 reps, advance to next sentence
- Progress: "Sentence 42 of 154"

Audio Flow:
1. User presses play
2. Sentence audio plays (from timestamp)
3. Brief pause
4. Recording auto-starts (with countdown 3-2-1)
5. User speaks
6. Recording stops
7. User can playback, compare, or move on

Store recordings locally. Show comparison UI.
```

**✓ Checklist:**
- [ ] Single sentence displays
- [ ] Plays correct audio segment
- [ ] Recording starts after playback
- [ ] Countdown before recording
- [ ] Recording saves locally
- [ ] Can playback recording
- [ ] Can compare original vs recording
- [ ] Rep counter per sentence
- [ ] Advances after 5 reps
- [ ] Task completes after all sentences × 5 reps

---

### PROMPT 4E — Task 5: Translation (Verbal)

```
Create the Verbal Translation task.

File: client/src/components/tasks/TranslationVerbalTask.tsx

Requirements:
- Show English sentence only
- User presses record and speaks translation
- Recording saved
- Reveal correct answer (text)
- Optionally play reference audio
- Self-assessment: "Got it" / "Needs practice"
- Flashcard-style navigation
- 5 passes through entire list

UI Flow:
1. English sentence shown
2. User presses record
3. User speaks translation aloud
4. User stops recording
5. Tap to reveal correct text
6. User listens to their recording vs reads correct answer
7. Self-assesses
8. Next sentence

Track:
- Current pass (1-5)
- Sentences completed this pass
- Overall progress
```

**✓ Checklist:**
- [ ] English sentence shows
- [ ] Record button works
- [ ] Recording saves
- [ ] Can reveal correct answer
- [ ] Self-assessment buttons
- [ ] Tracks 5 passes
- [ ] Task completes after 5 full passes

---

## Phase 5: Progress & Gamification

### PROMPT 5A — Progress Tracking API

```
Create the progress tracking system.

Server files:

1. server/src/services/progressService.ts
   - getUserProgress(userId)
   - getLessonProgress(userId, lessonId)
   - updateLessonProgress(userId, lessonId, data)
   - updateTaskProgress(userId, lessonId, taskNumber, data)
   - syncOfflineProgress(userId, progressArray)

2. server/src/controllers/progressController.ts

3. server/src/routes/progress.ts
   - GET /api/progress — all user progress
   - GET /api/progress/lessons/:id
   - POST /api/progress/lessons/:id — update lesson progress
   - POST /api/progress/lessons/:id/tasks/:taskNum — update task
   - POST /api/progress/sync — batch sync

Client files:

4. client/src/stores/progressStore.ts
   - Progress state per lesson
   - Offline queue for sync
   - Actions: updateTaskProgress, syncProgress

5. client/src/services/progress.ts
   - API calls with offline fallback
   - Queue updates when offline
   - Sync when back online

6. client/src/hooks/useProgress.ts
   - Get/update progress
   - Handle sync status
```

**✓ Checklist:**
- [ ] Progress saves to server
- [ ] Progress loads on app start
- [ ] Offline changes queued
- [ ] Sync happens when online
- [ ] Task completion updates lesson progress
- [ ] Lesson marked complete when all 5 tasks done

---

### PROMPT 5B — XP & Leveling System

```
Create the XP and leveling system.

Server files:

1. server/src/services/xpService.ts
   - awardXP(userId, amount, source, sourceId)
   - getUserXP(userId)
   - calculateLevel(totalXP)
   - getLevelProgress(totalXP) — progress to next level

2. Update progressService.ts:
   - Award XP when tasks complete
   - Award bonus XP when lesson completes
   - XP values from spec

Client files:

3. client/src/components/gamification/XPBar.tsx
   - Current level display
   - Progress bar to next level
   - XP count
   - Animated XP gain

4. client/src/components/gamification/LevelIndicator.tsx
   - Level badge with number
   - Level title (Novice, Apprentice, etc.)

5. client/src/components/gamification/XPGainPopup.tsx
   - "+20 XP" popup when earning XP
   - Animated entrance/exit
   - Auto-dismiss

Trigger XP awards:
- Task 1 complete: 20 XP
- Task 2 complete: 30 XP
- Task 3 complete: 25 XP
- Task 4 complete: 25 XP
- Task 5 complete: 30 XP
- Full lesson bonus: 50 XP
```

**✓ Checklist:**
- [ ] XP awarded on task completion
- [ ] XP bar shows progress
- [ ] Level increases at thresholds
- [ ] XP gain popup appears
- [ ] Level title updates

---

### PROMPT 5C — Streak System

```
Create the streak system.

Server files:

1. server/src/services/streakService.ts
   - updateStreak(userId) — called on any activity
   - getStreak(userId)
   - Logic: if last activity was yesterday, increment; if today, no change; if older, reset to 1

2. Update routes to call updateStreak on task completion

Client files:

3. client/src/components/gamification/StreakCounter.tsx
   - Fire icon
   - Current streak number
   - Animated flame effect
   - Milestone celebrations (7, 30, 100 days)

4. client/src/hooks/useStreak.ts
   - Get streak data
   - Check if streak at risk (not practiced today)

5. client/src/components/gamification/StreakReminder.tsx
   - Show if user hasn't practiced today
   - "Keep your streak alive!"

Streak rules:
- Any task completion counts as daily activity
- Based on UTC date
- Streak at risk shows after 8pm local time
```

**✓ Checklist:**
- [ ] Streak increments on daily activity
- [ ] Streak resets after missed day
- [ ] Streak counter displays
- [ ] Fire animation works
- [ ] Streak reminder shows when needed

---

### PROMPT 5D — Achievements

```
Create the achievements system.

Server files:

1. server/src/services/achievementService.ts
   - checkAchievements(userId) — check all unlockable
   - unlockAchievement(userId, achievementId)
   - getUserAchievements(userId)
   - getAchievementDefinitions()

2. server/src/routes/gamification.ts
   - GET /api/gamification/achievements
   - GET /api/gamification/stats

3. Trigger achievement checks:
   - After lesson complete
   - After streak update
   - After XP award

Client files:

4. client/src/components/gamification/AchievementBadge.tsx
   - Icon from Lucide
   - Name
   - Locked/unlocked state
   - Unlocked date

5. client/src/components/gamification/AchievementUnlockPopup.tsx
   - Full-screen celebration
   - Achievement icon and name
   - XP reward amount
   - Confetti effect
   - Dismiss button

6. client/src/pages/Achievements.tsx
   - Grid of all achievements
   - Unlocked vs locked sections
   - Progress toward locked ones

Implement at least these achievements:
- first_lesson, first_language
- streak_7, streak_30
- lessons_5
- two_languages
```

**✓ Checklist:**
- [ ] Achievement definitions in database
- [ ] Auto-unlock when criteria met
- [ ] Unlock popup appears
- [ ] Achievements page shows all
- [ ] Locked achievements show requirements

---

### PROMPT 5E — Leaderboard

```
Create the leaderboard system.

Server files:

1. server/src/services/leaderboardService.ts
   - getGlobalLeaderboard(limit, offset)
   - getLanguageLeaderboard(languageCode, limit, offset)
   - getUserRank(userId)
   - Weekly reset logic (optional)

2. server/src/routes/gamification.ts
   - GET /api/gamification/leaderboard
   - GET /api/gamification/leaderboard/:language

Client files:

3. client/src/components/gamification/Leaderboard.tsx
   - Tab switcher: Global / Per Language
   - Top 10 list
   - User avatars (or initials)
   - Display name
   - XP count
   - Rank number with medal (🥇🥈🥉)

4. client/src/pages/Leaderboard.tsx
   - Full leaderboard view
   - Scrollable list
   - Current user highlighted
   - "You are #42" indicator

5. client/src/components/gamification/LeaderboardMini.tsx
   - Compact view for dashboard
   - Top 3 + current user position
```

**✓ Checklist:**
- [ ] Global leaderboard loads
- [ ] Language-specific leaderboard works
- [ ] Top 3 have medals
- [ ] Current user highlighted
- [ ] User's rank shown

---

## Phase 6: Admin & Polish

### PROMPT 6A — Admin Panel

```
Create the admin panel.

Files:

1. client/src/pages/admin/Dashboard.tsx
   - Total users
   - Active users (7d, 30d)
   - Lessons completed chart
   - Popular languages pie chart

2. client/src/pages/admin/LessonManager.tsx
   - List all lessons
   - Filter by language
   - Edit lesson metadata
   - Upload audio files
   - Toggle active/locked

3. client/src/pages/admin/ContentUpload.tsx
   - CSV upload for sentences
   - Preview before import
   - Audio file upload
   - Processing status

4. client/src/pages/admin/UserManagement.tsx
   - Search users
   - View user details
   - Reset password (generate link)
   - User statistics

5. server/src/routes/admin.ts
   - All admin endpoints from spec
   - Protected by admin middleware

6. client/src/components/layout/AdminSidebar.tsx
   - Navigation for admin pages

Admin route protection:
- Check role === 'admin' on both client and server
- Redirect non-admins to home
```

**✓ Checklist:**
- [ ] Admin can access /admin routes
- [ ] Non-admins redirected
- [ ] Dashboard shows stats
- [ ] Can view/edit lessons
- [ ] Can upload CSV
- [ ] Can manage users

---

### PROMPT 6B — PWA & Offline

```
Implement PWA and offline support.

Files:

1. client/public/manifest.json
   - App name, icons, colors
   - Display: standalone
   - Orientation: portrait

2. client/vite.config.ts
   - Update vite-plugin-pwa config
   - Workbox strategies

3. client/src/sw-custom.ts (if needed)
   - Custom service worker logic

4. client/src/hooks/useOffline.ts
   - Detect online/offline status
   - Show offline indicator

5. client/src/components/ui/OfflineBanner.tsx
   - "You're offline" banner
   - Shows sync status

6. client/src/services/storage.ts
   - IndexedDB wrapper using idb
   - Store lessons, sentences locally
   - Store progress queue

7. Update audio handling:
   - Cache audio files for offline
   - "Download for offline" button per lesson

Caching strategy:
- Static assets: CacheFirst
- API data: NetworkFirst with fallback
- Audio: CacheFirst (explicit download)
```

**✓ Checklist:**
- [ ] App installable as PWA
- [ ] Works offline after first load
- [ ] Offline banner shows
- [ ] Progress syncs when back online
- [ ] Downloaded lessons work offline
- [ ] Service worker registered

---

### PROMPT 6C — Completion Celebrations

```
Add celebration animations and feedback.

Files:

1. client/src/components/lessons/CompletionCelebration.tsx
   - Full-screen celebration
   - Confetti burst
   - XP earned display
   - Achievements unlocked
   - "Continue" button

2. client/src/components/ui/Confetti.tsx
   - Canvas-based confetti
   - Customizable colors
   - Auto-cleanup

3. client/src/components/ui/Toast.tsx
   - Toast notification system
   - Success, error, info variants
   - Auto-dismiss

4. Add micro-animations:
   - Button press feedback
   - Progress bar fills
   - Card hover effects
   - Page transitions (Framer Motion)

5. Sound effects (optional):
   - Task complete chime
   - Achievement unlock
   - Level up fanfare
   - Toggle in settings

Use Framer Motion for all animations.
Keep celebrations joyful but not overwhelming.
```

**✓ Checklist:**
- [ ] Lesson complete shows celebration
- [ ] Confetti works
- [ ] Toast notifications work
- [ ] Animations are smooth
- [ ] Sound effects play (if enabled)

---

### PROMPT 6D — Mobile Polish & Navigation

```
Polish the mobile experience.

Files:

1. client/src/components/layout/BottomNav.tsx
   - Home, Languages, Profile, Settings
   - Active indicator
   - Fixed to bottom
   - Safe area padding (notch)

2. client/src/components/layout/Header.tsx
   - Back button where appropriate
   - Title
   - Streak counter (mini)
   - XP indicator

3. client/src/pages/Profile.tsx
   - User avatar/initials
   - Display name
   - Level and XP bar
   - Current streak
   - Languages learning
   - Recent achievements

4. client/src/pages/Settings.tsx
   - Theme toggle
   - Sound effects toggle
   - Daily goal setting
   - Account section (logout, delete)

5. Mobile optimizations:
   - Touch targets 48px minimum
   - No hover-dependent UI
   - Swipe gestures where appropriate
   - Pull-to-refresh on lists
   - Keyboard handling (input not covered)

Test on mobile viewport (375px width).
```

**✓ Checklist:**
- [ ] Bottom nav works on mobile
- [ ] Header shows relevant info
- [ ] Profile page complete
- [ ] Settings work
- [ ] Touch targets large enough
- [ ] Keyboard doesn't cover inputs

---

### PROMPT 6E — Final Testing & Deploy Prep

```
Final testing and deployment preparation.

Tasks:

1. Create .env.example with all required variables

2. Update README.md with:
   - Project description
   - Setup instructions
   - Environment variables
   - Database setup
   - Deployment steps

3. Test all user flows:
   - New user registration
   - Complete lesson 1 (all 5 tasks)
   - Check XP, streak, achievements
   - Offline mode
   - Admin content management

4. Performance checks:
   - Lighthouse audit
   - Bundle size optimization
   - Image optimization
   - Audio file loading

5. Security review:
   - Auth flows secure
   - Admin routes protected
   - XSS prevention
   - CSRF tokens if needed

6. Create production build:
   - npm run build
   - Test production build locally

List any remaining issues or TODOs.
```

**✓ Final Checklist:**
- [ ] All environment variables documented
- [ ] README complete
- [ ] All 5 tasks functional
- [ ] Gamification working
- [ ] Offline mode working
- [ ] Admin panel working
- [ ] Mobile experience polished
- [ ] Production build works
- [ ] No console errors
- [ ] Lighthouse score > 90

---

## Post-Launch: Replit Deployment

After Claude Code completes all phases:

1. Create new Replit project (Node.js 20)
2. Upload/push code to Replit
3. Set up Replit PostgreSQL database
4. Configure environment variables in Secrets
5. Upload audio files to Object Storage
6. Run database migrations and seed
7. Test deployment
8. Configure custom domain (optional)

---

**You're ready to build! Start with PROMPT 0.**
