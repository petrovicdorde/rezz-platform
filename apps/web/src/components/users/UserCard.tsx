import { useTranslation } from 'react-i18next';
import { UserStatusBadge } from './UserStatusBadge';
import type { AdminUser } from '@/lib/types/user-admin.types';

const ROLE_STYLES: Record<string, string> = {
  GUEST: 'bg-tertiary-100 text-tertiary-600',
  MANAGER: 'bg-secondary-100 text-secondary-700',
  WORKER: 'bg-blue-50 text-blue-600',
};

interface UserCardProps {
  user: AdminUser;
  onClick: (user: AdminUser) => void;
}

function getInitials(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return user.firstName[0] + user.lastName[0];
  }
  return user.email[0].toUpperCase();
}

function getAvatarClass(user: AdminUser): string {
  if (user.isBlacklisted) return 'bg-red-100 text-red-600';
  if (!user.isActive) return 'bg-gray-100 text-gray-400';
  return 'bg-secondary-100 text-secondary-600';
}

export function UserCard({ user, onClick }: UserCardProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => onClick(user)}
      className={`flex cursor-pointer items-center justify-between rounded-xl border border-tertiary-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        user.isBlacklisted ? 'border-l-4 border-l-red-400' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${getAvatarClass(user)}`}
        >
          {getInitials(user)}
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-600">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : t('users.no_name')}
          </p>
          <p className="text-xs text-tertiary-500">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            ROLE_STYLES[user.role] ?? 'bg-tertiary-100 text-tertiary-600'
          }`}
        >
          {user.role}
        </span>
        <UserStatusBadge user={user} />
      </div>
    </div>
  );
}
