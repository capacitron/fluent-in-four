import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================
// DATABASE SCHEMA
// ============================================

interface FluentDB extends DBSchema {
  lessons: {
    key: string;
    value: {
      id: string;
      languageCode: string;
      lessonNumber: number;
      title: string;
      description: string | null;
      sentenceCount: number;
      estimatedMinutes: number | null;
      shortAudioKey: string | null;
      longAudioKey: string | null;
      isActive: boolean;
      isLocked: boolean;
      xpReward: number;
      downloadedAt: Date;
    };
    indexes: { 'by-language': string };
  };
  sentences: {
    key: string;
    value: {
      id: string;
      lessonId: string;
      orderIndex: number;
      english: string;
      target: string;
      audioStartMs: number | null;
      audioEndMs: number | null;
      pronunciation: string | null;
      notes: string | null;
    };
    indexes: { 'by-lesson': string };
  };
  progress: {
    key: string;
    value: {
      lessonId: string;
      status: string;
      task1Completed: boolean;
      task2Completed: boolean;
      task3Completed: boolean;
      task4Completed: boolean;
      task5Completed: boolean;
      timeSpentSeconds: number;
      updatedAt: Date;
    };
  };
  offlineQueue: {
    key: number;
    value: {
      id?: number;
      type: 'task_progress' | 'lesson_progress';
      lessonId: string;
      taskNumber?: number;
      data: Record<string, unknown>;
      createdAt: Date;
    };
  };
  audioCache: {
    key: string;
    value: {
      lessonId: string;
      audioType: 'short' | 'long';
      blob: Blob;
      cachedAt: Date;
    };
  };
  userPrefs: {
    key: string;
    value: unknown;
  };
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

let dbPromise: Promise<IDBPDatabase<FluentDB>> | null = null;

function getDB(): Promise<IDBPDatabase<FluentDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FluentDB>('fluent-in-four', 1, {
      upgrade(db) {
        // Lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('by-language', 'languageCode');
        }

        // Sentences store
        if (!db.objectStoreNames.contains('sentences')) {
          const sentenceStore = db.createObjectStore('sentences', {
            keyPath: 'id',
          });
          sentenceStore.createIndex('by-lesson', 'lessonId');
        }

        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'lessonId' });
        }

        // Offline queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        // Audio cache store
        if (!db.objectStoreNames.contains('audioCache')) {
          db.createObjectStore('audioCache', { keyPath: 'lessonId' });
        }

        // User preferences store
        if (!db.objectStoreNames.contains('userPrefs')) {
          db.createObjectStore('userPrefs');
        }
      },
    });
  }
  return dbPromise;
}

// ============================================
// LESSONS
// ============================================

export async function saveLesson(lesson: FluentDB['lessons']['value']): Promise<void> {
  const db = await getDB();
  await db.put('lessons', lesson);
}

export async function getLesson(lessonId: string): Promise<FluentDB['lessons']['value'] | undefined> {
  const db = await getDB();
  return db.get('lessons', lessonId);
}

export async function getLessonsByLanguage(languageCode: string): Promise<FluentDB['lessons']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('lessons', 'by-language', languageCode);
}

export async function isLessonDownloaded(lessonId: string): Promise<boolean> {
  const db = await getDB();
  const lesson = await db.get('lessons', lessonId);
  return !!lesson;
}

// ============================================
// SENTENCES
// ============================================

export async function saveSentences(sentences: FluentDB['sentences']['value'][]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sentences', 'readwrite');
  await Promise.all([
    ...sentences.map((s) => tx.store.put(s)),
    tx.done,
  ]);
}

export async function getSentencesByLesson(lessonId: string): Promise<FluentDB['sentences']['value'][]> {
  const db = await getDB();
  const sentences = await db.getAllFromIndex('sentences', 'by-lesson', lessonId);
  return sentences.sort((a, b) => a.orderIndex - b.orderIndex);
}

// ============================================
// PROGRESS
// ============================================

export async function saveProgress(progress: FluentDB['progress']['value']): Promise<void> {
  const db = await getDB();
  await db.put('progress', progress);
}

export async function getProgress(lessonId: string): Promise<FluentDB['progress']['value'] | undefined> {
  const db = await getDB();
  return db.get('progress', lessonId);
}

export async function getAllProgress(): Promise<FluentDB['progress']['value'][]> {
  const db = await getDB();
  return db.getAll('progress');
}

// ============================================
// OFFLINE QUEUE
// ============================================

export async function addToOfflineQueue(
  item: Omit<FluentDB['offlineQueue']['value'], 'id'>
): Promise<number> {
  const db = await getDB();
  return db.add('offlineQueue', item as FluentDB['offlineQueue']['value']);
}

export async function getOfflineQueue(): Promise<FluentDB['offlineQueue']['value'][]> {
  const db = await getDB();
  return db.getAll('offlineQueue');
}

export async function removeFromOfflineQueue(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('offlineQueue', id);
}

export async function clearOfflineQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('offlineQueue');
}

// ============================================
// AUDIO CACHE
// ============================================

export async function cacheAudio(
  lessonId: string,
  audioType: 'short' | 'long',
  blob: Blob
): Promise<void> {
  const db = await getDB();
  await db.put('audioCache', {
    lessonId: `${lessonId}-${audioType}`,
    audioType,
    blob,
    cachedAt: new Date(),
  });
}

export async function getCachedAudio(
  lessonId: string,
  audioType: 'short' | 'long'
): Promise<Blob | undefined> {
  const db = await getDB();
  const cached = await db.get('audioCache', `${lessonId}-${audioType}`);
  return cached?.blob;
}

export async function isAudioCached(
  lessonId: string,
  audioType: 'short' | 'long'
): Promise<boolean> {
  const db = await getDB();
  const cached = await db.get('audioCache', `${lessonId}-${audioType}`);
  return !!cached;
}

export async function removeAudioCache(lessonId: string): Promise<void> {
  const db = await getDB();
  await db.delete('audioCache', `${lessonId}-short`);
  await db.delete('audioCache', `${lessonId}-long`);
}

// ============================================
// USER PREFERENCES
// ============================================

export async function setUserPref(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('userPrefs', value, key);
}

export async function getUserPref<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('userPrefs', key) as Promise<T | undefined>;
}

// ============================================
// UTILITIES
// ============================================

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('lessons'),
    db.clear('sentences'),
    db.clear('progress'),
    db.clear('offlineQueue'),
    db.clear('audioCache'),
    db.clear('userPrefs'),
  ]);
}

export async function getStorageUsage(): Promise<{
  lessons: number;
  sentences: number;
  audio: number;
  total: number;
}> {
  const db = await getDB();

  const lessons = await db.count('lessons');
  const sentences = await db.count('sentences');

  // Estimate audio cache size
  const audioItems = await db.getAll('audioCache');
  const audioSize = audioItems.reduce((sum, item) => sum + item.blob.size, 0);

  return {
    lessons,
    sentences,
    audio: audioSize,
    total: lessons + sentences + audioSize,
  };
}

// ============================================
// DOWNLOAD LESSON FOR OFFLINE
// ============================================

export interface DownloadProgress {
  stage: 'lesson' | 'sentences' | 'audio-short' | 'audio-long' | 'complete';
  progress: number;
}

export async function downloadLessonForOffline(
  lessonId: string,
  lessonData: FluentDB['lessons']['value'],
  sentences: FluentDB['sentences']['value'][],
  shortAudioUrl?: string,
  longAudioUrl?: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  // Save lesson metadata
  onProgress?.({ stage: 'lesson', progress: 0 });
  await saveLesson({
    ...lessonData,
    downloadedAt: new Date(),
  });
  onProgress?.({ stage: 'lesson', progress: 100 });

  // Save sentences
  onProgress?.({ stage: 'sentences', progress: 0 });
  await saveSentences(sentences);
  onProgress?.({ stage: 'sentences', progress: 100 });

  // Download and cache audio files
  if (shortAudioUrl) {
    onProgress?.({ stage: 'audio-short', progress: 0 });
    try {
      const response = await fetch(shortAudioUrl);
      const blob = await response.blob();
      await cacheAudio(lessonId, 'short', blob);
    } catch (error) {
      console.error('Failed to cache short audio:', error);
    }
    onProgress?.({ stage: 'audio-short', progress: 100 });
  }

  if (longAudioUrl) {
    onProgress?.({ stage: 'audio-long', progress: 0 });
    try {
      const response = await fetch(longAudioUrl);
      const blob = await response.blob();
      await cacheAudio(lessonId, 'long', blob);
    } catch (error) {
      console.error('Failed to cache long audio:', error);
    }
    onProgress?.({ stage: 'audio-long', progress: 100 });
  }

  onProgress?.({ stage: 'complete', progress: 100 });
}

export async function removeLessonFromOffline(lessonId: string): Promise<void> {
  const db = await getDB();

  // Remove lesson
  await db.delete('lessons', lessonId);

  // Remove sentences
  const sentences = await db.getAllFromIndex('sentences', 'by-lesson', lessonId);
  const tx = db.transaction('sentences', 'readwrite');
  await Promise.all([
    ...sentences.map((s) => tx.store.delete(s.id)),
    tx.done,
  ]);

  // Remove audio cache
  await removeAudioCache(lessonId);
}
