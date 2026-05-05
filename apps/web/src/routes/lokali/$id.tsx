/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Building2,
  ChevronLeft,
  MapPin,
  Phone,
  Navigation,
  Utensils,
  Car,
} from "lucide-react";
import type { PaymentMethod } from "@rezz/shared";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SocialLinkIcon } from "@/components/public/SocialLinkIcon";
import { WorkingHoursDisplay } from "@/components/public/WorkingHoursDisplay";
import { VenueGallery } from "@/components/public/VenueGallery";
import { GoogleMapEmbed } from "@/components/public/GoogleMapEmbed";
import { BookingForm } from "@/components/public/BookingForm";
import { BookingSuccessView } from "@/components/public/BookingSuccessView";
import { BlacklistedBanner } from "@/components/profile/BlacklistedBanner";
import { Button } from "@/components/ui/button";
import { VENUE_PLACEHOLDER_IMG } from "@/components/venues/VenueCard";
import { usePublicVenue } from "@/hooks/useVenues";
import { useSettingValueLabel } from "@/hooks/useSettings";
import { useAuthStore, isUserCurrentlyBlocked } from "@/store/auth.store";
import { useLoginStore } from "@/store/login-ui.store";
import type { Reservation } from "@/lib/types/reservation.types";

export const Route = createFileRoute("/lokali/$id")({
  component: VenueDetailPage,
});

const PAYMENT_KEYS: Record<PaymentMethod, string> = {
  CASH: "venue.payment_cash",
  CARD: "venue.payment_card",
  MOBILE: "venue.payment_mobile",
};

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <h2 className="mt-8 mb-4 border-b border-tertiary-200 pb-2 text-lg font-bold text-secondary-500 first:mt-0">
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
  const venueTypeLabel = useSettingValueLabel("VENUE_TYPE");
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
          <p className="mt-4 text-xl font-medium text-secondary-500">
            {t("venue_detail.not_found")}
          </p>
          <p className="mt-2 text-tertiary-500">
            {t("venue_detail.not_found_subtitle")}
          </p>
          <Button
            className="mt-6 bg-primary-400 text-white hover:bg-primary-600"
            onClick={() =>
              navigate({
                to: "/lokali",
                search: {
                  tip: undefined,
                  grad: undefined,
                  datum: undefined,
                  vrijeme: undefined,
                },
              })
            }
          >
            {t("venue_detail.back")}
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const typeLabel = venueTypeLabel(venue.type);
  const images = venue.images ?? [];
  const socialLinks = venue.socialLinks ?? [];
  const isGuest = isAuthenticated && user?.role === "GUEST";
  const showCta = !isAuthenticated || isGuest;

  function scrollToBooking(): void {
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function handleBookingSuccess(reservation: Reservation): void {
    setCompletedReservation(reservation);
    toast.success(t("booking.success_title"));
    scrollToBooking();
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative -mt-17 h-72 w-full overflow-hidden md:h-96">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${venue.imageUrl ?? VENUE_PLACEHOLDER_IMG}')`,
          }}
        />
        {/* Dark gradient overlay — matches the home hero language */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,11,0,0.45)_0%,rgba(20,11,0,0.1)_30%,rgba(20,11,0,0.55)_70%,rgba(20,11,0,0.95)_100%)]"
        />

        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/lokali",
              search: {
                tip: undefined,
                grad: undefined,
                datum: undefined,
                vrijeme: undefined,
              },
            })
          }
          className="absolute top-22 left-4 inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/45 hover:text-white md:top-23 md:left-[5%]"
        >
          <ChevronLeft className="size-3.5" />
          {t("venue_detail.back")}
        </button>

        <div className="absolute right-0 bottom-0 left-0 px-4 pb-6 md:px-[5%] md:pb-8">
          <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
            <h1 className="font-serif text-[clamp(1.9rem,4vw,3.4rem)] leading-none font-black tracking-[-0.5px] text-white [text-shadow:0_2px_24px_rgba(20,11,0,0.5)]">
              {venue.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.82rem] text-white/65">
              <span className="flex items-center gap-1.5">
                <Utensils className="size-3.5" />
                {typeLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {venue.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Navigation className="size-3.5" />
                {venue.address}
              </span>
              <a
                href={`tel:${venue.reservationPhone.replace(/\s+/g, "")}`}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Phone className="size-3.5" />
                {venue.reservationPhone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 pb-12 md:px-8">
        {/* About */}
        <SectionHeading>{t("venue_detail.about")}</SectionHeading>
        <p className="leading-relaxed text-tertiary-600">
          {venue.description ?? t("venue_detail.no_description")}
        </p>

        {/* Gallery */}
        <SectionHeading>{t("venue_detail.gallery")}</SectionHeading>
        <VenueGallery images={images} venueName={venue.name} />

        {/* Working hours */}
        <SectionHeading>{t("venue_detail.working_hours")}</SectionHeading>
        <WorkingHoursDisplay workingHours={venue.workingHours} />

        {/* Payment + parking */}
        <SectionHeading>{t("venue_detail.payment_methods")}</SectionHeading>
        <div className="flex flex-wrap items-center gap-2">
          {venue.hasParking ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
              <Car className="size-3.5" />
              {t("venue_detail.parking_available")}
            </span>
          ) : (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-400">
              {t("venue_detail.no_parking")}
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
        <SectionHeading>{t("venue_detail.location")}</SectionHeading>
        <GoogleMapEmbed address={venue.address} venueName={venue.name} />
        <div className="mt-3 flex items-center gap-1 text-sm text-tertiary-600">
          <MapPin className="size-4" />
          <span>{venue.address}</span>
        </div>

        {/* Reserve CTA — sticky to viewport bottom while its natural position
            below Location is below the fold; once the user scrolls past, it
            sits inline as a normal element. Returns to sticky on scroll-up. */}
        {showCta && (
          <div className="sticky bottom-2 z-30 mt-8">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={openLogin}
                className="group relative w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
                />
                <span className="relative">
                  {t("venue_detail.login_to_reserve")}
                </span>
              </button>
            )}
            {isGuest && (
              <button
                type="button"
                onClick={scrollToBooking}
                className="group relative w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
                />
                <span className="relative">
                  {t("venue_detail.check_availability")}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Social networks */}
        {socialLinks.length > 0 && (
          <>
            <SectionHeading>{t("venue_detail.social_networks")}</SectionHeading>
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
            <h2 className="mb-6 text-xl font-bold text-secondary-500">
              {t("booking.title")}
            </h2>
            {isUserCurrentlyBlocked(user) ? (
              <BlacklistedBanner reason={user?.blacklistReason ?? null} />
            ) : completedReservation ? (
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
    </PublicLayout>
  );
}
