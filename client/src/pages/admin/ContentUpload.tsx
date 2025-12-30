import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Music,
  Check,
  AlertCircle,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import {
  getLessons,
  LessonDetails,
  importSentences,
  parseCSV,
  CSVSentence,
} from '../../services/admin';
import { getLanguages } from '../../services/languages';

export function ContentUpload() {
  const [lessons, setLessons] = useState<LessonDetails[]>([]);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    []
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedSentences, setParsedSentences] = useState<CSVSentence[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load lessons when language changes
  useEffect(() => {
    async function loadLessons() {
      if (!selectedLanguage) {
        setLessons([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getLessons(selectedLanguage);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setParseError(null);
    setParsedSentences([]);
    setImportResult(null);

    try {
      const text = await file.text();
      const sentences = parseCSV(text);
      setParsedSentences(sentences);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
    }
  };

  const handleImport = async () => {
    if (!selectedLesson || parsedSentences.length === 0) return;

    setImporting(true);
    setImportResult(null);

    try {
      const response = await importSentences(selectedLesson, parsedSentences);
      if (response.success && response.data) {
        setImportResult({
          success: true,
          message: `Successfully imported ${response.data.importedCount} sentences`,
        });
        // Clear the form
        setCsvFile(null);
        setParsedSentences([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setImportResult({
          success: false,
          message: 'Failed to import sentences',
        });
      }
    } catch (err) {
      setImportResult({
        success: false,
        message: err instanceof Error ? err.message : 'Import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setCsvFile(null);
    setParsedSentences([]);
    setParseError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          Content Upload
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">
          Import sentences from CSV files
        </p>
      </div>

      {/* Selection section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700 space-y-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          1. Select Target Lesson
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Language
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setSelectedLesson('');
                }}
                className="w-full appearance-none pl-4 pr-10 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Lesson selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Lesson
            </label>
            <div className="relative">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={!selectedLanguage || loading}
                className="w-full appearance-none pl-4 pr-10 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">Select lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    Lesson {lesson.lessonNumber}: {lesson.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700 space-y-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          2. Upload CSV File
        </h2>

        <div className="text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 rounded-lg p-4">
          <p className="font-medium mb-2">Required CSV columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">
                english
              </code>{' '}
              - English sentence text
            </li>
            <li>
              <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">
                target
              </code>{' '}
              - Target language sentence
            </li>
          </ul>
          <p className="mt-2">Optional columns: audio_start_ms, audio_end_ms, pronunciation, notes</p>
        </div>

        {/* File upload area */}
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${
              csvFile
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : 'border-stone-300 dark:border-stone-600 hover:border-primary-400 dark:hover:border-primary-600'
            }
          `}
        >
          {csvFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <FileText className="w-8 h-8" />
                <span className="font-medium">{csvFile.name}</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {parsedSentences.length} sentences parsed
              </p>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Trash2 className="w-4 h-4" />
                Remove file
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400 mb-2">
                Drag and drop a CSV file here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Select File
              </button>
            </>
          )}
        </div>

        {/* Parse error */}
        {parseError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              importResult.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}
          >
            {importResult.success ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{importResult.message}</span>
          </div>
        )}
      </div>

      {/* Preview section */}
      {parsedSentences.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              3. Preview & Import
            </h2>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {parsedSentences.length} sentences
            </span>
          </div>

          {/* Preview table */}
          <div className="max-h-64 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-stone-600 dark:text-stone-400">
                    #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-stone-600 dark:text-stone-400">
                    English
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-stone-600 dark:text-stone-400">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {parsedSentences.slice(0, 20).map((sentence, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-stone-500 dark:text-stone-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-stone-900 dark:text-stone-50">
                      {sentence.english.slice(0, 50)}
                      {sentence.english.length > 50 ? '...' : ''}
                    </td>
                    <td className="px-3 py-2 text-stone-900 dark:text-stone-50">
                      {sentence.target.slice(0, 50)}
                      {sentence.target.length > 50 ? '...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedSentences.length > 20 && (
              <div className="px-3 py-2 text-center text-sm text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800">
                And {parsedSentences.length - 20} more...
              </div>
            )}
          </div>

          {/* Import button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={!selectedLesson || importing}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Sentences
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Audio upload section (placeholder) */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700 space-y-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          Audio Files
        </h2>
        <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <Music className="w-8 h-8 text-stone-400" />
          <div>
            <p className="text-stone-600 dark:text-stone-400">
              Audio file upload will be available when deploying to Replit with Object Storage.
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
              For now, audio files should be uploaded directly to Object Storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
