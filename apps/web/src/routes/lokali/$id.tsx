/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  Building2,
  ChevronLeft,
  MapPin,
  Phone,
  Navigation,
  Utensils,
  Car,
} from 'lucide-react';
import type { PaymentMethod } from '@rezz/shared';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SocialLinkIcon } from '@/components/public/SocialLinkIcon';
import { WorkingHoursDisplay } from '@/components/public/WorkingHoursDisplay';
import { VenueGallery } from '@/components/public/VenueGallery';
import { GoogleMapEmbed } from '@/components/public/GoogleMapEmbed';
import { BookingForm } from '@/components/public/BookingForm';
import { BookingSuccessView } from '@/components/public/BookingSuccessView';
import { Button } from '@/components/ui/button';
import { usePublicVenue } from '@/hooks/useVenues';
import { useSettingValueLabel } from '@/hooks/useSettings';
import { useAuthStore } from '@/store/auth.store';
import { useLoginStore } from '@/store/login-ui.store';
import type { Reservation } from '@/lib/types/reservation.types';

export const Route = createFileRoute('/lokali/$id')({
  component: VenueDetailPage,
});

const PAYMENT_KEYS: Record<PaymentMethod, string> = {
  CASH: 'venue.payment_cash',
  CARD: 'venue.payment_card',
  MOBILE: 'venue.payment_mobile',
};

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

function VenueDetailPage(): React.JSX.Element {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openLogin = useLoginStore((s) => s.open);
  const venueTypeLabel = useSettingValueLabel('VENUE_TYPE');
  const { data: venue, isLoading, isError } = usePublicVenue(id);
  const [completedReservation, setCompletedReservation] =
    useState<Reservation | null>(null);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="h-64 w-full animate-pulse bg-tertiary-100 md:h-80" />
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-tertiary-100" />
          <div className="h-4 w-full animate-pulse rounded bg-tertiary-100" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-tertiary-100" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !venue) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
          <Building2 className="size-16 text-tertiary-200" />
          <p className="mt-4 text-xl font-medium text-secondary-600">
            {t('venue_detail.not_found')}
          </p>
          <p className="mt-2 text-tertiary-500">
            {t('venue_detail.not_found_subtitle')}
          </p>
          <Button
            className="mt-6 bg-primary-400 text-white hover:bg-primary-600"
            onClick={() => navigate({
              to: '/lokali',
              search: {
                tip: undefined,
                grad: undefined,
                datum: undefined,
                vrijeme: undefined,
              },
            })}
          >
            {t('venue_detail.back')}
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const typeLabel = venueTypeLabel(venue.type);
  const images = venue.images ?? [];
  const socialLinks = venue.socialLinks ?? [];
  const isGuest = isAuthenticated && user?.role === 'GUEST';
  const showCta = !isAuthenticated || isGuest;

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
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-secondary-600 to-secondary-400" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <button
          type="button"
          onClick={() => navigate({
              to: '/lokali',
              search: {
                tip: undefined,
                grad: undefined,
                datum: undefined,
                vrijeme: undefined,
              },
            })}
          className="absolute top-4 left-4 flex items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          {t('venue_detail.back')}
        </button>

        <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-12 md:p-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {venue.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Utensils className="size-3.5" />
              {typeLabel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {venue.city}
            </span>
            <span className="flex items-center gap-1">
              <Navigation className="size-3.5" />
              {venue.address}
            </span>
            <a
              href={`tel:${venue.reservationPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 hover:text-white"
            >
              <Phone className="size-3.5" />
              {venue.reservationPhone}
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 pb-32 md:px-8">
        {/* About */}
        <SectionHeading>{t('venue_detail.about')}</SectionHeading>
        <p className="leading-relaxed text-tertiary-600">
          {venue.description ?? t('venue_detail.no_description')}
        </p>

        {/* Gallery */}
        <SectionHeading>{t('venue_detail.gallery')}</SectionHeading>
        <VenueGallery images={images} venueName={venue.name} />

        {/* Working hours */}
        <SectionHeading>{t('venue_detail.working_hours')}</SectionHeading>
        <WorkingHoursDisplay workingHours={venue.workingHours} />

        {/* Payment + parking */}
        <SectionHeading>{t('venue_detail.payment_methods')}</SectionHeading>
        <div className="flex flex-wrap items-center gap-2">
          {venue.hasParking ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
              <Car className="size-3.5" />
              {t('venue_detail.parking_available')}
            </span>
          ) : (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-400">
              {t('venue_detail.no_parking')}
            </span>
          )}

          {venue.paymentMethods.map((pm) => (
            <span
              key={pm}
              className="rounded-full bg-tertiary-100 px-3 py-1 text-xs text-tertiary-600"
            >
              {t(PAYMENT_KEYS[pm])}
            </span>
          ))}
        </div>

        {/* Location */}
        <SectionHeading>{t('venue_detail.location')}</SectionHeading>
        <GoogleMapEmbed address={venue.address} venueName={venue.name} />
        <div className="mt-3 flex items-center gap-1 text-sm text-tertiary-600">
          <MapPin className="size-4" />
          <span>{venue.address}</span>
        </div>

        {/* Social networks */}
        {socialLinks.length > 0 && (
          <>
            <SectionHeading>
              {t('venue_detail.social_networks')}
            </SectionHeading>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, i) => (
                <SocialLinkIcon
                  key={`${link.url}-${i}`}
                  url={link.url}
                  platform={link.platform}
                />
              ))}
            </div>
          </>
        )}

        {/* Booking */}
        {isGuest && (
          <div
            id="booking"
            className="mt-8 rounded-2xl border border-tertiary-200 bg-white p-6"
          >
            <h2 className="mb-6 text-xl font-bold text-secondary-600">
              {t('booking.title')}
            </h2>
            {completedReservation ? (
              <BookingSuccessView
                reservation={completedReservation}
                venueName={venue.name}
                onNewReservation={() => setCompletedReservation(null)}
              />
            ) : (
              <BookingForm venue={venue} onSuccess={handleBookingSuccess} />
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
                {t('venue_detail.check_availability')}
              </button>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
