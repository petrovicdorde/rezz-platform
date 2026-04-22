import { redirect } from '@tanstack/react-router';
import type { UserRole } from '@rezz/shared';
import { useAuthStore } from '@/store/auth.store';

/**
 * Block a route from unauthenticated users or users whose role isn't in the
 * allowed list. Silently redirects to `/` — no permission-denied screen.
 *
 * Call from a TanStack Route's `beforeLoad`:
 *   beforeLoad: () => requireRole(['MANAGER', 'SUPER_ADMIN']),
 */
export function requireRole(allowed: UserRole[]): void {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated || !user || !allowed.includes(user.role)) {
    throw redirect({ to: '/' });
  }
}
