/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Building2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { VenuePublicCard } from "@/components/public/VenuePublicCard";
import { VenueCategorySlider } from "@/components/public/VenueCategorySlider";
import { usePublicVenues } from "@/hooks/useVenues";
import { usePublicSettings } from "@/hooks/useSettings";
import type { PublicVenue } from "@/lib/types/venue.types";

const ALL_SENTINEL = "__ALL__";

export const Route = createFileRoute("/lokali/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tip: (search.tip as string) || undefined,
    grad: (search.grad as string) || undefined,
    datum: (search.datum as string) || undefined,
    vrijeme: (search.vrijeme as string) || undefined,
  }),
  component: LokaliPage,
});

function LokaliPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip, grad } = Route.useSearch();

  const [activeType, setActiveType] = useState<string>(tip ?? "");
  const [activeCity, setActiveCity] = useState<string>(grad ?? "");

  const { data: cities } = usePublicSettings("CITY");
  const { data: venueTypes } = usePublicSettings("VENUE_TYPE");
  const { data: venues, isLoading } = usePublicVenues({
    type: activeType || undefined,
    city: activeCity || undefined,
  });

  const isFiltered = activeType !== "" || activeCity !== "";

  function handleVenueClick(venue: PublicVenue): void {
    navigate({ to: "/lokali/$id", params: { id: venue.id } });
  }

  function clearFilters(): void {
    setActiveType("");
    setActiveCity("");
  }

  const grouped =
    venues?.reduce<Record<string, PublicVenue[]>>((acc, venue) => {
      const key = venue.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(venue);
      return acc;
    }, {}) ?? {};

  const groupedEntries = Object.entries(grouped).filter(
    ([, list]) => list.length > 0
  );

  return (
    <PublicLayout>
      {/* Filter bar */}
      <div className="sticky top-16 z-40 border-b border-tertiary-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-384 flex-wrap items-center gap-3">
          <Select
            value={activeType === "" ? ALL_SENTINEL : activeType}
            onValueChange={(v) => setActiveType(v === ALL_SENTINEL ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("venues_page.filter_all_types")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SENTINEL}>
                {t("venues_page.filter_all_types")}
              </SelectItem>
              {venueTypes?.map((vt) => (
                <SelectItem key={vt.value} value={vt.value}>
                  {vt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={activeCity === "" ? ALL_SENTINEL : activeCity}
            onValueChange={(v) => setActiveCity(v === ALL_SENTINEL ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("venues_page.filter_all_cities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SENTINEL}>
                {t("venues_page.filter_all_cities")}
              </SelectItem>
              {cities?.map((c) => (
                <SelectItem key={c.value} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-tertiary-500 hover:text-secondary-600"
            >
              <X className="size-3.5" />
              {t("venues_page.clear_filters")}
            </button>
          )}

          {!isLoading && venues && (
            <div className="ml-auto text-sm text-tertiary-500">
              {t("venues_page.results_count", { count: venues.length })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-384 px-4 py-8 md:px-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-tertiary-100"
              />
            ))}
          </div>
        )}

        {!isLoading && isFiltered && venues && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="mx-auto size-16 text-tertiary-200" />
            <p className="mt-4 text-xl font-medium text-secondary-600">
              {t("venues_page.no_results")}
            </p>
            <p className="mt-2 text-tertiary-500">
              {t("venues_page.no_results_subtitle")}
            </p>
          </div>
        )}

        {!isLoading && isFiltered && venues && venues.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {venues.map((venue) => (
              <VenuePublicCard
                key={venue.id}
                venue={venue}
                onClick={handleVenueClick}
              />
            ))}
          </div>
        )}

        {!isLoading && !isFiltered && groupedEntries.length > 0 && (
          <div className="space-y-12">
            {groupedEntries.map(([type, list]) => {
              const label =
                venueTypes?.find((vt) => vt.value === type)?.label ?? type;
              return (
                <VenueCategorySlider
                  key={type}
                  categoryLabel={label}
                  venues={list}
                  onVenueClick={handleVenueClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
