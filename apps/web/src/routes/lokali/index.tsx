/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Tag, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicLayout } from "@/components/layout/PublicLayout";
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
          {/* Type filter — icon-only on mobile, text on sm+ */}
          <Select
            value={activeType === "" ? ALL_SENTINEL : activeType}
            onValueChange={(v) => setActiveType(v === ALL_SENTINEL ? "" : v)}
          >
            <SelectTrigger
              aria-label={t("venues_page.filter_all_types")}
              title={t("venues_page.filter_all_types")}
              className={`size-11 justify-center !px-0 sm:h-11 sm:w-48 sm:!px-4 sm:justify-between [&_[data-slot=select-chevron]]:hidden sm:[&_[data-slot=select-chevron]]:block ${
                activeType !== ""
                  ? "!border-[rgba(249,133,19,0.55)] !bg-white !text-secondary-400 !shadow-[0_2px_12px_rgba(249,133,19,0.12)]"
                  : ""
              }`}
            >
              <Tag
                className={`size-4 sm:hidden ${
                  activeType !== ""
                    ? "text-secondary-400"
                    : "text-[rgba(20,11,0,0.55)]"
                }`}
              />
              <span className="hidden sm:inline">
                <SelectValue placeholder={t("venues_page.filter_all_types")} />
              </span>
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

          {/* City filter — icon-only on mobile, text on sm+ */}
          <Select
            value={activeCity === "" ? ALL_SENTINEL : activeCity}
            onValueChange={(v) => setActiveCity(v === ALL_SENTINEL ? "" : v)}
          >
            <SelectTrigger
              aria-label={t("venues_page.filter_all_cities")}
              title={t("venues_page.filter_all_cities")}
              className={`size-11 justify-center !px-0 sm:h-11 sm:w-48 sm:!px-4 sm:justify-between [&_[data-slot=select-chevron]]:hidden sm:[&_[data-slot=select-chevron]]:block ${
                activeCity !== ""
                  ? "!border-[rgba(249,133,19,0.55)] !bg-white !text-secondary-400 !shadow-[0_2px_12px_rgba(249,133,19,0.12)]"
                  : ""
              }`}
            >
              <MapPin
                className={`size-4 sm:hidden ${
                  activeCity !== ""
                    ? "text-secondary-400"
                    : "text-[rgba(20,11,0,0.55)]"
                }`}
              />
              <span className="hidden sm:inline">
                <SelectValue placeholder={t("venues_page.filter_all_cities")} />
              </span>
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

          {/* Clear filters — icon-only on mobile (square pill), full text on sm+ */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              aria-label={t("venues_page.clear_filters")}
              title={t("venues_page.clear_filters")}
              className="group inline-flex size-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[rgba(20,11,0,0.08)] bg-white/60 text-sm font-medium text-[rgba(20,11,0,0.55)] backdrop-blur-sm transition-all hover:-translate-y-px hover:border-[rgba(249,133,19,0.4)] hover:bg-[rgba(249,133,19,0.08)] hover:text-secondary-400 hover:shadow-[0_2px_12px_rgba(249,133,19,0.15)] sm:w-auto sm:px-4"
            >
              <X className="size-3.5 transition-transform duration-200 group-hover:rotate-90" />
              <span className="hidden sm:inline">
                {t("venues_page.clear_filters")}
              </span>
            </button>
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

        {!isLoading && venues && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="mx-auto size-16 text-tertiary-200" />
            <p className="mt-4 text-xl font-medium text-secondary-500">
              {t("venues_page.no_results")}
            </p>
            <p className="mt-2 text-tertiary-500">
              {t("venues_page.no_results_subtitle")}
            </p>
          </div>
        )}

        {!isLoading && groupedEntries.length > 0 && (
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
