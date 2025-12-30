import { eq, asc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { languages, lessons, sentences } from '../db/schema.js';
import { createError } from '../middleware/errorHandler.js';

export async function getLanguages() {
  return db.query.languages.findMany({
    where: eq(languages.isActive, true),
    orderBy: [asc(languages.displayOrder)],
  });
}

export async function getLanguageByCode(code: string) {
  const language = await db.query.languages.findFirst({
    where: eq(languages.code, code),
  });

  if (!language) {
    throw createError(404, 'LANGUAGE_NOT_FOUND', `Language '${code}' not found`);
  }

  return language;
}

export async function getLessonsByLanguage(languageId: string) {
  return db.query.lessons.findMany({
    where: eq(lessons.languageId, languageId),
    orderBy: [asc(lessons.lessonNumber)],
  });
}

export async function getLessonsByLanguageCode(languageCode: string) {
  const language = await getLanguageByCode(languageCode);
  return getLessonsByLanguage(language.id);
}

export async function getLesson(lessonId: string) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });

  if (!lesson) {
    throw createError(404, 'LESSON_NOT_FOUND', 'Lesson not found');
  }

  return lesson;
}

export async function getLessonWithSentences(lessonId: string) {
  const lesson = await getLesson(lessonId);

  const lessonSentences = await db.query.sentences.findMany({
    where: eq(sentences.lessonId, lessonId),
    orderBy: [asc(sentences.orderIndex)],
  });

  return {
    lesson,
    sentences: lessonSentences,
  };
}

export async function getSentences(lessonId: string) {
  // Verify lesson exists
  await getLesson(lessonId);

  return db.query.sentences.findMany({
    where: eq(sentences.lessonId, lessonId),
    orderBy: [asc(sentences.orderIndex)],
  });
}

export async function getSentence(sentenceId: string) {
  const sentence = await db.query.sentences.findFirst({
    where: eq(sentences.id, sentenceId),
  });

  if (!sentence) {
    throw createError(404, 'SENTENCE_NOT_FOUND', 'Sentence not found');
  }

  return sentence;
}
