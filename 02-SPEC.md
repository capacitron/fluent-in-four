# Linguae Romanicae
## Complete Application Specification v1.0

> **"Linguae Romanicae"** — Latin for "Romance Languages"
> A mobile-first, gamified language learning PWA for Spanish, French, Italian, and Portuguese

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication System](#5-authentication-system)
6. [Core Features](#6-core-features)
7. [Audio System](#7-audio-system)
8. [Gamification System](#8-gamification-system)
9. [UI/UX Design System](#9-uiux-design-system)
10. [Admin Panel](#10-admin-panel)
11. [PWA & Offline Support](#11-pwa--offline-support)
12. [API Specification](#12-api-specification)
13. [File Storage Strategy](#13-file-storage-strategy)
14. [Deployment Guide](#14-deployment-guide)
15. [Future Expansion](#15-future-expansion)
16. [Implementation Phases](#16-implementation-phases)

---

## 1. Executive Summary

### Vision
A beautiful, gamified language learning app that guides users through sentence-based learning using the proven methodology of listening, shadowing, scriptorium, and translation exercises.

### Core Methodology (Per Lesson)
Each lesson contains ~150 sentences with 5 sequential tasks:
1. **Listen & Read** — Listen to short audio 5x while reading sentences
2. **Shadowing** — Listen to long audio, repeat each sentence aloud 5x (with recording)
3. **Scriptorium** — Type each sentence while speaking aloud
4. **Translation (Written)** — Translate from English → target language by typing
5. **Translation (Verbal)** — Verbally translate, record yourself, compare

### Launch Languages
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)  
- 🇮🇹 Italian (Italiano)
- 🇧🇷 Portuguese (Português)

### Key Differentiators
- Voice recording for self-review
- Sentence-level audio navigation with timestamps
- A-B loop functionality
- Offline-first PWA
- Rich gamification (streaks, XP, achievements, leaderboards)
- Beautiful, modern UI with dark/light modes

---

## 2. Tech Stack

### Frontend
```
Framework:      React 18 with TypeScript
Build Tool:     Vite 5
Styling:        Tailwind CSS 3.4 + CSS Variables
State:          Zustand (lightweight, persistent)
Routing:        React Router 6
Forms:          React Hook Form + Zod validation
Audio:          Howler.js (robust audio with sprites)
Recording:      MediaRecorder API + lamejs (MP3 encoding)
Animations:     Framer Motion
Icons:          Lucide React
PWA:            Vite PWA Plugin + Workbox
```

### Backend
```
Runtime:        Node.js 20 LTS
Framework:      Express.js with TypeScript
ORM:            Drizzle ORM (type-safe, lightweight)
Database:       PostgreSQL (Replit's managed instance)
Auth:           Passport.js + JWT + OAuth2
Validation:     Zod (shared with frontend)
File Upload:    Multer
Storage:        Replit Object Storage API
```

### Infrastructure
```
Hosting:        Replit Deployments
Database:       Replit PostgreSQL
Object Storage: Replit Object Storage
CDN:            Replit's built-in CDN (upgradeable to Bunny CDN)
```

### Why This Stack?
- **Vite + React 18**: Fast dev experience, optimal production builds
- **Drizzle ORM**: Type-safe, lightweight (no query builder overhead), perfect for Replit
- **Zustand**: Simpler than Redux, built-in persistence for offline
- **Howler.js**: Battle-tested audio library with sprite support for sentence navigation
- **Replit-native**: Minimizes external dependencies, keeps costs low initially

---

## 3. Project Structure

```
linguae-romanicae/
├── client/                     # React Frontend
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js              # Service worker (generated)
│   │   └── icons/             # App icons (various sizes)
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component + routing
│   │   ├── vite-env.d.ts      # Vite types
│   │   │
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Progress.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Toggle.tsx
│   │   │   │   └── ...
│   │   │   ├── audio/
│   │   │   │   ├── AudioPlayer.tsx        # Main player component
│   │   │   │   ├── PlaybackControls.tsx   # Play/pause, speed, loop
│   │   │   │   ├── SentenceNavigator.tsx  # Jump to sentence
│   │   │   │   ├── ABLoopControl.tsx      # A-B loop UI
│   │   │   │   ├── Waveform.tsx           # Visual waveform
│   │   │   │   └── VoiceRecorder.tsx      # Record user voice
│   │   │   ├── gamification/
│   │   │   │   ├── StreakCounter.tsx
│   │   │   │   ├── XPBar.tsx
│   │   │   │   ├── AchievementBadge.tsx
│   │   │   │   ├── LevelIndicator.tsx
│   │   │   │   └── Leaderboard.tsx
│   │   │   ├── lessons/
│   │   │   │   ├── LessonCard.tsx
│   │   │   │   ├── TaskProgress.tsx
│   │   │   │   ├── SentenceDisplay.tsx
│   │   │   │   └── CompletionCelebration.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── ListenReadTask.tsx     # Task 1
│   │   │   │   ├── ShadowingTask.tsx      # Task 2
│   │   │   │   ├── ScriptoriumTask.tsx    # Task 3
│   │   │   │   ├── TranslationWriteTask.tsx  # Task 4
│   │   │   │   └── TranslationVerbalTask.tsx # Task 5
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── auth/
│   │   │       ├── LoginForm.tsx
│   │   │       ├── RegisterForm.tsx
│   │   │       ├── SocialLoginButtons.tsx
│   │   │       └── ForgotPassword.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx                   # Dashboard
│   │   │   ├── LanguageSelect.tsx         # Choose language
│   │   │   ├── LessonList.tsx             # All lessons for language
│   │   │   ├── Lesson.tsx                 # Active lesson container
│   │   │   ├── Task.tsx                   # Individual task view
│   │   │   ├── Profile.tsx                # User stats, settings
│   │   │   ├── Achievements.tsx           # Badge collection
│   │   │   ├── Leaderboard.tsx            # Rankings
│   │   │   ├── Settings.tsx               # App settings
│   │   │   ├── Auth.tsx                   # Login/Register
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── LessonManager.tsx
│   │   │       ├── ContentUpload.tsx
│   │   │       └── UserManagement.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAudio.ts                # Audio playback logic
│   │   │   ├── useRecorder.ts             # Voice recording
│   │   │   ├── useOffline.ts              # Offline detection
│   │   │   ├── useProgress.ts             # Progress tracking
│   │   │   ├── useStreak.ts               # Streak management
│   │   │   └── useTheme.ts                # Dark/light mode
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts               # User auth state
│   │   │   ├── progressStore.ts           # Learning progress
│   │   │   ├── audioStore.ts              # Audio player state
│   │   │   ├── settingsStore.ts           # User preferences
│   │   │   └── offlineStore.ts            # Offline queue
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                     # API client (fetch wrapper)
│   │   │   ├── auth.ts                    # Auth API calls
│   │   │   ├── lessons.ts                 # Lesson/content API
│   │   │   ├── progress.ts                # Progress sync API
│   │   │   └── storage.ts                 # IndexedDB for offline
│   │   │
│   │   ├── utils/
│   │   │   ├── audioHelpers.ts            # Audio utilities
│   │   │   ├── formatters.ts              # Date, time, XP formatting
│   │   │   ├── validators.ts              # Shared validation
│   │   │   └── constants.ts               # App constants
│   │   │
│   │   └── styles/
│   │       ├── globals.css                # Global styles, CSS vars
│   │       └── themes.css                 # Theme definitions
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── index.ts           # Server entry
│   │   ├── app.ts             # Express app setup
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts    # Drizzle connection
│   │   │   ├── auth.ts        # Passport strategies
│   │   │   ├── storage.ts     # Replit Object Storage
│   │   │   └── env.ts         # Environment validation
│   │   │
│   │   ├── db/
│   │   │   ├── schema.ts      # Drizzle schema (all tables)
│   │   │   ├── migrations/    # SQL migrations
│   │   │   └── seed.ts        # Initial data seeding
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts        # /api/auth/*
│   │   │   ├── users.ts       # /api/users/*
│   │   │   ├── languages.ts   # /api/languages/*
│   │   │   ├── lessons.ts     # /api/lessons/*
│   │   │   ├── progress.ts    # /api/progress/*
│   │   │   ├── gamification.ts # /api/gamification/*
│   │   │   ├── recordings.ts  # /api/recordings/*
│   │   │   └── admin.ts       # /api/admin/*
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── lessonController.ts
│   │   │   ├── progressController.ts
│   │   │   ├── gamificationController.ts
│   │   │   └── adminController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── lessonService.ts
│   │   │   ├── progressService.ts
│   │   │   ├── xpService.ts
│   │   │   ├── streakService.ts
│   │   │   ├── achievementService.ts
│   │   │   └── storageService.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT verification
│   │   │   ├── admin.ts       # Admin role check
│   │   │   ├── rateLimit.ts   # Rate limiting
│   │   │   └── errorHandler.ts
│   │   │
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── password.ts
│   │       └── validators.ts
│   │
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                     # Shared Types & Validation
│   ├── types.ts               # TypeScript interfaces
│   ├── schemas.ts             # Zod schemas
│   └── constants.ts           # Shared constants
│
├── content/                    # Initial Content (seed data)
│   ├── sentences/
│   │   └── lesson-1-150-sentences.json
│   └── audio/                 # Reference only, stored in Object Storage
│
├── .env.example
├── .gitignore
├── package.json               # Workspace root
├── replit.nix                 # Replit configuration
└── README.md
```

---

## 4. Database Schema

### Entity Relationship Diagram (Conceptual)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Users     │───────│UserProgress │───────│   Lessons   │
└─────────────┘       └─────────────┘       └─────────────┘
      │                     │                      │
      │               ┌─────────────┐              │
      └───────────────│TaskProgress │──────────────┘
                      └─────────────┘
      │                     │
      │               ┌─────────────┐
      └───────────────│ Recordings  │
                      └─────────────┘
      │
      │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      └───│   Streaks   │   │   XPLogs    │   │Achievements │
          └─────────────┘   └─────────────┘   └─────────────┘
```

### Drizzle Schema Definition

```typescript
// server/src/db/schema.ts

import { pgTable, uuid, varchar, text, integer, boolean, 
         timestamp, jsonb, primaryKey, index } from 'drizzle-orm/pg-core';

// ============================================
// USERS & AUTHENTICATION
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  
  // OAuth
  googleId: varchar('google_id', { length: 255 }).unique(),
  appleId: varchar('apple_id', { length: 255 }).unique(),
  
  // Role
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' | 'admin'
  
  // Preferences
  preferredLanguage: varchar('preferred_language', { length: 10 }),
  theme: varchar('theme', { length: 10 }).default('system'), // 'light' | 'dark' | 'system'
  soundEffects: boolean('sound_effects').default(true),
  
  // Gamification
  totalXp: integer('total_xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// LANGUAGES & CONTENT
// ============================================

export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 10 }).unique().notNull(), // 'es', 'fr', 'it', 'pt'
  name: varchar('name', { length: 50 }).notNull(),           // 'Spanish'
  nativeName: varchar('native_name', { length: 50 }).notNull(), // 'Español'
  flag: varchar('flag', { length: 10 }).notNull(),           // '🇪🇸'
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  languageId: uuid('language_id').references(() => languages.id).notNull(),
  
  // Metadata
  lessonNumber: integer('lesson_number').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  
  // Content
  sentenceCount: integer('sentence_count').default(0).notNull(),
  estimatedMinutes: integer('estimated_minutes').default(60),
  
  // Audio Files (Replit Object Storage keys)
  shortAudioKey: varchar('short_audio_key', { length: 500 }),
  longAudioKey: varchar('long_audio_key', { length: 500 }),
  
  // Audio Metadata (for sentence navigation)
  audioTimestamps: jsonb('audio_timestamps'), // Array of {sentenceIndex, startMs, endMs}
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(), // For future monetization
  
  // XP
  xpReward: integer('xp_reward').default(100).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  languageLessonIdx: index('lessons_lang_num_idx').on(table.languageId, table.lessonNumber),
}));

export const sentences = pgTable('sentences', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  
  orderIndex: integer('order_index').notNull(), // 0-149 for 150 sentences
  
  // Content
  english: text('english').notNull(),
  target: text('target').notNull(), // Target language text
  
  // Audio timing (milliseconds into the long audio file)
  audioStartMs: integer('audio_start_ms'),
  audioEndMs: integer('audio_end_ms'),
  
  // Optional extras
  pronunciation: text('pronunciation'), // Romanization if applicable
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  lessonOrderIdx: index('sentences_lesson_order_idx').on(table.lessonId, table.orderIndex),
}));

// ============================================
// USER PROGRESS
// ============================================

export const userLanguages = pgTable('user_languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  languageId: uuid('language_id').references(() => languages.id).notNull(),
  
  // Progress summary
  currentLessonId: uuid('current_lesson_id').references(() => lessons.id),
  lessonsCompleted: integer('lessons_completed').default(0).notNull(),
  totalTimeMinutes: integer('total_time_minutes').default(0).notNull(),
  
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastPracticedAt: timestamp('last_practiced_at'),
}, (table) => ({
  userLangIdx: index('user_languages_idx').on(table.userId, table.languageId),
}));

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  
  // Overall status
  status: varchar('status', { length: 20 }).default('not_started').notNull(),
  // 'not_started' | 'in_progress' | 'completed'
  
  // Task completion (1-5)
  task1Completed: boolean('task1_completed').default(false).notNull(),
  task2Completed: boolean('task2_completed').default(false).notNull(),
  task3Completed: boolean('task3_completed').default(false).notNull(),
  task4Completed: boolean('task4_completed').default(false).notNull(),
  task5Completed: boolean('task5_completed').default(false).notNull(),
  
  // Time tracking (seconds)
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
  
  // Completion
  completedAt: timestamp('completed_at'),
  xpEarned: integer('xp_earned').default(0).notNull(),
  
  startedAt: timestamp('started_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userLessonIdx: index('lesson_progress_user_lesson_idx').on(table.userId, table.lessonId),
}));

export const taskProgress = pgTable('task_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  
  taskNumber: integer('task_number').notNull(), // 1-5
  
  // Repetition tracking
  repetitionsCompleted: integer('repetitions_completed').default(0).notNull(),
  repetitionsRequired: integer('repetitions_required').default(5).notNull(),
  
  // For scriptorium/translation tasks - current sentence index
  currentSentenceIndex: integer('current_sentence_index').default(0).notNull(),
  sentencesCompleted: integer('sentences_completed').default(0).notNull(),
  
  // Time
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
  
  // Status
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userTaskIdx: index('task_progress_idx').on(table.userId, table.lessonId, table.taskNumber),
}));

// ============================================
// RECORDINGS
// ============================================

export const recordings = pgTable('recordings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  sentenceId: uuid('sentence_id').references(() => sentences.id),
  
  taskNumber: integer('task_number').notNull(), // 2 (shadowing) or 5 (verbal translation)
  
  // Storage
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  durationMs: integer('duration_ms'),
  fileSizeBytes: integer('file_size_bytes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userRecordingsIdx: index('recordings_user_idx').on(table.userId, table.lessonId),
}));

// ============================================
// GAMIFICATION
// ============================================

export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  
  lastActivityDate: varchar('last_activity_date', { length: 10 }), // YYYY-MM-DD
  
  // Freeze (future feature)
  freezesAvailable: integer('freezes_available').default(0).notNull(),
  freezeUsedDate: varchar('freeze_used_date', { length: 10 }),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const xpLogs = pgTable('xp_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  amount: integer('amount').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  // 'lesson_complete' | 'task_complete' | 'streak_bonus' | 'achievement' | 'daily_goal'
  
  sourceId: uuid('source_id'), // Reference to lesson, achievement, etc.
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userXpIdx: index('xp_logs_user_idx').on(table.userId, table.createdAt),
}));

export const achievementDefinitions = pgTable('achievement_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }).notNull(), // Lucide icon name
  
  // Requirements
  requirementType: varchar('requirement_type', { length: 50 }).notNull(),
  // 'lessons_completed' | 'streak_days' | 'xp_earned' | 'time_spent' | 'language_count'
  requirementValue: integer('requirement_value').notNull(),
  
  xpReward: integer('xp_reward').default(50).notNull(),
  
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid('achievement_id').references(() => achievementDefinitions.id).notNull(),
  
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  xpAwarded: integer('xp_awarded').default(0).notNull(),
}, (table) => ({
  userAchievementIdx: index('user_achievements_idx').on(table.userId, table.achievementId),
}));

// ============================================
// ADMIN & CONTENT MANAGEMENT
// ============================================

export const contentUploads = pgTable('content_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // 'csv' | 'mp3'
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  
  // Processing status
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  // 'pending' | 'processing' | 'completed' | 'failed'
  
  processingNotes: text('processing_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 5. Authentication System

### Supported Methods
1. **Email + Password** — Primary method
2. **Google OAuth** — Social login
3. **Apple OAuth** — Social login (important for iOS)

### JWT Strategy
```typescript
// Access Token: Short-lived (15 minutes)
{
  sub: userId,
  email: user.email,
  role: user.role,
  iat: timestamp,
  exp: timestamp + 15min
}

// Refresh Token: Long-lived (30 days), stored in DB
{
  sub: userId,
  tokenId: uuid,
  iat: timestamp,
  exp: timestamp + 30days
}
```

### Auth Flow
```
1. Login → Access Token + Refresh Token (httpOnly cookie)
2. API Request → Access Token in Authorization header
3. Token Expired → Auto-refresh using Refresh Token
4. Logout → Invalidate Refresh Token in DB
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase, one lowercase, one number
- Bcrypt hashing with cost factor 12

### OAuth Configuration
```typescript
// Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=/api/auth/google/callback

// Apple OAuth
APPLE_CLIENT_ID=xxx
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx
APPLE_CALLBACK_URL=/api/auth/apple/callback
```

---

## 6. Core Features

### 6.1 Language Selection
- Grid of 4 language cards with flags
- Shows user's progress per language if started
- "Continue" button for active language
- Expandable architecture for adding more languages

### 6.2 Lesson List View
- Cards showing:
  - Lesson number and title
  - Progress percentage
  - Tasks completed (5 circles)
  - Time spent
  - XP earned
  - Lock icon if locked (future monetization)

### 6.3 The Five Tasks

#### Task 1: Listen & Read
```
Purpose: Build listening comprehension + vocabulary recognition
Interface:
  - Full sentence list displayed (scrollable)
  - Current sentence highlighted during playback
  - Audio player at bottom
  - Repetition counter (0/5)
  - Play button auto-advances rep counter
Completion: Listen through entire audio 5 times
XP: 20 per completion
```

#### Task 2: Shadowing
```
Purpose: Develop pronunciation + speaking fluency
Interface:
  - Single sentence displayed large
  - Sentence navigation (prev/next)
  - Audio plays sentence, pauses for user repeat
  - Voice recorder activated during pause
  - Playback comparison (original vs recording)
  - Rep counter per sentence (0/5)
Completion: Complete all sentences 5x each
XP: 30 per completion
```

#### Task 3: Scriptorium
```
Purpose: Reinforce writing + muscle memory
Interface:
  - Target sentence displayed
  - Text input field below
  - Character-by-character validation (optional highlight errors)
  - Audio plays while typing (optional toggle)
  - Submit checks accuracy
  - Next sentence on submit
Completion: Type all 150 sentences correctly
XP: 25 per completion
```

#### Task 4: Translation (Written)
```
Purpose: Active recall + production
Interface:
  - English sentence displayed
  - Empty text input
  - Submit to check
  - Reveal correct answer
  - Mark correct/incorrect (self-assessment)
  - Retry option for incorrect
Completion: Translate all sentences
XP: 25 per completion
```

#### Task 5: Translation (Verbal)
```
Purpose: Speaking fluency + confidence
Interface:
  - English sentence displayed
  - Record button
  - After recording, reveal target sentence
  - Listen to own recording vs. read target
  - Self-assessment (got it / needs practice)
  - Flashcard-style navigation
Completion: 5 passes through all sentences
XP: 30 per completion
```

### 6.4 Progress Tracking
- Real-time sync when online
- Offline queue with sync on reconnection
- Visual progress bars everywhere
- Time tracking (active session timer)

---

## 7. Audio System

### 7.1 Audio Library: Howler.js
```typescript
// Audio configuration
const audioConfig = {
  html5: true,        // Enable streaming for large files
  preload: true,      // Preload metadata
  pool: 5,            // Sound instance pool
};
```

### 7.2 Audio Player Features

#### Playback Controls
```typescript
interface PlaybackControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (position: number) => void;
  setRate: (rate: number) => void;  // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
  setVolume: (volume: number) => void;
}
```

#### A-B Loop
```typescript
interface ABLoop {
  pointA: number | null;  // Start position (ms)
  pointB: number | null;  // End position (ms)
  isActive: boolean;
  setA: () => void;       // Set A to current position
  setB: () => void;       // Set B to current position
  clear: () => void;      // Clear loop points
}
```

#### Sentence Navigation
```typescript
interface SentenceNav {
  currentSentence: number;
  totalSentences: number;
  jumpTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  // Uses audioTimestamps from lesson data
}
```

### 7.3 Audio Timestamp Generation
For sentence-level navigation, we need timestamps. Options:
1. **Manual** — Admin marks timestamps in upload UI
2. **AI-assisted** — Use speech recognition to detect sentence boundaries
3. **Pre-provided** — If source provides timestamps

For MVP, we'll use a simple approach:
- Store approximate timestamps based on average duration
- Allow admin to adjust timestamps in content management

### 7.4 Voice Recording
```typescript
interface VoiceRecorder {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  pause: () => void;
  resume: () => void;
  
  // Playback
  recordings: Recording[];
  playRecording: (id: string) => void;
  deleteRecording: (id: string) => void;
}

// Storage: Records saved locally first, synced to server optionally
// Format: MP3 (using lamejs for browser encoding)
// Max duration: 30 seconds per sentence
```

---

## 8. Gamification System

### 8.1 Experience Points (XP)

#### Earning XP
| Action | XP Amount |
|--------|-----------|
| Complete Task 1 (Listen & Read) | 20 |
| Complete Task 2 (Shadowing) | 30 |
| Complete Task 3 (Scriptorium) | 25 |
| Complete Task 4 (Translation Written) | 25 |
| Complete Task 5 (Translation Verbal) | 30 |
| Complete Full Lesson | +50 bonus |
| Daily Streak (per day) | 10 × streak_day |
| Achievement Unlocked | Varies (25-200) |

#### Leveling System
```typescript
const XP_PER_LEVEL = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  // ... continues with increasing gaps
];

// Titles per level
const LEVEL_TITLES = [
  'Novice',           // 1-2
  'Apprentice',       // 3-4
  'Student',          // 5-6
  'Scholar',          // 7-8
  'Linguist',         // 9-10
  'Polyglot',         // 11-15
  'Master',           // 16-20
  'Grandmaster',      // 21-25
  'Legend',           // 26+
];
```

### 8.2 Streaks

```typescript
interface StreakSystem {
  currentStreak: number;
  longestStreak: number;
  
  // Streak maintained by completing any task
  // Resets at midnight local time
  
  // Visual rewards
  milestones: [7, 14, 30, 60, 90, 180, 365];
  
  // Future: Streak freeze (1 per week at higher levels)
}
```

### 8.3 Achievements

#### Achievement Categories
```typescript
const ACHIEVEMENTS = {
  // Getting Started
  first_lesson: { name: 'First Steps', desc: 'Complete your first lesson', xp: 50 },
  first_language: { name: 'Romance Begins', desc: 'Start learning a language', xp: 25 },
  
  // Dedication
  streak_7: { name: 'Weekly Warrior', desc: '7-day streak', xp: 100 },
  streak_30: { name: 'Monthly Master', desc: '30-day streak', xp: 250 },
  streak_100: { name: 'Century Club', desc: '100-day streak', xp: 500 },
  
  // Progress
  lessons_5: { name: 'Getting Serious', desc: 'Complete 5 lessons', xp: 75 },
  lessons_25: { name: 'Quarter Century', desc: 'Complete 25 lessons', xp: 200 },
  
  // Multi-language
  two_languages: { name: 'Bilingual Path', desc: 'Start 2 languages', xp: 100 },
  four_languages: { name: 'Romance Master', desc: 'Start all 4 languages', xp: 300 },
  
  // Time Investment
  hours_10: { name: 'Dedicated Learner', desc: 'Study for 10 hours total', xp: 100 },
  hours_100: { name: 'Time Investor', desc: 'Study for 100 hours total', xp: 500 },
  
  // Perfect Performance
  perfect_scriptorium: { name: 'Perfect Penmanship', desc: 'Complete scriptorium with no errors', xp: 50 },
  
  // Speed
  speed_demon: { name: 'Speed Demon', desc: 'Complete a lesson in under 30 minutes', xp: 75 },
};
```

### 8.4 Leaderboards

```typescript
interface Leaderboard {
  // Types
  global: User[];        // All users
  language: User[];      // Per language
  friends: User[];       // Future: friend system
  
  // Time periods
  daily: User[];
  weekly: User[];
  allTime: User[];
  
  // Display
  top100: User[];
  userRank: number;
  userPercentile: number;
}
```

### 8.5 Daily Goals
```typescript
interface DailyGoal {
  xpTarget: number;      // User-configurable: 10, 20, 50, 100
  xpEarned: number;
  tasksTarget: number;   // Auto-calculated based on XP
  tasksCompleted: number;
  isComplete: boolean;
}
```

---

## 9. UI/UX Design System

### 9.1 Design Philosophy
**"Neo-Mediterranean"** — A fresh, vibrant aesthetic inspired by the cultures of Romance language regions. Think sun-drenched terracotta, Mediterranean blues, olive greens, balanced with modern minimalism.

### 9.2 Color Palette

```css
:root {
  /* ===== LIGHT THEME ===== */
  
  /* Primary - Warm Terracotta */
  --primary-50: #fef7f4;
  --primary-100: #fdeee6;
  --primary-200: #fad9c7;
  --primary-300: #f5be9d;
  --primary-400: #ed9466;
  --primary-500: #e67040;  /* Main brand color */
  --primary-600: #d4532a;
  --primary-700: #b04024;
  --primary-800: #8e3522;
  --primary-900: #752f20;
  
  /* Secondary - Mediterranean Blue */
  --secondary-50: #f0f9ff;
  --secondary-100: #e0f2fe;
  --secondary-200: #b9e5fe;
  --secondary-300: #7cd2fd;
  --secondary-400: #36bbfa;
  --secondary-500: #0c9eeb;  /* Accent */
  --secondary-600: #007ec9;
  --secondary-700: #0165a3;
  --secondary-800: #065586;
  --secondary-900: #0b476f;
  
  /* Accent - Olive Gold */
  --accent-50: #fdfde8;
  --accent-100: #fafbc4;
  --accent-200: #f6f58c;
  --accent-300: #ede84a;
  --accent-400: #dfd31a;
  --accent-500: #c7b80e;  /* Gold accent */
  --accent-600: #9a8f09;
  --accent-700: #6e680b;
  --accent-800: #5a5310;
  --accent-900: #4c4512;
  
  /* Neutrals - Warm Gray */
  --gray-50: #fafaf9;
  --gray-100: #f5f5f4;
  --gray-200: #e7e5e4;
  --gray-300: #d6d3d1;
  --gray-400: #a8a29e;
  --gray-500: #78716c;
  --gray-600: #57534e;
  --gray-700: #44403c;
  --gray-800: #292524;
  --gray-900: #1c1917;
  
  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #0c9eeb;
  
  /* Language-specific accents */
  --spanish: #c60b1e;   /* Red from flag */
  --french: #002654;    /* Blue from flag */
  --italian: #009246;   /* Green from flag */
  --portuguese: #006600; /* Green from flag */
  
  /* Backgrounds */
  --bg-primary: #fafaf9;
  --bg-secondary: #f5f5f4;
  --bg-card: #ffffff;
  
  /* Text */
  --text-primary: #1c1917;
  --text-secondary: #57534e;
  --text-muted: #a8a29e;
  
  
  /* ===== DARK THEME ===== */
}

[data-theme="dark"] {
  --bg-primary: #0f0f0e;
  --bg-secondary: #1a1918;
  --bg-card: #242321;
  
  --text-primary: #fafaf9;
  --text-secondary: #d6d3d1;
  --text-muted: #78716c;
  
  /* Slightly desaturated primaries for dark mode */
  --primary-500: #d96a3e;
  --secondary-500: #2ba3e8;
}
```

### 9.3 Typography

```css
/* Font Stack */
--font-display: 'Playfair Display', Georgia, serif;  /* Headlines */
--font-body: 'Source Sans 3', system-ui, sans-serif;  /* Body text */
--font-mono: 'JetBrains Mono', monospace;             /* Code/input */

/* Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 9.4 Spacing & Layout

```css
/* Spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Border radius */
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.5rem;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

### 9.5 Mobile-First Breakpoints

```css
/* Mobile first: default styles are for mobile */
/* sm: 640px  - Large phones */
/* md: 768px  - Tablets */
/* lg: 1024px - Laptops */
/* xl: 1280px - Desktops */
```

### 9.6 Component Patterns

#### Cards
```tsx
// Rounded corners, subtle shadow, white bg
// Hover: slight lift + shadow increase
// Active language indicator: left border accent
```

#### Buttons
```tsx
// Primary: Terracotta gradient, white text
// Secondary: Outlined, terracotta border
// Ghost: Text only with hover bg
// All: Generous padding, rounded-lg
```

#### Progress Elements
```tsx
// Circular progress for tasks (5 circles)
// Linear progress bar for lessons
// Animated fill on progress update
// Confetti burst on completion
```

#### Audio Player
```tsx
// Fixed bottom on mobile
// Waveform visualization
// Large touch targets (48px min)
// Haptic feedback on actions
```

### 9.7 Animations

```tsx
// Page transitions: Fade + slight slide
// Cards: Scale on hover
// Progress: Spring animation
// Achievements: Pop + shimmer
// Streaks: Fire particle effect
// Completion: Confetti burst

// Library: Framer Motion
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
```

---

## 10. Admin Panel

### 10.1 Access Control
- Only 2 admin accounts (hardcoded or role-based)
- Separate login route: `/admin`
- JWT with `role: 'admin'` claim

### 10.2 Admin Features

#### Dashboard
- Total users, active users (7d, 30d)
- Lessons completed (chart over time)
- Popular languages
- Recent signups

#### Content Management

##### Language Manager
```
- View all languages
- Toggle language active/inactive
- Reorder display order
- Add new language (for future expansion)
```

##### Lesson Manager
```
- List all lessons per language
- Create new lesson
- Edit lesson metadata
- Upload/replace audio files
- Manage sentences (bulk CSV import)
- Set lesson lock status (monetization)
- Generate audio timestamps (tool)
```

##### Sentence Editor
```
- View all sentences for a lesson
- Edit individual sentences
- Bulk import from CSV
- Export to CSV
- Audio timestamp editor (visual waveform + marker placement)
```

#### User Management
```
- Search users by email/name
- View user progress
- Reset user password
- Toggle admin role (max 2)
- Export user data (GDPR)
```

#### Content Upload Flow
```
1. Admin uploads CSV file
2. System validates format
3. Preview parsed data
4. Confirm import
5. Upload audio files
6. Link audio to lesson
7. (Optional) Generate/edit timestamps
8. Activate lesson
```

### 10.3 Admin UI
- Same design system as main app
- Responsive but desktop-optimized
- Data tables with sort/filter
- Bulk actions

---

## 11. PWA & Offline Support

### 11.1 PWA Configuration

```json
// manifest.json
{
  "name": "Linguae Romanicae",
  "short_name": "Linguae",
  "description": "Learn Romance languages through immersive exercises",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#e67040",
  "background_color": "#fafaf9",
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 11.2 Service Worker Strategy

```typescript
// Workbox strategies

// App Shell: Cache First
// Static assets (JS, CSS, fonts): Cache First
// API calls: Network First with offline fallback
// Audio files: Cache First (explicit download for offline)
// Images: Stale While Revalidate
```

### 11.3 Offline Data Storage

```typescript
// IndexedDB via idb library

interface OfflineStore {
  // Cached lessons (user explicitly downloads for offline)
  lessons: Lesson[];
  sentences: Sentence[];
  
  // Progress queue (syncs when online)
  progressQueue: ProgressUpdate[];
  
  // Recordings (stored locally, optional cloud sync)
  recordings: Recording[];
  
  // User data
  user: User;
  settings: Settings;
}
```

### 11.4 Offline UX
- "Download for offline" button per lesson
- Visual indicator of downloaded lessons
- Offline mode banner when disconnected
- Sync indicator when back online
- Progress preserved and synced automatically

---

## 12. API Specification

### Base URL
```
Production: https://linguae-romanicae.replit.app/api
Development: http://localhost:3000/api
```

### Authentication Endpoints

```typescript
POST   /auth/register          // Email + password signup
POST   /auth/login             // Email + password login
POST   /auth/logout            // Invalidate refresh token
POST   /auth/refresh           // Get new access token
POST   /auth/forgot-password   // Request password reset
POST   /auth/reset-password    // Reset with token
GET    /auth/google            // Initiate Google OAuth
GET    /auth/google/callback   // Google OAuth callback
GET    /auth/apple             // Initiate Apple OAuth
GET    /auth/apple/callback    // Apple OAuth callback
GET    /auth/me                // Get current user
```

### User Endpoints

```typescript
GET    /users/profile                // Get profile + stats
PATCH  /users/profile                // Update profile
PATCH  /users/settings               // Update settings
DELETE /users/account                // Delete account + data
GET    /users/stats                  // Detailed statistics
GET    /users/achievements           // User's achievements
```

### Language Endpoints

```typescript
GET    /languages                    // List active languages
GET    /languages/:code              // Get language details
GET    /languages/:code/progress     // User's progress in language
```

### Lesson Endpoints

```typescript
GET    /lessons                      // List lessons (optional ?language=es)
GET    /lessons/:id                  // Get lesson details + sentences
GET    /lessons/:id/sentences        // Get all sentences
GET    /lessons/:id/audio/short      // Get short audio URL
GET    /lessons/:id/audio/long       // Get long audio URL
```

### Progress Endpoints

```typescript
GET    /progress                     // Get all user progress
GET    /progress/lessons/:id         // Get progress for lesson
POST   /progress/lessons/:id         // Update lesson progress
POST   /progress/lessons/:id/tasks/:taskNum  // Update task progress
POST   /progress/sync                // Batch sync offline progress
```

### Recording Endpoints

```typescript
GET    /recordings                   // List user recordings
GET    /recordings/:id               // Get recording URL
POST   /recordings                   // Upload new recording
DELETE /recordings/:id               // Delete recording
```

### Gamification Endpoints

```typescript
GET    /gamification/stats           // XP, level, streak
GET    /gamification/leaderboard     // Global leaderboard
GET    /gamification/leaderboard/:lang  // Language leaderboard
POST   /gamification/streak/freeze   // Use streak freeze (future)
```

### Admin Endpoints

```typescript
// All require admin role

GET    /admin/stats                  // Dashboard stats
GET    /admin/users                  // List users
GET    /admin/users/:id              // User details
PATCH  /admin/users/:id              // Update user

GET    /admin/languages              // List all languages
POST   /admin/languages              // Create language
PATCH  /admin/languages/:id          // Update language

GET    /admin/lessons                // List all lessons
POST   /admin/lessons                // Create lesson
PATCH  /admin/lessons/:id            // Update lesson
DELETE /admin/lessons/:id            // Delete lesson

POST   /admin/lessons/:id/sentences  // Bulk import sentences
POST   /admin/lessons/:id/audio      // Upload audio file

GET    /admin/uploads                // List uploads
POST   /admin/uploads                // Upload file
```

### Response Format

```typescript
// Success
{
  success: true,
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
  }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any,
  }
}
```

---

## 13. File Storage Strategy

### Replit Object Storage

```typescript
// Storage structure
linguae-romanicae/
├── audio/
│   ├── lessons/
│   │   ├── es-lesson-1-short.mp3
│   │   ├── es-lesson-1-long.mp3
│   │   ├── fr-lesson-1-short.mp3
│   │   └── ...
│   └── recordings/
│       └── {userId}/
│           └── {lessonId}/
│               └── {sentenceId}-{timestamp}.mp3
├── uploads/
│   └── {uploadId}/
│       └── original-filename.csv
└── exports/
    └── {exportId}.zip
```

### Storage Service

```typescript
// server/src/services/storageService.ts

import { Client } from '@replit/object-storage';

class StorageService {
  private client: Client;
  
  async uploadFile(key: string, data: Buffer): Promise<string>;
  async getFileUrl(key: string): Promise<string>;
  async deleteFile(key: string): Promise<void>;
  async listFiles(prefix: string): Promise<string[]>;
}
```

### Audio File Naming Convention
```
{languageCode}-lesson-{lessonNumber}-{type}.mp3

Examples:
es-lesson-1-short.mp3   // Spanish, Lesson 1, Listen & Read
es-lesson-1-long.mp3    // Spanish, Lesson 1, Shadowing
fr-lesson-1-short.mp3   // French, Lesson 1, Listen & Read
```

---

## 14. Deployment Guide

### 14.1 Replit Setup

```bash
# 1. Create new Repl from GitHub or upload
# 2. Select Node.js 20 template

# 3. Install dependencies
npm install

# 4. Set up environment variables in Secrets
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=another-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# ... etc
```

### 14.2 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=min-32-char-secret
JWT_REFRESH_SECRET=min-32-char-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx

# App
NODE_ENV=production
PORT=3000
CLIENT_URL=https://linguae-romanicae.replit.app
API_URL=https://linguae-romanicae.replit.app/api

# Admin (initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

### 14.3 Database Setup

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 14.4 Initial Seed Data

```typescript
// Languages
const languages = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

// Lesson 1 for each language
// 150 sentences from CSV
// Audio files uploaded to Object Storage
```

### 14.5 Deployment

```bash
# Replit auto-deploys on push
# Or use Deploy button in Replit UI

# Build commands
npm run build:client  # Vite build
npm run build:server  # TypeScript compile

# Start command
npm run start
```

---

## 15. Future Expansion

### 15.1 Additional Languages
Architecture supports adding any language from the 42 in the source CSV:
1. Add language to `languages` table
2. Upload audio files
3. Import sentences from CSV
4. Toggle `isActive` to true

### 15.2 Monetization Options
Built-in support for:
- **Freemium**: First N lessons free, rest locked
- **Subscription**: Monthly/yearly via Stripe
- **One-time purchase**: Per language
- **Donation model**: Unlocked but with donation prompts

### 15.3 Future Features
- **Spaced repetition** for vocabulary review
- **Grammar lessons** as separate modules
- **Conversation practice** with AI (OpenAI integration)
- **Social features**: Friend challenges, group streaks
- **Pronunciation scoring** using speech recognition
- **Podcast integration**: Learn from real content
- **Mobile apps**: React Native or Capacitor

---

## 16. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Vite + Express + Drizzle)
- [ ] Database schema and migrations
- [ ] Authentication (email + OAuth)
- [ ] Basic UI components
- [ ] Theme system (light/dark)

### Phase 2: Core Learning (Week 2)
- [ ] Language selection
- [ ] Lesson list view
- [ ] Task 1: Listen & Read
- [ ] Audio player with controls
- [ ] Basic progress tracking

### Phase 3: All Tasks (Week 3)
- [ ] Task 2: Shadowing with voice recording
- [ ] Task 3: Scriptorium with text input
- [ ] Task 4: Translation (Written)
- [ ] Task 5: Translation (Verbal)
- [ ] Sentence navigation

### Phase 4: Gamification (Week 4)
- [ ] XP system
- [ ] Levels
- [ ] Streaks
- [ ] Achievements
- [ ] Leaderboard

### Phase 5: Polish & Admin (Week 5)
- [ ] Admin panel
- [ ] Content management
- [ ] PWA implementation
- [ ] Offline support
- [ ] Testing & bug fixes

### Phase 6: Launch Prep (Week 6)
- [ ] Performance optimization
- [ ] Seed production data
- [ ] Domain setup (optional)
- [ ] Analytics integration
- [ ] Documentation

---

## Appendix A: Initial Content Data

### Sentence CSV Format
```csv
english,spanish,french,italian,portuguese
"Welcome!","¡Bienvenido!","Bienvenue!","Benvenuto!","Bem-vindo!"
"Hello! How are you?","¡Hola, cómo estás?","Bonjour comment allez-vous?","Ciao, come stai?","Olá, como vai?"
...
```

### Audio Files (Provided)
| Language | Short Audio (MB) | Long Audio (MB) |
|----------|------------------|-----------------|
| Spanish | 1.56 | 7.79 |
| French | 1.79 | 8.94 |
| Italian | 1.61 | 8.03 |
| Portuguese | 1.83 | 9.16 |

---

## Appendix B: Commands Reference

```bash
# Development
npm run dev              # Start dev servers (client + server)
npm run dev:client       # Vite dev server only
npm run dev:server       # Express dev server only

# Build
npm run build            # Build both
npm run build:client     # Build frontend
npm run build:server     # Build backend

# Database
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run migrations
npm run db:seed          # Seed initial data
npm run db:studio        # Open Drizzle Studio

# Production
npm run start            # Start production server
npm run preview          # Preview production build locally
```

---

*End of Specification*

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Claude (for Jonathan / Linguae Romanicae)
