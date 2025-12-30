import { z } from 'zod';

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
  preferredLanguage: z.string().max(10).optional().nullable(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  soundEffects: z.boolean().optional(),
});

// ============================================
// PROGRESS SCHEMAS
// ============================================

export const updateLessonProgressSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export const updateTaskProgressSchema = z.object({
  repetitionsCompleted: z.number().int().min(0).optional(),
  currentSentenceIndex: z.number().int().min(0).optional(),
  sentencesCompleted: z.number().int().min(0).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const syncProgressSchema = z.array(
  z.object({
    lessonId: z.string().uuid(),
    taskNumber: z.number().int().min(1).max(5),
    progress: updateTaskProgressSchema,
    timestamp: z.string().datetime(),
  })
);

// ============================================
// ADMIN SCHEMAS
// ============================================

export const createLanguageSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(50),
  nativeName: z.string().min(1).max(50),
  flag: z.string().min(1).max(10),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateLanguageSchema = createLanguageSchema.partial();

export const createLessonSchema = z.object({
  languageId: z.string().uuid(),
  lessonNumber: z.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  estimatedMinutes: z.number().int().min(1).default(60),
  xpReward: z.number().int().min(0).default(100),
  isActive: z.boolean().default(true),
  isLocked: z.boolean().default(false),
});

export const updateLessonSchema = createLessonSchema.partial();

export const sentenceSchema = z.object({
  orderIndex: z.number().int().min(0),
  english: z.string().min(1),
  target: z.string().min(1),
  audioStartMs: z.number().int().optional().nullable(),
  audioEndMs: z.number().int().optional().nullable(),
  pronunciation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const bulkImportSentencesSchema = z.object({
  sentences: z.array(sentenceSchema),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
export type UpdateTaskProgressInput = z.infer<typeof updateTaskProgressSchema>;
export type SyncProgressInput = z.infer<typeof syncProgressSchema>;
export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type SentenceInput = z.infer<typeof sentenceSchema>;
export type BulkImportSentencesInput = z.infer<typeof bulkImportSentencesSchema>;
