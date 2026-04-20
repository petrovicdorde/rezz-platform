import { useState, useEffect, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { ExternalLink, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SelectableVenueCard } from "@/components/landing-admin/SelectableVenueCard";
import { SelectableEventCard } from "@/components/landing-admin/SelectableEventCard";
import {
  useAdminLandingConfig,
  useUpdateLandingConfig,
} from "@/hooks/useLanding";
import { useVenues } from "@/hooks/useVenues";
import { eventsApi } from "@/lib/api/events.api";
import type { VenueEvent } from "@/lib/types/event.types";

export const Route = createFileRoute("/dashboard/landing")({
  component: LandingAdminPage,
});

function LandingAdminPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: config, isLoading: configLoading } = useAdminLandingConfig();
  const { data: allVenues } = useVenues();
  const updateConfig = useUpdateLandingConfig();

  const venueIds = useMemo(
    () => allVenues?.map((v) => v.id) ?? [],
    [allVenues]
  );

  const eventQueries = useQueries({
    queries: venueIds.map((venueId) => ({
      queryKey: ["events", venueId],
      queryFn: () => eventsApi.getAll(venueId),
    })),
  });

  const allEvents = useMemo<VenueEvent[]>(
    () => eventQueries.flatMap((q) => q.data ?? []),
    [eventQueries]
  );

  const [showVenues, setShowVenues] = useState(
    () => config?.showFeaturedVenues ?? true
  );
  const [showEvents, setShowEvents] = useState(
    () => config?.showFeaturedEvents ?? false
  );
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>(
    () => config?.featuredVenueIds ?? []
  );
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(
    () => config?.featuredEventIds ?? []
  );
  const hasSynced = useRef(false);

  useEffect(() => {
    if (config && !hasSynced.current) {
      hasSynced.current = true;
      setShowVenues(config.showFeaturedVenues);
      setShowEvents(config.showFeaturedEvents);
      setSelectedVenueIds(config.featuredVenueIds);
      setSelectedEventIds(config.featuredEventIds);
    }
  }, [config]);

  const upcomingEvents = useMemo(
    () => allEvents.filter((e) => new Date(e.startsAt) >= new Date()),
    [allEvents],
  );

  const venuesLoaded = allVenues !== undefined;
  const eventsLoaded =
    venueIds.length === 0 ||
    eventQueries.every((q) => !q.isLoading && q.isFetched);

  // Prune selections that no longer correspond to displayable items
  // (e.g. events expired or were deleted, venues were deleted).
  useEffect(() => {
    if (!hasSynced.current) return;
    if (!venuesLoaded || !allVenues) return;
    const validVenueIds = new Set(allVenues.map((v) => v.id));
    setSelectedVenueIds((prev) => {
      const next = prev.filter((id) => validVenueIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [venuesLoaded, allVenues]);

  useEffect(() => {
    if (!hasSynced.current) return;
    if (!eventsLoaded) return;
    const validEventIds = new Set(upcomingEvents.map((e) => e.id));
    setSelectedEventIds((prev) => {
      const next = prev.filter((id) => validEventIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [eventsLoaded, upcomingEvents]);

  function toggleVenue(id: string): void {
    setSelectedVenueIds((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : prev.length < 8
        ? [...prev, id]
        : prev
    );
  }

  function toggleEvent(id: string): void {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  const isDirty = useMemo(() => {
    if (!config) return false;
    if (showVenues !== config.showFeaturedVenues) return true;
    if (showEvents !== config.showFeaturedEvents) return true;
    const sameIds = (a: string[], b: string[]): boolean =>
      a.length === b.length && a.every((id) => b.includes(id));
    if (!sameIds(selectedVenueIds, config.featuredVenueIds)) return true;
    if (!sameIds(selectedEventIds, config.featuredEventIds)) return true;
    return false;
  }, [config, showVenues, showEvents, selectedVenueIds, selectedEventIds]);

  function handleCancel(): void {
    if (!config) return;
    setShowVenues(config.showFeaturedVenues);
    setShowEvents(config.showFeaturedEvents);
    setSelectedVenueIds(config.featuredVenueIds);
    setSelectedEventIds(config.featuredEventIds);
  }

  function handleSave(): void {
    updateConfig.mutate({
      featuredVenueIds: selectedVenueIds,
      featuredEventIds: selectedEventIds,
      showFeaturedVenues: showVenues,
      showFeaturedEvents: showEvents,
    });
  }

  if (configLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-tertiary-200"
            />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-secondary-600">
          {t("landing_admin.title")}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            {t("landing_admin.preview")}
          </Button>
          <div className="ml-auto flex gap-2">
          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={updateConfig.isPending}
              className="h-10 px-4 sm:h-9 sm:px-3"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t("common.cancel")}</span>
            </Button>
          )}
          <Button
            size="sm"
            disabled={updateConfig.isPending || !isDirty}
            onClick={handleSave}
            className="h-10 px-4 bg-primary-400 text-white hover:bg-primary-600 sm:h-9 sm:px-3"
          >
            <Check className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">
              {updateConfig.isPending
                ? t("common.loading")
                : t("landing_admin.save_config")}
            </span>
          </Button>
          </div>
        </div>
      </div>

      {/* Section 1: Featured Venues */}
      <div className="mt-6 rounded-xl border border-tertiary-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-secondary-600">
              {t("landing_admin.featured_venues_section")}
            </h2>
            <p className="mt-1 text-xs text-tertiary-400">
              {t("landing_admin.venues_hint")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVenues(!showVenues)}
            className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              showVenues ? "bg-primary-400" : "bg-tertiary-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                showVenues ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <span className="mt-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
          {t("landing_admin.selected_count", {
            count: selectedVenueIds.length,
          })}
        </span>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {allVenues?.map((venue) => (
            <SelectableVenueCard
              key={venue.id}
              venue={venue}
              isSelected={selectedVenueIds.includes(venue.id)}
              onToggle={toggleVenue}
            />
          ))}
        </div>

        {(!allVenues || allVenues.length === 0) && (
          <p className="mt-4 text-sm text-tertiary-400">
            {t("landing_admin.no_venues_available")}
          </p>
        )}
      </div>

      {/* Section 2: Featured Events */}
      <div className="mt-4 rounded-xl border border-tertiary-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-secondary-600">
              {t("landing_admin.featured_events_section")}
            </h2>
            <p className="mt-1 text-xs text-tertiary-400">
              {t("landing_admin.events_hint")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEvents(!showEvents)}
            className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              showEvents ? "bg-primary-400" : "bg-tertiary-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                showEvents ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <span className="mt-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
          {t("landing_admin.selected_count", {
            count: selectedEventIds.length,
          })}
        </span>

        {upcomingEvents.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <SelectableEventCard
                key={event.id}
                event={event}
                isSelected={selectedEventIds.includes(event.id)}
                onToggle={toggleEvent}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-tertiary-400">
            {t("landing_admin.no_events_available")}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
