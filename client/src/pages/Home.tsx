import { useAuthStore } from '../stores/authStore';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export function Home() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
            Fluent in Four
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <span className="text-sm text-stone-600 dark:text-stone-400">
                Welcome, {user?.displayName || 'User'}
              </span>
            ) : (
              <a
                href="/auth"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-display font-bold text-stone-900 dark:text-stone-50 mb-4">
            Learn Romance Languages
          </h2>
          <p className="text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-2xl mx-auto">
            Master Spanish, French, Italian, and Portuguese through immersive exercises.
            Listen, shadow, write, and translate your way to fluency.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { flag: '🇪🇸', name: 'Spanish', native: 'Español' },
              { flag: '🇫🇷', name: 'French', native: 'Français' },
              { flag: '🇮🇹', name: 'Italian', native: 'Italiano' },
              { flag: '🇧🇷', name: 'Portuguese', native: 'Português' },
            ].map((lang) => (
              <div
                key={lang.name}
                className="p-6 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-2">{lang.flag}</div>
                <div className="font-medium text-stone-900 dark:text-stone-50">
                  {lang.name}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  {lang.native}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
