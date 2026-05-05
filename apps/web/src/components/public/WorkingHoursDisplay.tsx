import { useTranslation } from "react-i18next";
import type { WorkingHours } from "@/lib/types/venue.types";

interface WorkingHoursDisplayProps {
  workingHours: WorkingHours;
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayKey = (typeof DAY_ORDER)[number];

const WEEKDAY_INDEX: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function WorkingHoursDisplay({
  workingHours,
}: WorkingHoursDisplayProps): React.JSX.Element {
  const { t } = useTranslation();
  const today = WEEKDAY_INDEX[new Date().getDay()];

  const hasAnyDay = DAY_ORDER.some((day) => workingHours[day]);

  if (!hasAnyDay) {
    return (
      <p className="text-sm italic text-[rgba(20,11,0,0.42)]">
        {t("venue_detail.working_hours_not_set")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(17,17,68,0.08)] bg-white/60 backdrop-blur-sm">
      {DAY_ORDER.map((day, index) => {
        const entry = workingHours[day];
        const isToday = day === today;

        return (
          <div
            key={day}
            className={`relative flex items-center justify-between px-4 py-3 transition-colors sm:px-5 ${
              isToday
                ? "bg-[rgba(17,17,68,0.04)]"
                : "hover:bg-[rgba(17,17,68,0.02)]"
            } ${index > 0 ? "border-t border-[rgba(17,17,68,0.06)]" : ""}`}
          >
            {isToday && (
              <span
                aria-hidden
                className="absolute top-0 bottom-0 left-0 w-0.75 bg-primary-400"
              />
            )}
            <div className="flex items-center gap-2.5">
              {isToday && (
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-primary-400 shadow-[0_0_0_3px_rgba(17,17,68,0.12)]"
                />
              )}
              <span
                className={`text-sm tracking-[0.1px] ${
                  isToday
                    ? "font-semibold text-primary-400"
                    : "font-medium text-[#140B00]"
                }`}
              >
                {t(`venue_detail.day_${day}`)}
              </span>
            </div>

            {!entry || entry.isClosed ? (
              <span className="text-sm italic text-[rgba(20,11,0,0.4)]">
                {t("venue_detail.closed")}
              </span>
            ) : (
              <span
                className={`text-sm font-medium tabular-nums ${
                  isToday ? "text-primary-400" : "text-[rgba(20,11,0,0.6)]"
                }`}
              >
                {entry.open} — {entry.close}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
