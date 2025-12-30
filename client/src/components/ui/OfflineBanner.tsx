import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X, RefreshCw } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useProgressStore } from '../../stores/progressStore';

export function OfflineBanner() {
  const { isOnline, wasOffline, clearWasOffline } = useOffline();
  const pendingCount = useProgressStore((state) => state.offlineQueue.length);
  const syncProgress = useProgressStore((state) => state.syncProgress);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Show "back online" message when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);
      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        setShowBackOnline(false);
        clearWasOffline();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, wasOffline, clearWasOffline]);

  // Sync progress when back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    if (syncing || pendingCount === 0) return;
    setSyncing(true);
    try {
      await syncProgress();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const dismissBackOnline = () => {
    setShowBackOnline(false);
    clearWasOffline();
  };

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 z-50 safe-area-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
          {pendingCount > 0 && (
            <span className="text-sm opacity-90">
              {pendingCount} changes pending sync
            </span>
          )}
        </div>
      </div>
    );
  }

  // Back online banner
  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 z-50 safe-area-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back online</span>
            {syncing && (
              <span className="text-sm opacity-90 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            )}
          </div>
          <button
            onClick={dismissBackOnline}
            className="p-1 hover:bg-green-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Pending sync indicator (when online but has pending items)
  if (pendingCount > 0 && !syncing) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-primary-500 text-white px-4 py-2 z-50 safe-area-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {pendingCount} changes to sync
            </span>
          </div>
          <button
            onClick={handleSync}
            className="text-sm font-medium underline hover:no-underline"
          >
            Sync now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Compact offline indicator for headers
export function OfflineIndicator() {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
      <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
        Offline
      </span>
    </div>
  );
}
