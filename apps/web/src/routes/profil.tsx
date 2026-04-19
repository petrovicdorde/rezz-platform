/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CalendarX, Pencil } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { EditProfileDrawer } from '@/components/profile/EditProfileDrawer';
import { ProfileReservationCard } from '@/components/profile/ProfileReservationCard';
import { useMyProfile, useMyReservations } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';

export const Route = createFileRoute('/profil')({
  component: ProfilPage,
});

type TabKey = 'upcoming' | 'history';

function ProfilPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
      return;
    }
    if (isAuthenticated && user?.role !== 'GUEST') {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, user, navigate]);

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: reservations, isLoading: resLoading } = useMyReservations();
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initials = (
    (profile?.firstName?.[0] ?? '') + (profile?.lastName?.[0] ?? '')
  ).toUpperCase();

  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Profile card */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-tertiary-200 bg-white">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-400 text-lg font-medium text-white">
              {profileLoading ? '' : initials || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-secondary-600">
                {fullName || (profileLoading ? '...' : '')}
              </p>
              <p className="truncate text-sm text-tertiary-500">
                {profile?.email ?? ''}
              </p>
              {profile?.phone && (
                <p className="truncate text-sm text-tertiary-500">
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-tertiary-100 p-3 transition-colors hover:bg-tertiary-50"
          >
            <Pencil className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">
              {t('profile.edit_profile')}
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex overflow-hidden rounded-xl border border-tertiary-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 cursor-pointer py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-primary-400 text-white'
                : 'text-tertiary-500 hover:bg-tertiary-50'
            }`}
          >
            {t('profile.tab_upcoming')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 cursor-pointer py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary-400 text-white'
                : 'text-tertiary-500 hover:bg-tertiary-50'
            }`}
          >
            {t('profile.tab_history')}
          </button>
        </div>

        {/* Reservations */}
        {resLoading ? (
          <div className="flex flex-col gap-3">
            <div className="h-28 animate-pulse rounded-2xl bg-tertiary-100" />
            <div className="h-28 animate-pulse rounded-2xl bg-tertiary-100" />
          </div>
        ) : activeTab === 'upcoming' ? (
          reservations?.upcoming.length === 0 ? (
            <div className="mt-6 flex flex-col items-center">
              <CalendarX className="mx-auto size-10 text-tertiary-300" />
              <p className="mt-2 text-center text-sm text-tertiary-500">
                {t('profile.no_upcoming')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reservations?.upcoming.map((res) => (
                <ProfileReservationCard
                  key={res.id}
                  reservation={res}
                  showCancelButton={true}
                />
              ))}
            </div>
          )
        ) : reservations?.history.length === 0 ? (
          <div className="mt-6 flex flex-col items-center">
            <CalendarX className="mx-auto size-10 text-tertiary-300" />
            <p className="mt-2 text-center text-sm text-tertiary-500">
              {t('profile.no_history')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reservations?.history.map((res) => (
              <ProfileReservationCard
                key={res.id}
                reservation={res}
                showCancelButton={false}
              />
            ))}
          </div>
        )}
      </div>

      <EditProfileDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={{
          firstName: profile?.firstName ?? null,
          lastName: profile?.lastName ?? null,
          phone: profile?.phone ?? null,
        }}
      />
    </PublicLayout>
  );
}
