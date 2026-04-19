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
      <section className="relative flex min-h-dvh flex-col items-center justify-center bg-secondary-600 px-4 pt-20 pb-32">
        <h1 className="text-center text-4xl font-bold text-white md:text-6xl">
          {t("home.hero_title")}
        </h1>
        <p className="mt-4 max-w-md text-center text-lg text-white/70">
          {t("home.hero_subtitle")}
        </p>

        <div className="mt-12 w-full">
          <SearchFilterWidget onSearch={handleSearch} />
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block w-full"
            preserveAspectRatio="none"
          >
            <path d="M0 80V40C360 0 1080 0 1440 40V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Featured venues */}
      {showVenues && (
        <section className="bg-white px-4 py-16">
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
        </section>
      )}

      {/* Featured events */}
      {showEvents && (
        <section className="bg-white px-4 py-16">
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
                  onClick={() => navigate({ to: `/lokali/${event.venueId}` })}
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

            {!isLoading && featuredEvents.length === 0 && (
              <p className="col-span-full text-center text-tertiary-500">
                {t("home.no_featured_events")}
              </p>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
