import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null,
  });

  const handleOnline = useCallback(() => {
    setState((prev) => ({
      isOnline: true,
      wasOffline: !prev.isOnline ? true : prev.wasOffline,
      lastOnlineAt: new Date(),
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOnline: false,
    }));
  }, []);

  // Clear the wasOffline flag (for dismissing "back online" messages)
  const clearWasOffline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      wasOffline: false,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    ...state,
    clearWasOffline,
  };
}

// Hook for checking if it's late and user hasn't practiced (streak at risk)
export function useStreakAtRisk(lastPracticedToday: boolean) {
  const [isAtRisk, setIsAtRisk] = useState(false);

  useEffect(() => {
    if (lastPracticedToday) {
      setIsAtRisk(false);
      return;
    }

    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // After 8pm local time, streak is at risk
      setIsAtRisk(hours >= 20);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastPracticedToday]);

  return isAtRisk;
}
