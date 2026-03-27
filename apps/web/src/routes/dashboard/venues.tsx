import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useVenues } from '@/hooks/useVenues';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VenueCard } from '@/components/venues/VenueCard';
import { VenueFormModal } from '@/components/venues/VenueFormModal';
import { VenueFormDrawer } from '@/components/venues/VenueFormDrawer';
import { VenueDetailModal } from '@/components/venues/VenueDetailModal';
import { VenueDetailDrawer } from '@/components/venues/VenueDetailDrawer';
import { Button } from '@/components/ui/button';
import type { AdminVenue } from '@/lib/types/venue.types';

export const Route = createFileRoute('/dashboard/venues')({
  component: VenuesDashboardPage,
});

function VenuesDashboardPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<AdminVenue | null>(null);
  const { data: venues, isLoading, isError } = useVenues();
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (user?.role !== 'SUPER_ADMIN') {
    navigate({ to: '/' });
    return <></>;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-400">
          {t('dashboard.menu_venues')}
        </h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="hidden gap-2 bg-primary-400 text-white hover:bg-primary-600 md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {t('venue.add_new')}
        </Button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-tertiary-200"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-red-500">{t('common.error')}</p>
      )}

      {!isLoading && !isError && venues && venues.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 h-24 w-24 rounded-full bg-tertiary-100" />
          <p className="text-tertiary-600">{t('venue.no_venues')}</p>
        </div>
      )}

      {!isLoading && !isError && venues && venues.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onClick={() => setSelectedVenue(venue)}
            />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-400 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Form modal/drawer (create) */}
      {isMobile ? (
        <VenueFormDrawer
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      ) : (
        <VenueFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Detail modal/drawer (view/edit/delete) */}
      {isMobile ? (
        <VenueDetailDrawer
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      ) : (
        <VenueDetailModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
    </DashboardLayout>
  );
}
