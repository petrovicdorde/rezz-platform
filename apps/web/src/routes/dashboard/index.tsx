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
    if (user?.role === 'SUPER_ADMIN') {
      navigate({ to: '/dashboard/venues', replace: true });
    } else if (user?.role === 'MANAGER') {
      navigate({ to: '/dashboard/reservations', replace: true });
    } else if (user?.role === 'WORKER') {
      navigate({ to: '/dashboard/arrivals', replace: true });
    } else {
      navigate({ to: '/', replace: true });
    }
  }, [user, navigate]);

  return <></>;
}
