import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { UserX, UserCheck, ShieldAlert, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserStatusBadge } from './UserStatusBadge';
import { useSetUserActive, useSetUserBlacklisted } from '@/hooks/useUsersAdmin';
import type { AdminUser } from '@/lib/types/user-admin.types';

const ROLE_STYLES: Record<string, string> = {
  GUEST: 'bg-tertiary-100 text-tertiary-600',
  MANAGER: 'bg-secondary-100 text-secondary-700',
  WORKER: 'bg-blue-50 text-blue-600',
};

type ConfirmAction = 'deactivate' | 'activate' | 'blacklist' | 'unblacklist' | null;

interface UserDetailContentProps {
  user: AdminUser;
  onClose: () => void;
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

export function UserDetailContent({
  user,
  onClose,
}: UserDetailContentProps): React.JSX.Element {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [blacklistReason, setBlacklistReason] = useState('');
  const setActiveMutation = useSetUserActive();
  const setBlacklistedMutation = useSetUserBlacklisted();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-medium ${getAvatarClass(user)}`}
        >
          {getInitials(user)}
        </div>
        <p className="mt-3 text-lg font-medium text-secondary-600">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : t('users.no_name')}
        </p>
        <p className="text-sm text-tertiary-500">{user.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <UserStatusBadge user={user} />
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ROLE_STYLES[user.role] ?? 'bg-tertiary-100 text-tertiary-600'
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-tertiary-500">{t('users.role_label')}</span>
          <span className="text-secondary-600">{user.role}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tertiary-500">{t('users.status_label')}</span>
          <UserStatusBadge user={user} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tertiary-500">{t('users.venue_label')}</span>
          <span className="text-secondary-600">{user.venueId ?? '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-tertiary-500">
            {t('users.registered_label')}
          </span>
          <span className="text-secondary-600">
            {format(parseISO(user.createdAt), 'dd.MM.yyyy')}
          </span>
        </div>
        {user.googleId && (
          <div className="flex justify-between text-sm">
            <span className="text-tertiary-500">
              {t('users.google_account')}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              Google
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-tertiary-500">Email</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              user.isEmailVerified
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {user.isEmailVerified
              ? t('users.email_verified')
              : t('users.email_not_verified')}
          </span>
        </div>
        {user.isBlacklisted && user.blacklistReason && (
          <div className="flex justify-between text-sm">
            <span className="text-tertiary-500">
              {t('users.blacklist_reason_label')}
            </span>
            <span className="text-right text-xs italic text-red-500">
              {user.blacklistReason}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Actions / Confirm */}
      {confirmAction === null && (
        <div className="flex flex-col gap-2">
          {!user.isBlacklisted && (
            <Button
              variant="outline"
              className={`w-full ${
                user.isActive
                  ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                  : 'border-green-300 text-green-600 hover:bg-green-50'
              }`}
              onClick={() =>
                setConfirmAction(user.isActive ? 'deactivate' : 'activate')
              }
            >
              {user.isActive ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  {t('users.deactivate')}
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t('users.activate')}
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            className={`w-full ${
              user.isBlacklisted
                ? 'border-green-300 text-green-600 hover:bg-green-50'
                : 'border-red-300 text-red-500 hover:bg-red-50'
            }`}
            onClick={() =>
              setConfirmAction(user.isBlacklisted ? 'unblacklist' : 'blacklist')
            }
          >
            {user.isBlacklisted ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                {t('users.unblacklist')}
              </>
            ) : (
              <>
                <ShieldAlert className="mr-2 h-4 w-4" />
                {t('users.blacklist')}
              </>
            )}
          </Button>
        </div>
      )}

      {confirmAction === 'blacklist' && (
        <div>
          <textarea
            placeholder={t('users.blacklist_reason_placeholder')}
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-tertiary-200 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <p className="mt-2 text-center text-sm text-secondary-600">
            {t('users.blacklist_confirm')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={setBlacklistedMutation.isPending}
              onClick={() =>
                setBlacklistedMutation.mutate(
                  {
                    id: user.id,
                    isBlacklisted: true,
                    reason: blacklistReason || undefined,
                  },
                  { onSuccess: onClose },
                )
              }
            >
              {setBlacklistedMutation.isPending
                ? t('common.loading')
                : t('users.confirm_yes')}
            </Button>
          </div>
        </div>
      )}

      {confirmAction === 'unblacklist' && (
        <div>
          <p className="text-center text-sm text-secondary-600">
            {t('users.unblacklist_confirm')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={setBlacklistedMutation.isPending}
              onClick={() =>
                setBlacklistedMutation.mutate(
                  { id: user.id, isBlacklisted: false },
                  { onSuccess: onClose },
                )
              }
            >
              {setBlacklistedMutation.isPending
                ? t('common.loading')
                : t('users.confirm_yes')}
            </Button>
          </div>
        </div>
      )}

      {confirmAction === 'deactivate' && (
        <div>
          <p className="text-center text-sm text-secondary-600">
            {t('users.deactivate_confirm')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-amber-500 text-white hover:bg-amber-600"
              disabled={setActiveMutation.isPending}
              onClick={() =>
                setActiveMutation.mutate(
                  { id: user.id, isActive: false },
                  { onSuccess: onClose },
                )
              }
            >
              {setActiveMutation.isPending
                ? t('common.loading')
                : t('users.confirm_yes')}
            </Button>
          </div>
        </div>
      )}

      {confirmAction === 'activate' && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setConfirmAction(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={setActiveMutation.isPending}
            onClick={() =>
              setActiveMutation.mutate(
                { id: user.id, isActive: true },
                { onSuccess: onClose },
              )
            }
          >
            {setActiveMutation.isPending
              ? t('common.loading')
              : t('users.confirm_yes')}
          </Button>
        </div>
      )}
    </div>
  );
}
