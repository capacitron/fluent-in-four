import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// ============================================
// USERS & AUTHENTICATION
// ============================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique(),
    passwordHash: varchar('password_hash', { length: 255 }),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: text('avatar_url'),

    // OAuth (for future implementation)
    googleId: varchar('google_id', { length: 255 }).unique(),
    appleId: varchar('apple_id', { length: 255 }).unique(),

    // Role
    role: varchar('role', { length: 20 }).default('user').notNull(),

    // Preferences
    preferredLanguage: varchar('preferred_language', { length: 10 }),
    theme: varchar('theme', { length: 10 }).default('system'),
    soundEffects: boolean('sound_effects').default(true),

    // Gamification
    totalXp: integer('total_xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastActiveAt: timestamp('last_active_at').defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// LANGUAGES & CONTENT
// ============================================

export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 10 }).unique().notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  nativeName: varchar('native_name', { length: 50 }).notNull(),
  flag: varchar('flag', { length: 10 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id')
      .references(() => languages.id)
      .notNull(),

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
    audioTimestamps: jsonb('audio_timestamps'),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isLocked: boolean('is_locked').default(false).notNull(),

    // XP
    xpReward: integer('xp_reward').default(100).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    languageLessonIdx: index('lessons_lang_num_idx').on(
      table.languageId,
      table.lessonNumber
    ),
  })
);

export const sentences = pgTable(
  'sentences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id, { onDelete: 'cascade' })
      .notNull(),

    orderIndex: integer('order_index').notNull(),

    // Content
    english: text('english').notNull(),
    target: text('target').notNull(),

    // Audio timing (milliseconds into the long audio file)
    audioStartMs: integer('audio_start_ms'),
    audioEndMs: integer('audio_end_ms'),

    // Optional extras
    pronunciation: text('pronunciation'),
    notes: text('notes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    lessonOrderIdx: index('sentences_lesson_order_idx').on(
      table.lessonId,
      table.orderIndex
    ),
  })
);

// ============================================
// USER PROGRESS
// ============================================

export const userLanguages = pgTable(
  'user_languages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    languageId: uuid('language_id')
      .references(() => languages.id)
      .notNull(),

    // Progress summary
    currentLessonId: uuid('current_lesson_id').references(() => lessons.id),
    lessonsCompleted: integer('lessons_completed').default(0).notNull(),
    totalTimeMinutes: integer('total_time_minutes').default(0).notNull(),

    startedAt: timestamp('started_at').defaultNow().notNull(),
    lastPracticedAt: timestamp('last_practiced_at'),
  },
  (table) => ({
    userLangIdx: index('user_languages_idx').on(table.userId, table.languageId),
  })
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id, { onDelete: 'cascade' })
      .notNull(),

    // Overall status
    status: varchar('status', { length: 20 }).default('not_started').notNull(),

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
  },
  (table) => ({
    userLessonIdx: index('lesson_progress_user_lesson_idx').on(
      table.userId,
      table.lessonId
    ),
  })
);

export const taskProgress = pgTable(
  'task_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id, { onDelete: 'cascade' })
      .notNull(),

    taskNumber: integer('task_number').notNull(),

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
  },
  (table) => ({
    userTaskIdx: index('task_progress_idx').on(
      table.userId,
      table.lessonId,
      table.taskNumber
    ),
  })
);

// ============================================
// RECORDINGS
// ============================================

export const recordings = pgTable(
  'recordings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id)
      .notNull(),
    sentenceId: uuid('sentence_id').references(() => sentences.id),

    taskNumber: integer('task_number').notNull(),

    // Storage
    storageKey: varchar('storage_key', { length: 500 }).notNull(),
    durationMs: integer('duration_ms'),
    fileSizeBytes: integer('file_size_bytes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userRecordingsIdx: index('recordings_user_idx').on(
      table.userId,
      table.lessonId
    ),
  })
);

// ============================================
// GAMIFICATION
// ============================================

export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),

  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),

  lastActivityDate: varchar('last_activity_date', { length: 10 }),

  // Freeze (future feature)
  freezesAvailable: integer('freezes_available').default(0).notNull(),
  freezeUsedDate: varchar('freeze_used_date', { length: 10 }),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const xpLogs = pgTable(
  'xp_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    amount: integer('amount').notNull(),
    source: varchar('source', { length: 50 }).notNull(),

    sourceId: uuid('source_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userXpIdx: index('xp_logs_user_idx').on(table.userId, table.createdAt),
  })
);

export const achievementDefinitions = pgTable('achievement_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),

  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),

  // Requirements
  requirementType: varchar('requirement_type', { length: 50 }).notNull(),
  requirementValue: integer('requirement_value').notNull(),

  xpReward: integer('xp_reward').default(50).notNull(),

  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
});

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    achievementId: uuid('achievement_id')
      .references(() => achievementDefinitions.id)
      .notNull(),

    unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
    xpAwarded: integer('xp_awarded').default(0).notNull(),
  },
  (table) => ({
    userAchievementIdx: index('user_achievements_idx').on(
      table.userId,
      table.achievementId
    ),
  })
);

// ============================================
// ADMIN & CONTENT MANAGEMENT
// ============================================

export const contentUploads = pgTable('content_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),

  uploadedBy: uuid('uploaded_by')
    .references(() => users.id)
    .notNull(),

  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),

  // Processing status
  status: varchar('status', { length: 20 }).default('pending').notNull(),

  processingNotes: text('processing_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type Sentence = typeof sentences.$inferSelect;
export type NewSentence = typeof sentences.$inferInsert;

export type UserLanguage = typeof userLanguages.$inferSelect;
export type NewUserLanguage = typeof userLanguages.$inferInsert;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;

export type TaskProgress = typeof taskProgress.$inferSelect;
export type NewTaskProgress = typeof taskProgress.$inferInsert;

export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;

export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;

export type XpLog = typeof xpLogs.$inferSelect;
export type NewXpLog = typeof xpLogs.$inferInsert;

export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type NewAchievementDefinition = typeof achievementDefinitions.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;

export type ContentUpload = typeof contentUploads.$inferSelect;
export type NewContentUpload = typeof contentUploads.$inferInsert;
