import { useTranslation } from 'react-i18next';
import type { AdminUser } from '@/lib/types/user-admin.types';

interface UserStatusBadgeProps {
  user: AdminUser;
}

export function UserStatusBadge({
  user,
}: UserStatusBadgeProps): React.JSX.Element {
  const { t } = useTranslation();

  if (user.isBlacklisted) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        {t('users.status_blacklisted')}
      </span>
    );
  }

  if (!user.isActive) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        {t('users.status_inactive')}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {t('users.status_active')}
    </span>
  );
}
