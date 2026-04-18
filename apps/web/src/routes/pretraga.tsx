/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SearchFilterWidget } from "@/components/public/SearchFilterWidget";
import { SearchVenueCard } from "@/components/public/SearchVenueCard";
import { landingApi, type SearchFilters } from "@/lib/api/landing.api";

export const Route = createFileRoute("/pretraga")({
  validateSearch: (search: Record<string, unknown>) => ({
    tip: (search.tip as string) || undefined,
    grad: (search.grad as string) || undefined,
    datum: (search.datum as string) || undefined,
    vrijeme: (search.vrijeme as string) || undefined,
  }),
  component: SearchPage,
});

function SearchPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip, grad, datum, vrijeme } = Route.useSearch();

  const { data: venues, isLoading } = useQuery({
    queryKey: ["search-venues", tip, grad, datum, vrijeme],
    queryFn: () =>
      landingApi.searchVenues({
        type: tip,
        city: grad,
        date: datum,
        time: vrijeme,
      }),
  });

  function handleSearch(filters: SearchFilters): void {
    navigate({
      to: "/pretraga",
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
      {/* Header */}
      <section className="bg-secondary-600 px-4 py-12">
        <h1 className="text-center text-3xl font-bold text-white">
          {t("search.title")}
        </h1>
        <div className="mt-6">
          <SearchFilterWidget
            onSearch={handleSearch}
            initialValues={{
              type: tip,
              city: grad,
              date: datum,
              time: vrijeme,
            }}
          />
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl bg-white px-4 py-12 md:px-8">
        {!isLoading && venues && venues.length > 0 && (
          <p className="mb-6 text-sm text-tertiary-500">
            {t("search.results_count", { count: venues.length })}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-tertiary-200"
              />
            ))}
          </div>
        )}

        {!isLoading && (!venues || venues.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-12 w-12 text-tertiary-300" />
            <p className="mt-3 text-tertiary-500">{t("search.no_results")}</p>
            <p className="mt-1 text-sm text-tertiary-400">
              {t("search.no_results_subtitle")}
            </p>
          </div>
        )}

        {!isLoading && venues && venues.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <SearchVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
