import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskProgressData {
  lessonId: string;
  taskNumber: number;
  percentComplete: number;
  isCompleted: boolean;
  timeSpentSeconds: number;
  sentencesCompleted: number;
  repsCompleted: number;
  lastUpdated: number;
}

export interface LessonProgressData {
  lessonId: string;
  percentComplete: number;
  isCompleted: boolean;
  timeSpentSeconds: number;
  lastUpdated: number;
}

interface OfflineUpdate {
  id: string;
  lessonId: string;
  taskNumber?: number;
  data: Partial<TaskProgressData | LessonProgressData>;
  timestamp: number;
}

interface ProgressState {
  // Progress data
  tasks: Map<string, TaskProgressData>; // key: lessonId-taskNumber
  lessons: Map<string, LessonProgressData>;

  // Offline sync queue
  offlineQueue: OfflineUpdate[];
  isSyncing: boolean;
  lastSyncTime: number | null;

  // Actions
  updateTaskProgress: (
    lessonId: string,
    taskNumber: number,
    data: Partial<TaskProgressData>
  ) => void;
  updateLessonProgress: (
    lessonId: string,
    data: Partial<LessonProgressData>
  ) => void;
  getTaskProgress: (lessonId: string, taskNumber: number) => TaskProgressData | null;
  getLessonProgress: (lessonId: string) => LessonProgressData | null;
  addToOfflineQueue: (update: Omit<OfflineUpdate, 'id' | 'timestamp'>) => void;
  clearOfflineQueue: () => void;
  removeFromOfflineQueue: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: number) => void;
  loadProgress: (tasks: TaskProgressData[], lessons: LessonProgressData[]) => void;
  syncProgress: () => Promise<void>;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      tasks: new Map(),
      lessons: new Map(),
      offlineQueue: [],
      isSyncing: false,
      lastSyncTime: null,

      updateTaskProgress: (lessonId, taskNumber, data) => {
        const key = `${lessonId}-${taskNumber}`;
        const existing = get().tasks.get(key);

        const updated: TaskProgressData = {
          lessonId,
          taskNumber,
          percentComplete: data.percentComplete ?? existing?.percentComplete ?? 0,
          isCompleted: data.isCompleted ?? existing?.isCompleted ?? false,
          timeSpentSeconds: (data.timeSpentSeconds ?? 0) + (existing?.timeSpentSeconds ?? 0),
          sentencesCompleted: Math.max(
            data.sentencesCompleted ?? 0,
            existing?.sentencesCompleted ?? 0
          ),
          repsCompleted: data.repsCompleted ?? existing?.repsCompleted ?? 0,
          lastUpdated: Date.now(),
        };

        set((state) => {
          const newTasks = new Map(state.tasks);
          newTasks.set(key, updated);
          return { tasks: newTasks };
        });

        // Add to offline queue for sync
        get().addToOfflineQueue({
          lessonId,
          taskNumber,
          data: updated,
        });
      },

      updateLessonProgress: (lessonId, data) => {
        const existing = get().lessons.get(lessonId);

        const updated: LessonProgressData = {
          lessonId,
          percentComplete: data.percentComplete ?? existing?.percentComplete ?? 0,
          isCompleted: data.isCompleted ?? existing?.isCompleted ?? false,
          timeSpentSeconds: (data.timeSpentSeconds ?? 0) + (existing?.timeSpentSeconds ?? 0),
          lastUpdated: Date.now(),
        };

        set((state) => {
          const newLessons = new Map(state.lessons);
          newLessons.set(lessonId, updated);
          return { lessons: newLessons };
        });

        get().addToOfflineQueue({
          lessonId,
          data: updated,
        });
      },

      getTaskProgress: (lessonId, taskNumber) => {
        const key = `${lessonId}-${taskNumber}`;
        return get().tasks.get(key) || null;
      },

      getLessonProgress: (lessonId) => {
        return get().lessons.get(lessonId) || null;
      },

      addToOfflineQueue: (update) => {
        set((state) => ({
          offlineQueue: [
            ...state.offlineQueue,
            {
              ...update,
              id: generateId(),
              timestamp: Date.now(),
            },
          ],
        }));
      },

      clearOfflineQueue: () => {
        set({ offlineQueue: [] });
      },

      removeFromOfflineQueue: (id) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
        }));
      },

      setSyncing: (syncing) => {
        set({ isSyncing: syncing });
      },

      syncProgress: async () => {
        const state = get();
        if (state.isSyncing || state.offlineQueue.length === 0) return;

        set({ isSyncing: true });

        try {
          // Import api dynamically to avoid circular dependencies
          const { api } = await import('../services/api');

          // Process queue items one by one
          for (const item of state.offlineQueue) {
            try {
              if (item.taskNumber !== undefined) {
                // Task progress update
                await api.post(
                  `/progress/lessons/${item.lessonId}/tasks/${item.taskNumber}`,
                  item.data
                );
              } else {
                // Lesson progress update
                await api.post(`/progress/lessons/${item.lessonId}`, item.data);
              }
              // Remove from queue on success
              get().removeFromOfflineQueue(item.id);
            } catch (error) {
              console.error('Failed to sync item:', item.id, error);
              // Keep in queue for retry
            }
          }

          set({ lastSyncTime: Date.now() });
        } finally {
          set({ isSyncing: false });
        }
      },

      setLastSyncTime: (time) => {
        set({ lastSyncTime: time });
      },

      loadProgress: (tasks, lessons) => {
        const taskMap = new Map<string, TaskProgressData>();
        for (const task of tasks) {
          const key = `${task.lessonId}-${task.taskNumber}`;
          taskMap.set(key, task);
        }

        const lessonMap = new Map<string, LessonProgressData>();
        for (const lesson of lessons) {
          lessonMap.set(lesson.lessonId, lesson);
        }

        set({ tasks: taskMap, lessons: lessonMap });
      },
    }),
    {
      name: 'fluent-progress',
      partialize: (state) => ({
        tasks: Array.from(state.tasks.entries()),
        lessons: Array.from(state.lessons.entries()),
        offlineQueue: state.offlineQueue,
        lastSyncTime: state.lastSyncTime,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        tasks: new Map(persisted.tasks || []),
        lessons: new Map(persisted.lessons || []),
        offlineQueue: persisted.offlineQueue || [],
        lastSyncTime: persisted.lastSyncTime || null,
      }),
    }
  )
);
