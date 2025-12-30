import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// IndexedDB Schema
interface RecordingDB extends DBSchema {
  recordings: {
    key: string;
    value: StoredRecording;
    indexes: {
      'by-sentence': string;
      'by-lesson': string;
      'by-date': number;
    };
  };
}

export interface StoredRecording {
  id: string;
  lessonId: string;
  sentenceId: string;
  orderIndex: number;
  taskNumber: number;
  blob: Blob;
  duration: number;
  createdAt: number;
}

interface RecordingState {
  recordings: StoredRecording[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  addRecording: (recording: Omit<StoredRecording, 'id' | 'createdAt'>) => Promise<string>;
  deleteRecording: (id: string) => Promise<void>;
  getRecordingsForSentence: (sentenceId: string) => StoredRecording[];
  getRecordingsForLesson: (lessonId: string) => StoredRecording[];
  clearAllRecordings: () => Promise<void>;
}

const DB_NAME = 'fluent-in-four-recordings';
const DB_VERSION = 1;

let db: IDBPDatabase<RecordingDB> | null = null;

async function getDB(): Promise<IDBPDatabase<RecordingDB>> {
  if (db) return db;

  db = await openDB<RecordingDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const store = database.createObjectStore('recordings', {
        keyPath: 'id',
      });
      store.createIndex('by-sentence', 'sentenceId');
      store.createIndex('by-lesson', 'lessonId');
      store.createIndex('by-date', 'createdAt');
    },
  });

  return db;
}

function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  recordings: [],
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });

    try {
      const database = await getDB();
      const recordings = await database.getAll('recordings');
      // Sort by date, newest first
      recordings.sort((a, b) => b.createdAt - a.createdAt);
      set({ recordings, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize recording store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addRecording: async (recording) => {
    const id = generateId();
    const storedRecording: StoredRecording = {
      ...recording,
      id,
      createdAt: Date.now(),
    };

    try {
      const database = await getDB();
      await database.add('recordings', storedRecording);

      set((state) => ({
        recordings: [storedRecording, ...state.recordings],
      }));

      return id;
    } catch (error) {
      console.error('Failed to add recording:', error);
      throw error;
    }
  },

  deleteRecording: async (id) => {
    try {
      const database = await getDB();
      await database.delete('recordings', id);

      set((state) => ({
        recordings: state.recordings.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  },

  getRecordingsForSentence: (sentenceId) => {
    return get().recordings.filter((r) => r.sentenceId === sentenceId);
  },

  getRecordingsForLesson: (lessonId) => {
    return get().recordings.filter((r) => r.lessonId === lessonId);
  },

  clearAllRecordings: async () => {
    try {
      const database = await getDB();
      await database.clear('recordings');
      set({ recordings: [] });
    } catch (error) {
      console.error('Failed to clear recordings:', error);
      throw error;
    }
  },
}));

// Helper to create object URL for playback
export function createRecordingURL(recording: StoredRecording): string {
  return URL.createObjectURL(recording.blob);
}

// Helper to revoke object URL when done
export function revokeRecordingURL(url: string): void {
  URL.revokeObjectURL(url);
}
