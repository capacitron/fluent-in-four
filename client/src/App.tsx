import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useTheme } from './hooks/useTheme';
import { api } from './services/api';

// Pages
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { LanguageSelect } from './pages/LanguageSelect';
import { LessonList } from './pages/LessonList';
import { Lesson } from './pages/Lesson';
import { Task } from './pages/Task';
import { Achievements } from './pages/Achievements';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// Layout
import { BottomNav } from './components/layout/BottomNav';

// Admin
import { AdminLayout } from './components/admin';
import {
  Dashboard as AdminDashboard,
  LessonManager,
  ContentUpload,
  UserManagement,
} from './pages/admin';

// PWA & Offline
import { OfflineBanner } from './components/ui/OfflineBanner';
import { PWAUpdatePrompt } from './components/ui/PWAUpdatePrompt';
import { ToastProvider } from './components/ui/Toast';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Auth check on app load
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{
          id: string;
          email: string;
          displayName: string | null;
          avatarUrl: string | null;
          role: string;
          totalXp: number;
          level: number;
        }>('/auth/me');

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [accessToken, setLoading, setUser, logout]);

  return <>{children}</>;
}

// Theme initializer
function ThemeProvider({ children }: { children: React.ReactNode }) {
  // This hook applies the theme on mount
  useTheme();
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {/* PWA Components */}
            <OfflineBanner />
            <PWAUpdatePrompt />

            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes - placeholders for now */}
            <Route
              path="/languages"
              element={
                <ProtectedRoute>
                  <LanguageSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:languageCode"
              element={
                <ProtectedRoute>
                  <LessonList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <Lesson />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:lessonId/task/:taskNumber"
              element={
                <ProtectedRoute>
                  <Task />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="lessons" element={<LessonManager />} />
              <Route path="content" element={<ContentUpload />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2">
                      404
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400">
                      Page not found
                    </p>
                    <a
                      href="/"
                      className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Go home
                    </a>
                  </div>
                </div>
              }
            />
            </Routes>

            {/* Bottom Navigation - shows on main app pages */}
            <BottomNav />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
