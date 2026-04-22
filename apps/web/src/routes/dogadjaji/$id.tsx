/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  MapPin,
  PartyPopper,
  Building2,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BookingForm } from '@/components/public/BookingForm';
import { BookingSuccessView } from '@/components/public/BookingSuccessView';
import { Button } from '@/components/ui/button';
import { usePublicEvent } from '@/hooks/useEvents';
import { usePublicVenue } from '@/hooks/useVenues';
import { useAuthStore } from '@/store/auth.store';
import { useLoginStore } from '@/store/login-ui.store';
import type { Reservation } from '@/lib/types/reservation.types';

export const Route = createFileRoute('/dogadjaji/$id')({
  component: EventDetailPage,
});

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <h2 className="mt-8 mb-4 border-b border-tertiary-200 pb-2 text-lg font-bold text-secondary-600 first:mt-0">
      {children}
    </h2>
  );
}

function EventDetailPage(): React.JSX.Element {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const openLogin = useLoginStore((s) => s.open);
  const { data, isLoading, isError } = usePublicEvent(id);
  const { data: fullVenue } = usePublicVenue(data?.venue.id ?? '');
  const [completedReservation, setCompletedReservation] =
    useState<Reservation | null>(null);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="h-64 w-full animate-pulse bg-tertiary-100 md:h-80" />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-tertiary-100" />
          <div className="h-4 w-full animate-pulse rounded bg-tertiary-100" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
          <PartyPopper className="size-16 text-tertiary-200" />
          <p className="mt-4 text-xl font-medium text-secondary-600">
            {t('event_detail.not_found')}
          </p>
          <Button
            className="mt-6 bg-primary-400 text-white hover:bg-primary-600"
            onClick={() => navigate({ to: '/' })}
          >
            {t('common.back')}
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const { event, venue } = data;
  const startDate = parseISO(event.startsAt);
  const endDate = event.endsAt ? parseISO(event.endsAt) : null;
  const isGuest = isAuthenticated && user?.role === 'GUEST';
  const showCta = !isAuthenticated || isGuest;
  const lockedDate = format(startDate, 'yyyy-MM-dd');

  function scrollToBooking(): void {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function handleBookingSuccess(reservation: Reservation): void {
    setCompletedReservation(reservation);
    toast.success(t('booking.success_title'));
    scrollToBooking();
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative h-64 w-full md:h-80">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-secondary-600 to-secondary-400" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="absolute top-4 left-4 flex items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          {t('common.back')}
        </button>

        <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-12 md:p-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {event.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {format(startDate, 'dd.MM.yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {format(startDate, 'HH:mm')}
              {endDate && ` – ${format(endDate, 'HH:mm')}`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {venue.name}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 pb-32 md:px-8">
        {/* About the event */}
        <SectionHeading>{t('event_detail.about')}</SectionHeading>
        <p className="leading-relaxed text-tertiary-600">
          {event.description || t('event_detail.no_description')}
        </p>

        {/* Promotions */}
        {event.promotions && event.promotions.length > 0 && (
          <>
            <SectionHeading>{t('event_detail.promotions')}</SectionHeading>
            <div className="flex flex-col gap-2">
              {event.promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-xl border border-tertiary-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <PartyPopper className="size-4 text-secondary-400" />
                    <span className="font-medium text-secondary-600">
                      {promo.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    {promo.price} KM
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Venue info */}
        <SectionHeading>{t('event_detail.venue_section')}</SectionHeading>
        <div className="rounded-xl border border-tertiary-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 size-5 text-tertiary-400" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-secondary-600">{venue.name}</p>
              <p className="text-sm text-tertiary-500">
                {venue.city} · {venue.address}
              </p>
            </div>
            <Link
              to="/lokali/$id"
              params={{ id: venue.id }}
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              {t('event_detail.view_venue')}
            </Link>
          </div>
        </div>

        {/* Booking */}
        {isGuest && fullVenue && (
          <div
            id="booking"
            className="mt-8 rounded-2xl border border-tertiary-200 bg-white p-6"
          >
            <h2 className="mb-2 text-xl font-bold text-secondary-600">
              {t('event_detail.book_for_event')}
            </h2>
            <p className="mb-6 text-sm text-tertiary-500">
              {t('event_detail.book_for_event_hint', { name: event.name })}
            </p>
            {completedReservation ? (
              <BookingSuccessView
                reservation={completedReservation}
                venueName={venue.name}
                onNewReservation={() => setCompletedReservation(null)}
              />
            ) : (
              <BookingForm
                venue={fullVenue}
                eventId={event.id}
                lockedDate={lockedDate}
                onSuccess={handleBookingSuccess}
              />
            )}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {showCta && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-tertiary-200 bg-white px-4 py-4 shadow-lg md:px-8">
          <div className="mx-auto max-w-3xl">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={openLogin}
                className="w-full rounded-xl bg-primary-400 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600"
              >
                {t('venue_detail.login_to_reserve')}
              </button>
            )}
            {isGuest && (
              <button
                type="button"
                onClick={scrollToBooking}
                className="w-full rounded-xl bg-primary-400 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600"
              >
                {t('event_detail.reserve_for_event')}
              </button>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
