import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'click',
  'touchstart',
  'scroll',
  'wheel',
] as const;

const LAST_ACTIVITY_KEY = 'rezz-last-activity';
const WRITE_THROTTLE_MS = 30_000;
const CHECK_INTERVAL_MS = 30_000;

interface UseIdleLogoutOptions {
  timeoutMs: number;
  onTimeout: () => void;
  enabled: boolean;
}

export function useIdleLogout({
  timeoutMs,
  onTimeout,
  enabled,
}: UseIdleLogoutOptions): void {
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled) return;

    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    let lastWrite = Date.now();

    const touch = (): void => {
      const now = Date.now();
      if (now - lastWrite < WRITE_THROTTLE_MS) return;
      lastWrite = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, touch, { passive: true });
    }

    const checkIdle = (): void => {
      if (!useAuthStore.getState().isAuthenticated) return;
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
      const last = raw ? Number(raw) : 0;
      if (!Number.isFinite(last) || last <= 0) return;
      if (Date.now() - last >= timeoutMs) {
        onTimeoutRef.current();
      }
    };

    const intervalId = window.setInterval(checkIdle, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, touch);
      }
      window.clearInterval(intervalId);
    };
  }, [enabled, timeoutMs]);
}
