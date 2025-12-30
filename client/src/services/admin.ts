import { api, ApiResponse } from './api';

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  lessonsCompleted: number;
  totalLanguages: number;
  totalLessons: number;
  totalSentences: number;
  languageStats: {
    code: string;
    name: string;
    usersLearning: number;
    lessonsCompleted: number;
  }[];
  recentActivity: {
    date: string;
    newUsers: number;
    lessonsCompleted: number;
  }[];
}

export interface LessonDetails {
  id: string;
  languageCode: string;
  languageName: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  totalXp: number;
  level: number;
  languagesLearning: number;
  lessonsCompleted: number;
  currentStreak: number;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface ContentUpload {
  id: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  storageKey: string;
  fileSizeBytes: number;
  status: string;
  processingNotes: string | null;
  createdAt: string;
}

export interface CSVSentence {
  english: string;
  target: string;
  audioStartMs?: number;
  audioEndMs?: number;
  pronunciation?: string;
  notes?: string;
}

// ============================================
// DASHBOARD
// ============================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return api.get<DashboardStats>('/admin/stats');
}

// ============================================
// LESSONS
// ============================================

export async function getLessons(
  languageCode?: string
): Promise<ApiResponse<LessonDetails[]>> {
  const params = languageCode ? `?language=${languageCode}` : '';
  return api.get<LessonDetails[]>(`/admin/lessons${params}`);
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    description: string;
    estimatedMinutes: number;
    isActive: boolean;
    isLocked: boolean;
    xpReward: number;
    shortAudioKey: string;
    longAudioKey: string;
  }>
): Promise<ApiResponse<LessonDetails>> {
  return api.patch<LessonDetails>(`/admin/lessons/${lessonId}`, data);
}

export async function importSentences(
  lessonId: string,
  sentences: CSVSentence[]
): Promise<ApiResponse<{ importedCount: number }>> {
  return api.post<{ importedCount: number }>(
    `/admin/lessons/${lessonId}/sentences`,
    { sentences }
  );
}

// ============================================
// USERS
// ============================================

export async function getUsers(
  query?: string,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<{ users: UserDetails[]; total: number }>> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());

  return api.get<{ users: UserDetails[]; total: number }>(
    `/admin/users?${params.toString()}`
  );
}

export async function getUser(
  userId: string
): Promise<ApiResponse<UserDetails>> {
  return api.get<UserDetails>(`/admin/users/${userId}`);
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<ApiResponse<{ message: string }>> {
  return api.patch<{ message: string }>(`/admin/users/${userId}/role`, { role });
}

// ============================================
// CONTENT UPLOADS
// ============================================

export async function getContentUploads(
  limit: number = 50
): Promise<ApiResponse<ContentUpload[]>> {
  return api.get<ContentUpload[]>(`/admin/uploads?limit=${limit}`);
}

export async function createContentUpload(data: {
  fileName: string;
  fileType: string;
  storageKey: string;
  fileSizeBytes: number;
}): Promise<ApiResponse<ContentUpload>> {
  return api.post<ContentUpload>('/admin/uploads', data);
}

export async function updateUploadStatus(
  uploadId: string,
  status: string,
  notes?: string
): Promise<ApiResponse<{ message: string }>> {
  return api.patch<{ message: string }>(`/admin/uploads/${uploadId}/status`, {
    status,
    notes,
  });
}

// ============================================
// CSV PARSING
// ============================================

export function parseCSV(csvText: string): CSVSentence[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const englishIdx = header.indexOf('english');
  const targetIdx = header.indexOf('target');

  if (englishIdx === -1 || targetIdx === -1) {
    throw new Error('CSV must have "english" and "target" columns');
  }

  const audioStartIdx = header.indexOf('audio_start_ms');
  const audioEndIdx = header.indexOf('audio_end_ms');
  const pronunciationIdx = header.indexOf('pronunciation');
  const notesIdx = header.indexOf('notes');

  const sentences: CSVSentence[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (doesn't handle quoted commas)
    const values = parseCSVLine(line);

    const sentence: CSVSentence = {
      english: values[englishIdx] || '',
      target: values[targetIdx] || '',
    };

    if (audioStartIdx !== -1 && values[audioStartIdx]) {
      sentence.audioStartMs = parseInt(values[audioStartIdx], 10);
    }
    if (audioEndIdx !== -1 && values[audioEndIdx]) {
      sentence.audioEndMs = parseInt(values[audioEndIdx], 10);
    }
    if (pronunciationIdx !== -1 && values[pronunciationIdx]) {
      sentence.pronunciation = values[pronunciationIdx];
    }
    if (notesIdx !== -1 && values[notesIdx]) {
      sentence.notes = values[notesIdx];
    }

    if (sentence.english && sentence.target) {
      sentences.push(sentence);
    }
  }

  return sentences;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}
