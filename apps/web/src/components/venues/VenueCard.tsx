import { useTranslation } from "react-i18next";
import { Car, CreditCard, Banknote, Smartphone, MapPin } from "lucide-react";
import type { PaymentMethod } from "@rezz/shared";
import { useSettingValueLabel } from "@/hooks/useSettings";
import type { AdminVenue } from "@/lib/types/venue.types";

interface VenueCardProps {
  venue: AdminVenue;
  onClick: () => void;
}

const PAYMENT_ICONS: Record<PaymentMethod, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  MOBILE: Smartphone,
};

const PAYMENT_KEYS: Record<PaymentMethod, string> = {
  CASH: "venue.payment_cash",
  CARD: "venue.payment_card",
  MOBILE: "venue.payment_mobile",
};

export function VenueCard({
  venue,
  onClick,
}: VenueCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const venueTypeLabel = useSettingValueLabel("VENUE_TYPE");
  const visibleTags = venue.tags.slice(0, 3);
  const extraTagCount = venue.tags.length - 3;

  return (
    <div
      className="cursor-pointer rounded-xl border border-primary-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-primary-400">{venue.name}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            venue.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {venue.isActive
            ? t("venue.status_active")
            : t("venue.status_inactive")}
        </span>
      </div>

      {/* Type + phone */}
      <div className="mt-1 flex items-center gap-2 text-sm text-tertiary-600">
        <span>{venueTypeLabel(venue.type)}</span>
        <span>·</span>
        <span>{venue.reservationPhone}</span>
      </div>

      {/* City + Address */}
      <div className="mt-1 flex items-center gap-1 text-sm text-tertiary-500">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-tertiary-400" />
        <span>{venue.city}</span>
      </div>

      {/* Tags */}
      {venue.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-800"
            >
              {tag}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className="rounded-full bg-tertiary-100 px-2 py-0.5 text-xs text-tertiary-600">
              +{extraTagCount} {t("venue.tags_more")}
            </span>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between text-sm text-tertiary-600">
        <div className="flex items-center gap-3">
          {venue.hasParking && (
            <span className="flex items-center gap-1">
              <Car className="h-4 w-4" />
            </span>
          )}
          {venue.paymentMethods.map((pm) => {
            const Icon = PAYMENT_ICONS[pm];
            return (
              <span
                key={pm}
                className="flex items-center gap-1"
                title={t(PAYMENT_KEYS[pm])}
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          })}
        </div>
        <span className="text-xs text-tertiary-400">
          {venue.tables.length} {t("venue.tables_label").toLowerCase()}
        </span>
      </div>
    </div>
  );
}
