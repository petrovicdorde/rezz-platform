import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SearchFilterWidget } from "@/components/public/SearchFilterWidget";
import { VenueSlider } from "@/components/public/VenueSlider";
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
      {/* Hero section */}
      <section className="relative -mt-16 flex h-[100svh] min-h-[640px] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-12 sm:px-6 sm:pt-28 sm:pb-16">
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
          className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(20,11,0,0.35)_0%,rgba(20,11,0,0.05)_25%,rgba(20,11,0,0.4)_60%,rgba(20,11,0,1)_100%)]"
        />
        {/* Orange radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(249,133,19,0.22)_0%,transparent_65%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(249,133,19,0.08)_0%,transparent_60%)]"
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-3xl flex-col items-center">
          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-400/10 px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-secondary-400 backdrop-blur-sm sm:mb-7"
            style={{ animation: 'hero-fade-up 0.55s 0.1s both' }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-secondary-400 shadow-[0_0_6px_rgba(249,133,19,0.6)]"
              style={{ animation: 'hero-blink 2.5s ease-in-out infinite' }}
            />
            {t('home.hero_badge')}
          </div>

          {/* Title */}
          <h1
            className="text-center font-serif text-[clamp(3rem,6vw,5.8rem)] leading-[1] font-black tracking-[-0.025em] text-tertiary-50 [text-shadow:0_2px_40px_rgba(20,11,0,0.4)]"
            style={{ animation: 'hero-fade-up 0.65s 0.2s both' }}
          >
            {t('home.hero_title_line1')}
            <br />
            {t('home.hero_title_line2')}
            <br />
            <em className="italic font-black text-secondary-400">
              {t('home.hero_title_line3')}
            </em>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-5 mb-10 max-w-md text-center text-[1.02rem] leading-[1.8] font-light text-white/55 sm:mb-12"
            style={{ animation: 'hero-fade-up 0.65s 0.32s both' }}
          >
            {t('home.hero_subtitle')}
          </p>

          {/* Search card */}
          <div
            className="w-full"
            style={{ animation: 'hero-fade-up 0.7s 0.42s both' }}
          >
            <SearchFilterWidget onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured venues */}
      {showVenues && (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto w-full max-w-384">
            <h2 className="text-center text-3xl font-bold text-secondary-600">
              {t("home.featured_venues_title")}
            </h2>
            <p className="mt-2 text-center text-tertiary-500">
              {t("home.featured_venues_subtitle")}
            </p>

            <div className="mt-10">
              {isLoading && (
                <div className="flex gap-4 overflow-hidden pl-4 md:pl-0">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-3/4 min-w-55 animate-pulse rounded-2xl bg-tertiary-200 md:min-w-65"
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
          </div>
        </section>
      )}

      {/* Featured events */}
      {showEvents && (isLoading || featuredEvents.length > 0) && (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto w-full max-w-384">
            <h2 className="text-center text-3xl font-bold text-secondary-600">
              {t("home.featured_events_title")}
            </h2>
            <p className="mt-2 text-center text-tertiary-500">
              {t("home.featured_events_subtitle")}
            </p>

            <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading &&
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-3/4 animate-pulse rounded-2xl bg-tertiary-200"
                  />
                ))}

              {!isLoading &&
                featuredEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => navigate({ to: `/dogadjaji/${event.id}` })}
                    className="group relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-b from-secondary-400 to-secondary-700 text-left"
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative p-4 text-white">
                      <h3 className="text-lg font-bold">{event.name}</h3>
                      <p className="text-sm text-white/80">
                        {new Date(event.startsAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
