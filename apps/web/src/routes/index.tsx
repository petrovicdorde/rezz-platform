import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SearchFilterWidget } from "@/components/public/SearchFilterWidget";
import { VenueSlider } from "@/components/public/VenueSlider";
import { EventSlider } from "@/components/public/EventSlider";
import { useLandingData } from "@/hooks/useLanding";
import type { SearchFilters } from "@/lib/api/landing.api";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// eslint-disable-next-line react-refresh/only-export-components
function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: landingData, isLoading } = useLandingData();

  const featuredVenues = landingData?.featuredVenues ?? [];
  const showVenues = landingData?.config.showFeaturedVenues ?? true;
  const featuredEvents = landingData?.featuredEvents ?? [];
  const showEvents = landingData?.config.showFeaturedEvents ?? false;

  function handleSearch(filters: SearchFilters): void {
    navigate({
      to: "/lokali",
      search: {
        tip: filters.type,
        grad: filters.city,
        datum: filters.date,
        vrijeme: filters.time,
      },
    });
  }

  return (
    <PublicLayout>
      {/* Hero section — `h-svh` is the small-viewport unit: it's spec'd to be
          static (doesn't change when the mobile address bar collapses), so the
          background image never resizes mid-scroll. */}
      <section className="relative -mt-17 flex h-svh flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-12 sm:px-6 sm:pt-28 sm:pb-16">
        {/* Background image */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 scale-[1.04] bg-cover bg-center bg-no-repeat opacity-75"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1800&q=90&auto=format&fit=crop')",
          }}
        />
        {/* Dark gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 z-1 bg-[linear-gradient(to_bottom,rgba(20,11,0,0.35)_0%,rgba(20,11,0,0.05)_25%,rgba(20,11,0,0.4)_60%,rgba(20,11,0,1)_100%)]"
        />
        {/* Orange radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(249,133,19,0.22)_0%,transparent_65%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(249,133,19,0.08)_0%,transparent_60%)]"
        />

        <div className="relative z-2 mx-auto flex w-full max-w-3xl flex-col items-center">
          {/* Title */}
          <h1
            className="mb-10 text-center font-serif text-[clamp(3rem,6vw,5.8rem)] leading-none font-black tracking-[-0.025em] text-tertiary-50 [text-shadow:0_2px_40px_rgba(20,11,0,0.4)] sm:mb-12"
            style={{ animation: "hero-fade-up 0.65s 0.2s both" }}
          >
            {t("home.hero_title_line1")}
            <br />
            {t("home.hero_title_line2")}
            <br />
            <em className="italic font-black text-secondary-400">
              {t("home.hero_title_line3")}
            </em>
          </h1>

          {/* Search card */}
          <div
            className="w-full"
            style={{ animation: "hero-fade-up 0.7s 0.42s both" }}
          >
            <SearchFilterWidget onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured venues */}
      {showVenues && (
        <section className="bg-tertiary-50 px-[5%] py-22">
          <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
            {/* Section head */}
            <div className="mb-9">
              <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[3px] text-secondary-400">
                {t("home.featured_venues_label")}
              </div>
              <h2 className="font-serif text-[clamp(1.9rem,3vw,2.5rem)] font-bold leading-none tracking-[-1px] text-[#140B00]">
                {t("home.featured_venues_title")}
              </h2>
            </div>

            {/* Cards */}
            {isLoading && (
              <div className="-mx-[5%] flex gap-3.5 overflow-hidden px-[5%]">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 w-[78vw] max-w-[320px] shrink-0 animate-pulse rounded-[22px] bg-tertiary-200 md:w-[44%] lg:w-[31%] xl:w-[23.5%]"
                  />
                ))}
              </div>
            )}

            {!isLoading && featuredVenues.length > 0 && (
              <VenueSlider venues={featuredVenues} />
            )}

            {!isLoading && featuredVenues.length === 0 && (
              <p className="text-center text-tertiary-500">
                {t("home.no_featured_venues")}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Featured events — dark section, matches the mockup's events look */}
      {showEvents && (isLoading || featuredEvents.length > 0) && (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#160D00_0%,#1A0E00_100%)] px-[5%] py-22">
          {/* Orange radial glow (top-right) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-125 w-175 bg-[radial-gradient(ellipse,rgba(249,133,19,0.08)_0%,transparent_65%)]"
          />

          <div className="relative mx-auto w-full max-w-(--breakpoint-2xl)">
            {/* Section head */}
            <div className="mb-9">
              <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[3px] text-secondary-400">
                {t("home.featured_events_label")}
              </div>
              <h2 className="font-serif text-[clamp(1.9rem,3vw,2.5rem)] font-bold leading-none tracking-[-1px] text-white">
                {t("home.featured_events_title")}
              </h2>
            </div>

            {/* Cards */}
            {isLoading && (
              <div className="-mx-[5%] flex gap-3.5 overflow-hidden px-[5%]">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 w-[78vw] max-w-[320px] shrink-0 animate-pulse rounded-[22px] bg-white/5 md:w-[44%] lg:w-[31%] xl:w-[23.5%]"
                  />
                ))}
              </div>
            )}

            {!isLoading && featuredEvents.length > 0 && (
              <EventSlider events={featuredEvents} />
            )}

            {!isLoading && featuredEvents.length === 0 && (
              <p className="text-center text-white/40">
                {t("home.no_featured_events")}
              </p>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
