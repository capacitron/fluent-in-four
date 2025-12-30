import { api } from './api';

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Lesson {
  id: string;
  languageId: string;
  lessonNumber: number;
  title: string;
  description: string | null;
  sentenceCount: number;
  estimatedMinutes: number;
  shortAudioKey: string | null;
  longAudioKey: string | null;
  isActive: boolean;
  isLocked: boolean;
  xpReward: number;
}

export interface Sentence {
  id: string;
  lessonId: string;
  orderIndex: number;
  english: string;
  target: string;
  audioStartMs: number | null;
  audioEndMs: number | null;
  pronunciation: string | null;
  notes: string | null;
}

export interface LessonWithSentences extends Lesson {
  sentences: Sentence[];
}

export async function getLanguages(): Promise<Language[]> {
  const response = await api.get<Language[]>('/languages');
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'Failed to fetch languages');
}

export async function getLanguage(code: string): Promise<Language> {
  const response = await api.get<Language>(`/languages/${code}`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'Failed to fetch language');
}

export async function getLessons(languageCode: string): Promise<Lesson[]> {
  const response = await api.get<Lesson[]>(`/languages/${languageCode}/lessons`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'Failed to fetch lessons');
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  const response = await api.get<Lesson>(`/lessons/${lessonId}`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'Failed to fetch lesson');
}

export async function getLessonWithSentences(
  lessonId: string
) {
  return api.get<{ lesson: Lesson; sentences: Sentence[] }>(`/lessons/${lessonId}/full`);
}

export async function getSentences(lessonId: string): Promise<Sentence[]> {
  const response = await api.get<Sentence[]>(`/lessons/${lessonId}/sentences`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'Failed to fetch sentences');
}
