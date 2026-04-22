import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated || !user) {
      throw redirect({ to: '/' });
    }
    switch (user.role) {
      case 'SUPER_ADMIN':
        throw redirect({ to: '/dashboard/venues' });
      case 'MANAGER':
      case 'WORKER':
        throw redirect({ to: '/dashboard/notifications' });
      default:
        throw redirect({ to: '/' });
    }
  },
  component: () => null,
});
