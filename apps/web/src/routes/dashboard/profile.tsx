/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EditProfileDrawer } from '@/components/profile/EditProfileDrawer';
import { VenueProfileSection } from '@/components/venues/VenueProfileSection';
import { useMyProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
});

function ProfilePage(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useMyProfile();
  const role = useAuthStore((s) => s.user?.role);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initials = (
    (profile?.firstName?.[0] ?? '') + (profile?.lastName?.[0] ?? '')
  ).toUpperCase();

  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-secondary-600">
          {t('dashboard.menu_profile')}
        </h1>

        {isLoading && (
          <div className="h-40 animate-pulse rounded-2xl bg-tertiary-100" />
        )}

        {!isLoading && profile && (
          <div className="overflow-hidden rounded-2xl border border-tertiary-200 bg-white">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-400 text-xl font-medium text-white">
                {initials || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-medium text-secondary-600">
                  {fullName || profile.email}
                </p>
                <p className="truncate text-sm text-tertiary-500">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="border-t border-tertiary-100 px-5 py-4">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-tertiary-400" />
                  <dt className="text-tertiary-500">
                    {t('profile.email_label')}
                  </dt>
                  <dd className="ml-auto text-secondary-600">{profile.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-tertiary-400" />
                  <dt className="text-tertiary-500">
                    {t('profile.phone_label')}
                  </dt>
                  <dd className="ml-auto text-secondary-600">
                    {profile.phone || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex w-full items-center justify-center gap-2 border-t border-tertiary-100 p-3 transition-colors hover:bg-tertiary-50"
            >
              <Pencil className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">
                {t('profile.edit_profile')}
              </span>
            </button>
          </div>
        )}

        {role === 'MANAGER' && <VenueProfileSection />}
      </div>

      {profile && (
        <EditProfileDrawer
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={{
            firstName: profile.firstName ?? null,
            lastName: profile.lastName ?? null,
            phone: profile.phone ?? null,
          }}
        />
      )}
    </DashboardLayout>
  );
}
