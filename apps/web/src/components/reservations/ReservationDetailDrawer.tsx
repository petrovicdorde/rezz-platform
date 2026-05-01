import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Phone, AlertTriangle, Star as StarIcon } from "lucide-react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { GuestRatingForm } from "./GuestRatingForm";
import {
  useConfirmReservation,
  useRejectReservation,
  useRecordArrival,
  useReservationGuestStats,
} from "@/hooks/useReservations";
import { useMarkAsRead } from "@/hooks/useNotifications";
import { useSettingValueLabel } from "@/hooks/useSettings";
import { useAuthStore } from "@/store/auth.store";
import type { Notification } from "@/lib/types/notification.types";
import type { ReservationStatus } from "@rezz/shared";

type DrawerAction = "confirm" | "reject" | "arrival" | "noShow" | "rate" | null;

interface ReservationDetailDrawerProps {
  notification: Notification | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export function ReservationDetailDrawer({
  notification,
  onClose,
  onActionComplete,
}: ReservationDetailDrawerProps): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const [note, setNote] = useState("");
  const [action, setAction] = useState<DrawerAction>(null);
  const confirmMutation = useConfirmReservation();
  const rejectMutation = useRejectReservation();
  const arrivalMutation = useRecordArrival();
  const markAsReadMutation = useMarkAsRead();
  const tableTypeLabel = useSettingValueLabel("TABLE_TYPE");

  const res = notification?.reservation;
  const status = res?.status as ReservationStatus | undefined;

  const canConfirmReject = role === "MANAGER" || role === "SUPER_ADMIN";
  const canRecordArrival =
    role === "MANAGER" || role === "WORKER" || role === "SUPER_ADMIN";
  const canRate = canRecordArrival;
  const canSeeGuestInsight = role === "MANAGER" || role === "SUPER_ADMIN";

  const { data: guestStats } = useReservationGuestStats(
    canSeeGuestInsight ? res?.id : undefined,
  );
  const noShowCount = guestStats?.noShowCount ?? 0;
  const windowDays = guestStats?.windowDays ?? 30;

  useEffect(() => {
    setNote("");
    setAction(null);
  }, [notification?.id]);

  function finishAndClose(): void {
    if (notification?.id) {
      markAsReadMutation.mutate(notification.id);
    }
    onActionComplete();
    onClose();
  }

  return (
    <Sheet
      open={notification !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetTitle className="sr-only">
          {t("notifications.reservation_details")}
        </SheetTitle>
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Header */}
          <h2 className="text-lg font-medium text-secondary-600">
            {t("notifications.reservation_details")}
          </h2>
          {status && (
            <div className="mt-2">
              <ReservationStatusBadge status={status} />
            </div>
          )}

          {res && (
            <>
              <Separator className="my-4" />

              {/* Info rows */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.first_name_label")}
                  </span>
                  <span className="font-medium text-secondary-600">
                    {res.firstName} {res.lastName}
                  </span>
                </div>
                {canSeeGuestInsight && noShowCount > 0 && (
                  <div className="flex justify-end">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        noShowCount >= 2
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                      title={t("reservation.no_show_count_hint", {
                        days: windowDays,
                      })}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {t("reservation.no_show_count", {
                        count: noShowCount,
                        days: windowDays,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.phone_label")}
                  </span>
                  <a
                    href={
                      res.phone
                        ? `tel:${res.phone.replace(/\s+/g, "")}`
                        : undefined
                    }
                    className="flex items-center gap-1 text-secondary-600 hover:text-primary-600"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {res.phone ||
                      (notification?.metadata as Record<string, string> | null)
                        ?.phone ||
                      "—"}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.date_label")}
                  </span>
                  <span className="text-secondary-600">
                    {format(new Date(res.date), "dd.MM.yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.time_label")}
                  </span>
                  <span className="text-secondary-600">{res.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.table_type_label")}
                  </span>
                  <span className="text-secondary-600">
                    {tableTypeLabel(res.tableType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">
                    {t("reservation.guests_label")}
                  </span>
                  <span className="text-secondary-600">
                    {t("reservation.guests_count", {
                      count: res.numberOfGuests,
                    })}
                  </span>
                </div>
                {res.specialRequest && (
                  <div>
                    <span className="text-tertiary-500">
                      {t("reservation.special_request")}
                    </span>
                    <p className="mt-1 italic text-tertiary-500">
                      {res.specialRequest}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions for PENDING — manager / super admin only */}
              {status === "PENDING" && canConfirmReject && (
                <>
                  <Separator className="my-4" />

                  {action === null && (
                    <>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm text-tertiary-500">
                          {t("notifications.note_optional")}
                        </label>
                        <Textarea
                          rows={2}
                          placeholder={t("notifications.note_placeholder")}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-500 hover:bg-red-50"
                          onClick={() => setAction("reject")}
                        >
                          {t("notifications.reject_reservation")}
                        </Button>
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700"
                          onClick={() => setAction("confirm")}
                        >
                          {t("notifications.confirm_reservation")}
                        </Button>
                      </div>
                    </>
                  )}

                  {action === "confirm" && (
                    <div>
                      <p className="mb-3 text-center text-sm text-secondary-600">
                        {t("reservation.confirm_question")}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setAction(null)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700"
                          disabled={confirmMutation.isPending}
                          onClick={() => {
                            confirmMutation.mutate(res.id, {
                              onSuccess: () => finishAndClose(),
                            });
                          }}
                        >
                          {confirmMutation.isPending
                            ? t("common.loading")
                            : t("notifications.confirm_reservation")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {action === "reject" && (
                    <div>
                      <p className="mb-3 text-center text-sm text-secondary-600">
                        {t("reservation.reject_question")}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setAction(null)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          className="w-full bg-red-600 text-white hover:bg-red-700"
                          disabled={rejectMutation.isPending}
                          onClick={() => {
                            rejectMutation.mutate(
                              { id: res.id, note: note || undefined },
                              {
                                onSuccess: () => finishAndClose(),
                              },
                            );
                          }}
                        >
                          {rejectMutation.isPending
                            ? t("common.loading")
                            : t("notifications.reject_reservation")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions for CONFIRMED — manager, worker, super admin */}
              {status === "CONFIRMED" && canRecordArrival && (
                <>
                  <Separator className="my-4" />

                  {action === null && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full border-orange-300 text-orange-500 hover:bg-orange-50"
                        onClick={() => setAction("noShow")}
                      >
                        {t("reservation.no_show_action")}
                      </Button>
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setAction("arrival")}
                      >
                        {t("reservation.arrival_action")}
                      </Button>
                    </div>
                  )}

                  {(action === "arrival" || action === "noShow") && (
                    <div>
                      <p className="mb-3 text-center text-sm text-secondary-600">
                        {action === "arrival"
                          ? t("reservation.arrival_confirm_question")
                          : t("reservation.no_show_confirm_question")}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setAction(null)}
                        >
                          {t("reservation.no")}
                        </Button>
                        <Button
                          className={
                            action === "arrival"
                              ? "w-full bg-blue-600 text-white hover:bg-blue-700"
                              : "w-full bg-orange-500 text-white hover:bg-orange-600"
                          }
                          disabled={arrivalMutation.isPending}
                          onClick={() => {
                            arrivalMutation.mutate(
                              {
                                id: res.id,
                                outcome:
                                  action === "arrival"
                                    ? "COMPLETED"
                                    : "NO_SHOW",
                              },
                              {
                                onSuccess: () => finishAndClose(),
                              },
                            );
                          }}
                        >
                          {arrivalMutation.isPending
                            ? t("common.loading")
                            : t("reservation.yes")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions for COMPLETED — rate guest */}
              {status === "COMPLETED" && canRate && (
                <>
                  <Separator className="my-4" />

                  {action !== "rate" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setAction("rate")}
                    >
                      <StarIcon className="mr-1.5 h-4 w-4" />
                      {res.guestRating
                        ? t("history.edit_rating")
                        : t("history.rate_guest")}
                    </Button>
                  )}

                  {action === "rate" && (
                    <GuestRatingForm
                      reservationId={res.id}
                      existingRating={res.guestRating}
                      onSuccess={() => finishAndClose()}
                      onCancel={() => setAction(null)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
