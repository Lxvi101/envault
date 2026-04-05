import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AUTO_LOCK_MS } from '@/lib/constants';

interface AutoLockProviderProps {
  children: ReactNode;
}

export function AutoLockProvider({ children }: AutoLockProviderProps) {
  const { lock, isLocked, isFirstRun } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (isLocked || isFirstRun) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      lock();
    }, AUTO_LOCK_MS);
  }, [lock, isLocked, isFirstRun]);

  useEffect(() => {
    if (isLocked || isFirstRun) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'pointerdown',
      'touchstart',
      'scroll',
    ];

    // Start the timer
    resetTimer();

    // Reset on any user activity
    const handler = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handler, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLocked, isFirstRun, resetTimer]);

  return <>{children}</>;
}
