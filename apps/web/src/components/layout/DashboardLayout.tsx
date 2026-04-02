import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Building2,
  Bell,
  CalendarCheck,
  Clock,
  Users,
  UsersRound,
  PartyPopper,
} from 'lucide-react';
import type { UserRole } from '@rezz/shared';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadCount } from '@/hooks/useNotifications';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  showBadge?: boolean;
}

function useNavItems(): NavItem[] {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const items: Record<UserRole, NavItem[]> = {
    SUPER_ADMIN: [
      { to: '/dashboard/venues', label: t('dashboard.menu_venues'), icon: Building2 },
      { to: '/dashboard/users', label: t('dashboard.menu_users'), icon: UsersRound },
    ],
    MANAGER: [
      { to: '/dashboard/notifications', label: t('dashboard.menu_notifications'), icon: Bell, showBadge: true },
      { to: '/dashboard/reservations', label: t('dashboard.menu_reservations'), icon: CalendarCheck },
      { to: '/dashboard/history', label: t('dashboard.menu_history'), icon: Clock },
      { to: '/dashboard/employees', label: t('dashboard.menu_employees'), icon: Users },
      { to: '/dashboard/events', label: t('dashboard.menu_events'), icon: PartyPopper },
    ],
    WORKER: [
      { to: '/dashboard/notifications', label: t('dashboard.menu_notifications'), icon: Bell, showBadge: true },
      { to: '/dashboard/reservations', label: t('dashboard.menu_reservations'), icon: CalendarCheck },
    ],
    GUEST: [],
  };

  return role ? items[role] : [];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function NavBadge({ count }: { count: number }): React.JSX.Element | null {
  if (count <= 0) return null;
  const display = count > 99 ? '99+' : String(count);
  return (
    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
      {display}
    </span>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.JSX.Element {
  const { t } = useTranslation();
  const navItems = useNavItems();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <div className="min-h-screen bg-tertiary-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-primary-400 md:block">
        <div className="px-6 pt-6 pb-8">
          <Link to="/">
            <img src="/rezz_logo_green.webp" alt={t('brand.name')} className="h-8 brightness-0 invert" />
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative mx-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.showBadge && <NavBadge count={unreadCount} />}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-primary-600 bg-primary-400 md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center py-3 text-xs transition-colors ${
                isActive ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="relative">
                <item.icon className="h-6 w-6" />
                {item.showBadge && <NavBadge count={unreadCount} />}
              </span>
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
