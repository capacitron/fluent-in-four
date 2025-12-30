import { useState } from 'react';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { LeaderboardEntry, LeaderboardData } from '../../services/gamification';
import { useAuthStore } from '../../stores/authStore';

interface LeaderboardProps {
  data: LeaderboardData;
  loading?: boolean;
  className?: string;
}

export function Leaderboard({ data, loading = false, className = '' }: LeaderboardProps) {
  const currentUser = useAuthStore((s) => s.user);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24" />
            </div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl overflow-hidden ${className}`}>
      {/* Leaderboard entries */}
      <div className="divide-y divide-stone-100 dark:divide-stone-700">
        {data.leaderboard.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUser?.id}
          />
        ))}

        {data.leaderboard.length === 0 && (
          <div className="p-6 text-center text-stone-500 dark:text-stone-400">
            No entries yet. Be the first!
          </div>
        )}
      </div>

      {/* Current user's rank if not in top list */}
      {data.userRank && data.userRank.globalRank > data.leaderboard.length && currentUser && (
        <div className="border-t-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20">
          <div className="px-4 py-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
            Your position
          </div>
          <LeaderboardRow
            entry={{
              rank: data.userRank.globalRank,
              userId: currentUser.id,
              displayName: currentUser.displayName,
              avatarUrl: currentUser.avatarUrl,
              totalXp: currentUser.totalXp,
              level: currentUser.level,
            }}
            isCurrentUser={true}
          />
        </div>
      )}
    </div>
  );
}

// Individual leaderboard row
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

function LeaderboardRow({ entry, isCurrentUser = false }: LeaderboardRowProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" fill="currentColor" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" fill="currentColor" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" fill="currentColor" />;
    return <span className="text-sm font-medium text-stone-500">{rank}</span>;
  };

  const initials = entry.displayName
    ? entry.displayName.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3
        ${isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
      `}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        {getRankDisplay(entry.rank)}
      </div>

      {/* Avatar */}
      {entry.avatarUrl ? (
        <img
          src={entry.avatarUrl}
          alt={entry.displayName || 'User'}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            {initials}
          </span>
        </div>
      )}

      {/* Name and Level */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-medium truncate
            ${isCurrentUser
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-stone-900 dark:text-stone-50'
            }
          `}
        >
          {entry.displayName || 'Anonymous'}
          {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Level {entry.level}
        </p>
      </div>

      {/* XP */}
      <div className="text-right">
        <p className="font-bold text-accent-600 dark:text-accent-400">
          {entry.totalXp.toLocaleString()}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">XP</p>
      </div>
    </div>
  );
}

// Mini leaderboard for dashboard
interface LeaderboardMiniProps {
  data: LeaderboardData;
  loading?: boolean;
  className?: string;
}

export function LeaderboardMini({ data, loading = false, className = '' }: LeaderboardMiniProps) {
  const currentUser = useAuthStore((s) => s.user);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-stone-800 rounded-xl p-4 animate-pulse ${className}`}>
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 py-2">
            <div className="w-6 h-6 bg-stone-200 dark:bg-stone-700 rounded-full" />
            <div className="flex-1 h-3 bg-stone-200 dark:bg-stone-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const top3 = data.leaderboard.slice(0, 3);

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent-500" />
          Leaderboard
        </h3>
        {data.userRank && (
          <span className="text-sm text-stone-500 dark:text-stone-400">
            You: #{data.userRank.globalRank}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {top3.map((entry) => {
          const isCurrentUser = entry.userId === currentUser?.id;
          const medals = ['🥇', '🥈', '🥉'];

          return (
            <div
              key={entry.userId}
              className={`
                flex items-center gap-2 py-1.5 px-2 rounded-lg
                ${isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
              `}
            >
              <span className="text-lg">{medals[entry.rank - 1]}</span>
              <span
                className={`
                  flex-1 truncate text-sm
                  ${isCurrentUser
                    ? 'font-medium text-primary-700 dark:text-primary-300'
                    : 'text-stone-700 dark:text-stone-300'
                  }
                `}
              >
                {entry.displayName || 'Anonymous'}
              </span>
              <span className="text-sm font-medium text-accent-600 dark:text-accent-400">
                {entry.totalXp.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tab switcher for leaderboard types
interface LeaderboardTabsProps {
  activeTab: 'global' | string;
  languages: Array<{ code: string; name: string }>;
  onChange: (tab: string) => void;
  className?: string;
}

export function LeaderboardTabs({
  activeTab,
  languages,
  onChange,
  className = '',
}: LeaderboardTabsProps) {
  return (
    <div className={`flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onChange('global')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${activeTab === 'global'
            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm'
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50'
          }
        `}
      >
        Global
      </button>

      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTab === lang.code
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50'
            }
          `}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
