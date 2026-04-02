import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, PartyPopper } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCard';
import { EventFormDrawer } from '@/components/events/EventFormDrawer';
import { EventFormModal } from '@/components/events/EventFormModal';
import { EventDetailDrawer } from '@/components/events/EventDetailDrawer';
import { EventDetailModal } from '@/components/events/EventDetailModal';
import { useEvents } from '@/hooks/useEvents';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { VenueEvent } from '@/lib/types/event.types';

export const Route = createFileRoute('/dashboard/events')({
  component: EventsPage,
});

function EventsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<VenueEvent | null>(null);
  const [editEvent, setEditEvent] = useState<VenueEvent | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { data: events, isLoading } = useEvents();

  const now = useMemo(() => new Date(), []);
  const upcoming = useMemo(
    () => events?.filter((e) => new Date(e.startsAt) >= now) ?? [],
    [events, now],
  );
  const past = useMemo(
    () => events?.filter((e) => new Date(e.startsAt) < now) ?? [],
    [events, now],
  );

  const displayedEvents = activeTab === 'upcoming' ? upcoming : past;
  const emptyMessage =
    activeTab === 'upcoming'
      ? t('events.no_upcoming')
      : t('events.no_past');

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-400">
          {t('events.title')}
        </h1>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="hidden gap-2 bg-primary-400 text-white hover:bg-primary-600 md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {t('events.add')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-primary-400 text-white'
              : 'border border-tertiary-200 bg-white text-tertiary-600'
          }`}
        >
          {t('events.tab_upcoming')}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-primary-400 text-white'
              : 'border border-tertiary-200 bg-white text-tertiary-600'
          }`}
        >
          {t('events.tab_past')}
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl bg-tertiary-200"
              />
            ))}
          </div>
        )}

        {!isLoading && displayedEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PartyPopper className="h-12 w-12 text-tertiary-300" />
            <p className="mt-3 text-tertiary-500">{emptyMessage}</p>
          </div>
        )}

        {!isLoading && displayedEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={(e) => setSelectedEvent(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsCreateOpen(true)}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-400 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Create modal/drawer */}
      {isMobile ? (
        <EventFormDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : (
        <EventFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Edit modal/drawer */}
      {isMobile ? (
        <EventFormDrawer
          isOpen={editEvent !== null}
          onClose={() => setEditEvent(null)}
          initialData={editEvent ?? undefined}
        />
      ) : (
        <EventFormModal
          isOpen={editEvent !== null}
          onClose={() => setEditEvent(null)}
          initialData={editEvent ?? undefined}
        />
      )}

      {/* Detail modal/drawer */}
      {isMobile ? (
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(e) => {
            setSelectedEvent(null);
            setEditEvent(e);
          }}
        />
      ) : (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(e) => {
            setSelectedEvent(null);
            setEditEvent(e);
          }}
        />
      )}
    </DashboardLayout>
  );
}
