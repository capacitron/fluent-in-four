import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db, closeConnection } from '../config/database.js';
import {
  users,
  languages,
  lessons,
  sentences,
  achievementDefinitions,
  streaks,
} from './schema.js';
import { hashPassword } from '../utils/password.js';
import { env } from '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Achievement definitions
const ACHIEVEMENTS = [
  {
    code: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'Trophy',
    requirementType: 'lessons_completed',
    requirementValue: 1,
    xpReward: 50,
    displayOrder: 1,
  },
  {
    code: 'first_language',
    name: 'Romance Begins',
    description: 'Start learning a language',
    icon: 'Heart',
    requirementType: 'languages_started',
    requirementValue: 1,
    xpReward: 25,
    displayOrder: 2,
  },
  {
    code: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    requirementType: 'streak_days',
    requirementValue: 7,
    xpReward: 100,
    displayOrder: 3,
  },
  {
    code: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'Flame',
    requirementType: 'streak_days',
    requirementValue: 30,
    xpReward: 250,
    displayOrder: 4,
  },
  {
    code: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: 'Crown',
    requirementType: 'streak_days',
    requirementValue: 100,
    xpReward: 500,
    displayOrder: 5,
  },
  {
    code: 'lessons_5',
    name: 'Getting Serious',
    description: 'Complete 5 lessons',
    icon: 'BookOpen',
    requirementType: 'lessons_completed',
    requirementValue: 5,
    xpReward: 75,
    displayOrder: 6,
  },
  {
    code: 'lessons_25',
    name: 'Quarter Century',
    description: 'Complete 25 lessons',
    icon: 'Award',
    requirementType: 'lessons_completed',
    requirementValue: 25,
    xpReward: 200,
    displayOrder: 7,
  },
  {
    code: 'two_languages',
    name: 'Bilingual Path',
    description: 'Start learning 2 languages',
    icon: 'Languages',
    requirementType: 'languages_started',
    requirementValue: 2,
    xpReward: 100,
    displayOrder: 8,
  },
  {
    code: 'four_languages',
    name: 'Romance Master',
    description: 'Start learning all 4 languages',
    icon: 'Globe',
    requirementType: 'languages_started',
    requirementValue: 4,
    xpReward: 300,
    displayOrder: 9,
  },
  {
    code: 'hours_10',
    name: 'Dedicated Learner',
    description: 'Study for 10 hours total',
    icon: 'Clock',
    requirementType: 'time_spent_hours',
    requirementValue: 10,
    xpReward: 100,
    displayOrder: 10,
  },
  {
    code: 'hours_100',
    name: 'Time Investor',
    description: 'Study for 100 hours total',
    icon: 'Timer',
    requirementType: 'time_spent_hours',
    requirementValue: 100,
    xpReward: 500,
    displayOrder: 11,
  },
  {
    code: 'perfect_scriptorium',
    name: 'Perfect Penmanship',
    description: 'Complete scriptorium with no errors',
    icon: 'PenTool',
    requirementType: 'perfect_scriptorium',
    requirementValue: 1,
    xpReward: 50,
    displayOrder: 12,
  },
  {
    code: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a lesson in under 30 minutes',
    icon: 'Zap',
    requirementType: 'fast_lesson',
    requirementValue: 1,
    xpReward: 75,
    displayOrder: 13,
  },
];

// Language definitions
const LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', displayOrder: 0 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', displayOrder: 1 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', displayOrder: 2 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', displayOrder: 3 },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Seed Languages
    console.log('📚 Seeding languages...');
    const languageMap: Record<string, string> = {};

    for (const lang of LANGUAGES) {
      const existing = await db.query.languages.findFirst({
        where: eq(languages.code, lang.code),
      });

      if (existing) {
        languageMap[lang.code] = existing.id;
        console.log(`  ✓ Language ${lang.code} already exists`);
      } else {
        const [inserted] = await db.insert(languages).values(lang).returning();
        languageMap[lang.code] = inserted.id;
        console.log(`  ✓ Created language: ${lang.name}`);
      }
    }

    // 2. Load sentence data
    console.log('📖 Loading sentence data...');
    const contentPath = path.resolve(__dirname, '../../../content/04-lesson-1-sentences.json');
    const rawData = fs.readFileSync(contentPath, 'utf-8');
    const lessonData = JSON.parse(rawData);

    // 3. Seed Lessons and Sentences for each language
    console.log('📝 Seeding lessons and sentences...');

    for (const lang of LANGUAGES) {
      const languageId = languageMap[lang.code];

      // Check if lesson already exists
      const existingLesson = await db.query.lessons.findFirst({
        where: eq(lessons.languageId, languageId),
      });

      if (existingLesson) {
        console.log(`  ✓ Lesson 1 for ${lang.code} already exists`);
        continue;
      }

      // Create lesson
      const [lesson] = await db
        .insert(lessons)
        .values({
          languageId,
          lessonNumber: 1,
          title: lessonData.title,
          description: lessonData.description,
          sentenceCount: lessonData.totalSentences,
          estimatedMinutes: 60,
          xpReward: 100,
          shortAudioKey: `audio/lessons/${lang.code}-lesson-1-short.mp3`,
          longAudioKey: `audio/lessons/${lang.code}-lesson-1-long.mp3`,
          isActive: true,
          isLocked: false,
        })
        .returning();

      console.log(`  ✓ Created Lesson 1 for ${lang.name}`);

      // Create sentences
      const sentenceValues = lessonData.sentences.map((s: {
        orderIndex: number;
        english: string;
        spanish?: string;
        french?: string;
        italian?: string;
        portuguese?: string;
      }) => ({
        lessonId: lesson.id,
        orderIndex: s.orderIndex,
        english: s.english,
        target: s[lang.code as keyof typeof s] || s.english,
      }));

      await db.insert(sentences).values(sentenceValues);
      console.log(`    ✓ Created ${sentenceValues.length} sentences`);
    }

    // 4. Seed Achievements
    console.log('🏆 Seeding achievements...');

    for (const achievement of ACHIEVEMENTS) {
      const existing = await db.query.achievementDefinitions.findFirst({
        where: eq(achievementDefinitions.code, achievement.code),
      });

      if (!existing) {
        await db.insert(achievementDefinitions).values(achievement);
        console.log(`  ✓ Created achievement: ${achievement.name}`);
      } else {
        console.log(`  ✓ Achievement ${achievement.code} already exists`);
      }
    }

    // 5. Seed Admin User
    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      console.log('👤 Seeding admin user...');

      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.email, env.ADMIN_EMAIL),
      });

      if (!existingAdmin) {
        const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
        const [admin] = await db
          .insert(users)
          .values({
            email: env.ADMIN_EMAIL,
            passwordHash,
            displayName: 'Admin',
            role: 'admin',
          })
          .returning();

        // Create streak for admin
        await db.insert(streaks).values({
          userId: admin.id,
        });

        console.log(`  ✓ Created admin user: ${env.ADMIN_EMAIL}`);
      } else {
        console.log(`  ✓ Admin user already exists`);
      }
    } else {
      console.log('⚠️  No ADMIN_EMAIL/ADMIN_PASSWORD in env, skipping admin user');
    }

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
