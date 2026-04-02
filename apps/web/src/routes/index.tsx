import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SearchFilterWidget } from '@/components/public/SearchFilterWidget';
import { VenueSlider } from '@/components/public/VenueSlider';
import { landingApi, type SearchFilters } from '@/lib/api/landing.api';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: venues, isLoading } = useQuery({
    queryKey: ['public-venues'],
    queryFn: landingApi.getFeaturedVenues,
  });

  function handleSearch(filters: SearchFilters): void {
    const params: Record<string, string> = {};
    if (filters.type) params.tip = filters.type;
    if (filters.city) params.grad = filters.city;
    if (filters.date) params.datum = filters.date;
    if (filters.time) params.vrijeme = filters.time;
    navigate({ to: '/pretraga', search: params });
  }

  return (
    <PublicLayout>
      {/* Hero section */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-secondary-600 px-4 pt-20 pb-32">
        <h1 className="text-center text-4xl font-bold text-white md:text-6xl">
          {t('home.hero_title')}
        </h1>
        <p className="mt-4 max-w-md text-center text-lg text-white/70">
          {t('home.hero_subtitle')}
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
            <path
              d="M0 80V40C360 0 1080 0 1440 40V80H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Featured venues */}
      <section className="bg-white px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-secondary-600">
          {t('home.featured_venues_title')}
        </h2>
        <p className="mt-2 text-center text-tertiary-500">
          {t('home.featured_venues_subtitle')}
        </p>

        <div className="mt-10">
          {isLoading && (
            <div className="flex gap-4 overflow-hidden pl-4 md:pl-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] min-w-[220px] animate-pulse rounded-2xl bg-tertiary-200 md:min-w-[260px]"
                />
              ))}
            </div>
          )}

          {!isLoading && venues && venues.length > 0 && (
            <VenueSlider venues={venues} />
          )}

          {!isLoading && (!venues || venues.length === 0) && (
            <p className="text-center text-tertiary-500">
              {t('home.no_featured_venues')}
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
