import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Users,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  if (role === 'SUPER_ADMIN') {
    return [
      { to: '/dashboard/venues', label: t('dashboard.menu_venues'), icon: Building2 },
    ];
  }

  if (role === 'MANAGER') {
    return [
      { to: '/dashboard/reservations', label: t('dashboard.menu_reservations'), icon: CalendarCheck },
      { to: '/dashboard/events', label: t('dashboard.menu_events'), icon: CalendarDays },
      { to: '/dashboard/employees', label: t('dashboard.menu_employees'), icon: Users },
    ];
  }

  if (role === 'WORKER') {
    return [
      { to: '/dashboard/arrivals', label: t('dashboard.menu_arrivals'), icon: UserCheck },
    ];
  }

  return [];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.JSX.Element {
  const { t } = useTranslation();
  const navItems = useNavItems();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-tertiary-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-secondary-600 md:block">
        <div className="px-6 pt-6 pb-8">
          <Link to="/" className="text-xl font-bold text-primary-400">
            {t('brand.name')}
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mx-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-400 text-primary-400'
                    : 'text-tertiary-200 hover:bg-secondary-500'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-secondary-500 bg-secondary-600 md:hidden">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive ? 'text-primary-400' : 'text-tertiary-400'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="pb-16 md:ml-56 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
