import { useState, useEffect } from 'react';
import {
  BookOpen,
  Edit,
  Lock,
  Unlock,
  Check,
  X,
  ChevronDown,
  Music,
} from 'lucide-react';
import { getLessons, updateLesson, LessonDetails } from '../../services/admin';
import { getLanguages } from '../../services/languages';

interface EditingLesson {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
}

export function LessonManager() {
  const [lessons, setLessons] = useState<LessonDetails[]>([]);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    []
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  // Load languages
  useEffect(() => {
    async function loadLanguages() {
      try {
        const langs = await getLanguages();
        setLanguages(langs.map((l) => ({ code: l.code, name: l.name })));
      } catch (err) {
        console.error('Failed to load languages:', err);
      }
    }
    loadLanguages();
  }, []);

  // Load lessons
  useEffect(() => {
    async function loadLessons() {
      setLoading(true);
      try {
        const response = await getLessons(
          selectedLanguage || undefined
        );
        if (response.success && response.data) {
          setLessons(response.data);
        }
      } catch (err) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLessons();
  }, [selectedLanguage]);

  const handleEdit = (lesson: LessonDetails) => {
    setEditingLesson({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      estimatedMinutes: lesson.estimatedMinutes || 60,
      xpReward: lesson.xpReward,
    });
  };

  const handleSave = async () => {
    if (!editingLesson) return;
    setSaving(true);

    try {
      const response = await updateLesson(editingLesson.id, {
        title: editingLesson.title,
        description: editingLesson.description,
        estimatedMinutes: editingLesson.estimatedMinutes,
        xpReward: editingLesson.xpReward,
      });

      if (response.success && response.data) {
        setLessons((prev) =>
          prev.map((l) => (l.id === response.data!.id ? response.data! : l))
        );
        setEditingLesson(null);
      }
    } catch (err) {
      console.error('Failed to save lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (lesson: LessonDetails) => {
    try {
      const response = await updateLesson(lesson.id, {
        isActive: !lesson.isActive,
      });

      if (response.success && response.data) {
        setLessons((prev) =>
          prev.map((l) => (l.id === response.data!.id ? response.data! : l))
        );
      }
    } catch (err) {
      console.error('Failed to toggle active:', err);
    }
  };

  const toggleLocked = async (lesson: LessonDetails) => {
    try {
      const response = await updateLesson(lesson.id, {
        isLocked: !lesson.isLocked,
      });

      if (response.success && response.data) {
        setLessons((prev) =>
          prev.map((l) => (l.id === response.data!.id ? response.data! : l))
        );
      }
    } catch (err) {
      console.error('Failed to toggle locked:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Lesson Manager
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Manage lessons, content, and audio files
          </p>
        </div>

        {/* Language filter */}
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Lessons table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">
              No lessons found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Sentences
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Audio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-300 font-bold">
                          {lesson.lessonNumber}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-50">
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-sm text-stone-500 dark:text-stone-400 truncate max-w-xs">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {lesson.languageName}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-stone-900 dark:text-stone-50">
                      {lesson.sentenceCount}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Music
                          className={`w-4 h-4 ${
                            lesson.shortAudioKey
                              ? 'text-green-500'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                        <Music
                          className={`w-4 h-4 ${
                            lesson.longAudioKey
                              ? 'text-green-500'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleActive(lesson)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            lesson.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {lesson.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => toggleLocked(lesson)}
                          title={lesson.isLocked ? 'Unlock' : 'Lock'}
                          className={`p-1 rounded ${
                            lesson.isLocked
                              ? 'text-amber-500'
                              : 'text-stone-400'
                          }`}
                        >
                          {lesson.isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              Edit Lesson
            </h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingLesson.title}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Description
              </label>
              <textarea
                value={editingLesson.description}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Est. Minutes
                </label>
                <input
                  type="number"
                  value={editingLesson.estimatedMinutes}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      estimatedMinutes: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min={0}
                  className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={editingLesson.xpReward}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      xpReward: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min={0}
                  className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditingLesson(null)}
                disabled={saving}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2" />
                ) : (
                  <Check className="w-4 h-4 inline mr-1" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
