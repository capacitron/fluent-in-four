import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  LogOut,
  Trash2,
  ChevronRight,
  HelpCircle,
  Shield,
  Bell,
  Download,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useSoundSettings } from '../hooks/useSoundEffects';
import { Header } from '../components/layout/Header';
import { BottomNavSpacer } from '../components/layout/BottomNav';
import { StaggerContainer, StaggerItem } from '../components/ui';

export function Settings() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundSettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    console.log('Delete account requested');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header title="Settings" showStats={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <StaggerContainer className="space-y-6">
          {/* Appearance */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
                Appearance
              </h3>
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {/* Theme toggle */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    )}
                    <span className="font-medium text-stone-900 dark:text-stone-50">
                      Dark Mode
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={theme === 'dark'}
                    onChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
                  />
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Sound & Haptics */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
                Sound & Haptics
              </h3>
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {/* Sound effects toggle */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    )}
                    <span className="font-medium text-stone-900 dark:text-stone-50">
                      Sound Effects
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={soundEnabled}
                    onChange={setSoundEnabled}
                  />
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* App Settings */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
                App
              </h3>
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {/* Notifications */}
                <SettingsRow
                  icon={Bell}
                  label="Notifications"
                  sublabel="Reminders & updates"
                  onClick={() => {}}
                />

                <div className="border-t border-stone-200 dark:border-stone-700" />

                {/* Download for offline */}
                <SettingsRow
                  icon={Download}
                  label="Offline Content"
                  sublabel="Manage downloaded lessons"
                  onClick={() => {}}
                />

                <div className="border-t border-stone-200 dark:border-stone-700" />

                {/* Install PWA */}
                <SettingsRow
                  icon={Smartphone}
                  label="Install App"
                  sublabel="Add to home screen"
                  onClick={() => {
                    // PWA install prompt would be triggered here
                  }}
                />
              </div>
            </div>
          </StaggerItem>

          {/* Support */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
                Support
              </h3>
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <SettingsRow
                  icon={HelpCircle}
                  label="Help & FAQ"
                  onClick={() => {}}
                />

                <div className="border-t border-stone-200 dark:border-stone-700" />

                <SettingsRow
                  icon={Shield}
                  label="Privacy Policy"
                  onClick={() => {}}
                />
              </div>
            </div>
          </StaggerItem>

          {/* Account */}
          <StaggerItem>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-1">
                Account
              </h3>
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {/* Logout */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors touch-manipulation"
                >
                  <LogOut className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <span className="font-medium text-stone-900 dark:text-stone-50">
                    Log Out
                  </span>
                </button>

                <div className="border-t border-stone-200 dark:border-stone-700" />

                {/* Delete account */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors touch-manipulation"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Delete Account
                  </span>
                </button>
              </div>
            </div>
          </StaggerItem>

          {/* Version */}
          <StaggerItem>
            <p className="text-center text-sm text-stone-400 dark:text-stone-500">
              Fluent in Four v1.0.0
            </p>
          </StaggerItem>
        </StaggerContainer>
      </main>

      <BottomNavSpacer />

      {/* Logout confirmation */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Delete account confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account"
        message="This action cannot be undone. All your progress, achievements, and data will be permanently deleted."
        confirmLabel="Delete Account"
        confirmDestructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

// Toggle switch component
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative w-12 h-7 rounded-full transition-colors touch-manipulation
        ${enabled ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600'}
      `}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ left: enabled ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// Settings row component
function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  icon: typeof Moon;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors touch-manipulation"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
        <div className="text-left">
          <p className="font-medium text-stone-900 dark:text-stone-50">{label}</p>
          {sublabel && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {sublabel}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-stone-400" />
    </button>
  );
}

// Confirmation dialog
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmDestructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6"
      >
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          {title}
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50 font-medium rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 font-medium rounded-xl transition-colors touch-manipulation ${
              confirmDestructive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
