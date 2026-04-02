import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardRedirect,
});

function DashboardRedirect(): React.JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'SUPER_ADMIN':
        navigate({ to: '/dashboard/venues', replace: true });
        break;
      case 'MANAGER':
        navigate({ to: '/dashboard/notifications', replace: true });
        break;
      case 'WORKER':
        navigate({ to: '/dashboard/notifications', replace: true });
        break;
      default:
        navigate({ to: '/', replace: true });
    }
  }, [user, navigate]);

  return <></>;
}
