import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  User,
  Trophy,
  Flame,
  BookOpen,
  Languages,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { getUsers, getUser, updateUserRole, UserDetails } from '../../services/admin';
import { useAuthStore } from '../../stores/authStore';

const ITEMS_PER_PAGE = 20;

export function UserManagement() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers(
        searchQuery || undefined,
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleUserClick = async (userId: string) => {
    setLoadingUser(true);
    try {
      const response = await getUser(userId);
      if (response.success && response.data) {
        setSelectedUser(response.data);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdatingRole(true);
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        // Update both lists
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          User Management
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">
          View and manage user accounts
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users list */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 dark:bg-stone-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className={`cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 ${
                          selectedUser?.id === user.id
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <span className="text-primary-700 dark:text-primary-300 font-medium">
                                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-stone-900 dark:text-stone-50">
                                {user.displayName || 'No name'}
                              </p>
                              <p className="text-sm text-stone-500 dark:text-stone-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {user.role === 'admin' ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-stone-900 dark:text-stone-50">
                          {user.level}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-stone-600 dark:text-stone-400">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 dark:border-stone-700">
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    Showing {page * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min((page + 1) * ITEMS_PER_PAGE, total)} of {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </button>
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User details panel */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
          {loadingUser ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* User header */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <span className="text-3xl text-primary-700 dark:text-primary-300 font-medium">
                      {(selectedUser.displayName || selectedUser.email || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {selectedUser.displayName || 'No name'}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {selectedUser.email}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
                  <Trophy className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {selectedUser.totalXp.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">XP</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {selectedUser.currentStreak}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Streak</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
                  <BookOpen className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {selectedUser.lessonsCompleted}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Lessons</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3 text-center">
                  <Languages className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {selectedUser.languagesLearning}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Languages</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Level</span>
                  <span className="font-medium text-stone-900 dark:text-stone-50">
                    {selectedUser.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Joined</span>
                  <span className="font-medium text-stone-900 dark:text-stone-50">
                    {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Last Active</span>
                  <span className="font-medium text-stone-900 dark:text-stone-50">
                    {formatDate(selectedUser.lastActiveAt)}
                  </span>
                </div>
              </div>

              {/* Role management */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  User Role
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'user')}
                    disabled={
                      selectedUser.role === 'user' ||
                      updatingRole ||
                      selectedUser.id === currentUser?.id
                    }
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      selectedUser.role === 'user'
                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-50'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                    disabled={
                      selectedUser.role === 'admin' ||
                      updatingRole
                    }
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      selectedUser.role === 'admin'
                        ? 'bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-50'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    Admin
                  </button>
                </div>
                {selectedUser.id === currentUser?.id && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                    You cannot change your own role
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">
                Select a user to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
