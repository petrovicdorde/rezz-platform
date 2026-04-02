import { useState, useEffect, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Users, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SwiperFilterChips } from '@/components/ui/SwiperFilterChips';
import { UserCard } from '@/components/users/UserCard';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { UserDetailDrawer } from '@/components/users/UserDetailDrawer';
import { useAdminUsers } from '@/hooks/useUsersAdmin';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { AdminUser } from '@/lib/types/user-admin.types';
import type { UsersAdminFilters } from '@/lib/api/users-admin.api';

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
});

const FILTER_MAP: Record<string, Partial<UsersAdminFilters>> = {
  all: {},
  guests: { role: 'GUEST' },
  managers: { role: 'MANAGER' },
  workers: { role: 'WORKER' },
  blacklisted: { isBlacklisted: true },
  inactive: { isActive: false },
};

function UsersPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: UsersAdminFilters = useMemo(
    () => ({
      ...FILTER_MAP[activeFilter],
      search: debouncedSearch || undefined,
    }),
    [activeFilter, debouncedSearch],
  );

  const { data: users, isLoading } = useAdminUsers(filters);

  const filterChips = [
    { key: 'all', label: t('users.filter_all') },
    { key: 'guests', label: t('users.filter_guests') },
    { key: 'managers', label: t('users.filter_managers') },
    { key: 'workers', label: t('users.filter_workers') },
    { key: 'blacklisted', label: t('users.filter_blacklisted') },
    { key: 'inactive', label: t('users.filter_inactive') },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-secondary-600">
        {t('users.title')}
      </h1>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-400" />
        <input
          type="text"
          placeholder={t('users.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-tertiary-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Filters */}
      <div className="mt-3">
        <SwiperFilterChips
          chips={filterChips}
          activeKey={activeFilter}
          onChange={(key) => setActiveFilter(key)}
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-tertiary-200"
              />
            ))}
          </div>
        )}

        {!isLoading && (!users || users.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-tertiary-300" />
            <p className="mt-2 text-tertiary-500">{t('users.no_users')}</p>
          </div>
        )}

        {!isLoading && users && users.length > 0 && (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={(u) => setSelectedUser(u)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal/drawer */}
      {isMobile ? (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      ) : (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </DashboardLayout>
  );
}
