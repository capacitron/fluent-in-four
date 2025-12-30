import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { AdminSidebar } from './AdminSidebar';
import { ThemeToggle } from '../layout/ThemeToggle';

export function AdminLayout() {
  const { user, isLoading } = useAuthStore();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/languages" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 lg:flex">
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-6 lg:px-8">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600 dark:text-stone-400">
              {user.email}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
