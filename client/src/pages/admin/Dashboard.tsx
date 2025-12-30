import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Trophy,
  Languages,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../../services/admin';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  trend?: number;
}

function StatCard({ title, value, icon: Icon, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">{title}</p>
          <p className="text-3xl font-bold text-stone-900 dark:text-stone-50 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          <TrendingUp
            className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}
          />
          <span
            className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            vs last week
          </span>
        </div>
      )}
    </div>
  );
}

interface LanguageBarProps {
  name: string;
  code: string;
  value: number;
  maxValue: number;
  color: string;
}

function LanguageBar({ name, value, maxValue, color }: LanguageBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm text-stone-600 dark:text-stone-400">
        {name}
      </div>
      <div className="flex-1 bg-stone-200 dark:bg-stone-700 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-12 text-right text-sm font-medium text-stone-900 dark:text-stone-50">
        {value}
      </div>
    </div>
  );
}

const languageColors: Record<string, string> = {
  es: '#e67040',
  fr: '#0c9eeb',
  it: '#22c55e',
  pt: '#c7b80e',
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError('Failed to load stats');
        }
      } catch (err) {
        setError('Error loading dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const maxLangUsers = Math.max(...stats.languageStats.map((l) => l.usersLearning));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          Dashboard
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">
          Overview of your language learning platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subtitle={`${stats.activeUsers7d} active this week`}
        />
        <StatCard
          title="Lessons Completed"
          value={stats.lessonsCompleted}
          icon={BookOpen}
        />
        <StatCard
          title="Active Languages"
          value={stats.totalLanguages}
          icon={Languages}
          subtitle={`${stats.totalLessons} total lessons`}
        />
        <StatCard
          title="Total Sentences"
          value={stats.totalSentences}
          icon={Trophy}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language popularity */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-6">
            Languages by Learners
          </h2>
          <div className="space-y-4">
            {stats.languageStats.map((lang) => (
              <LanguageBar
                key={lang.code}
                name={lang.name}
                code={lang.code}
                value={lang.usersLearning}
                maxValue={maxLangUsers}
                color={languageColors[lang.code] || '#6b7280'}
              />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-6">
            Recent Activity (7 days)
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.map((day) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {dayName}, {dateStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        {day.newUsers}
                      </span>{' '}
                      new users
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        {day.lessonsCompleted}
                      </span>{' '}
                      lessons
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User activity summary */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
          User Engagement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {stats.activeUsers7d}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Active (7 days)
            </p>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
              {stats.activeUsers30d}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Active (30 days)
            </p>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
              {stats.totalUsers > 0
                ? Math.round((stats.activeUsers7d / stats.totalUsers) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Weekly Retention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
