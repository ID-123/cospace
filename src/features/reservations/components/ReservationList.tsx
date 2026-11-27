"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/shared/LocaleProvider";
import { LocalizedPrice } from "@/components/shared/LocalizedPrice";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type ReservationItem = {
  id: string;
  space: {
    id: string;
    name: string;
  };
  startsAt: string;
  endsAt: string;
  durationHours: number;
  totalPrice: number;
  status: "confirmed" | "cancelled";
  canCancel: boolean;
  canDelete: boolean;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type ReservationsLoadResult =
  | { reservations: ReservationItem[]; error: null }
  | { reservations: null; error: string };

export function ReservationList() {
  const { t, locale } = useLocale();
  const bogotaDateTime = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "es-CO",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Bogota",
    },
  );
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<ReservationItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReservations =
    useCallback(async (): Promise<ReservationsLoadResult> => {
      try {
        const response = await fetch("/api/reservations");
        if (!response.ok) {
          const result = (await response.json()) as ApiError;
          const code = result.error?.code;
          return {
            reservations: null,
            error:
              code === "UNAUTHENTICATED"
                ? t("unauthenticated")
                : code === "INTERNAL_ERROR"
                  ? t("loadReservationsError")
                  : (result.error?.message ?? t("loadReservationsError")),
          };
        }
        return {
          reservations: (await response.json()) as ReservationItem[],
          error: null,
        };
      } catch {
        return { reservations: null, error: t("connectionError") };
      }
    }, [t]);

  const loadReservations = useCallback(async () => {
    const result = await fetchReservations();
    if (result.error !== null) setErrorMessage(result.error);
    else setReservations(result.reservations);
    setIsLoading(false);
  }, [fetchReservations]);

  useEffect(() => {
    let isMounted = true;
    void fetchReservations().then((result) => {
      if (!isMounted) return;
      if (result.error !== null) setErrorMessage(result.error);
      else setReservations(result.reservations);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchReservations]);

  async function cancelReservation(id: string) {
    setErrorMessage("");
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        const code = result.error?.code;
        const cancellationMessages: Record<string, string> = {
          CANCELLATION_WINDOW_CLOSED: t("cancellationWindowClosed"),
          NOT_CONFIRMED: t("reservationNotConfirmed"),
          RESERVATION_NOT_FOUND: t("reservationNotFound"),
        };
        setErrorMessage(
          (code ? cancellationMessages[code] : undefined) ??
            result.error?.message ??
            t("cancelReservationError"),
        );
        return;
      }
      await loadReservations();
    } catch {
      setErrorMessage(t("connectionError"));
    }
  }

  async function deleteReservation() {
    if (!pendingDelete || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(`/api/reservations/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        setErrorMessage(result.error?.message ?? t("deleteReservationError"));
        return;
      }

      setSuccessMessage(t("reservationDeleted"));
      setPendingDelete(null);
      await loadReservations();
    } catch {
      setErrorMessage(t("connectionError"));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <p>{t("loadingReservations")}</p>;

  return (
    <>
      <section className="reservation-list" aria-label={t("reservationsTitle")}>
        {errorMessage ? (
          <p className="auth-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="reservation-list__success" role="status">
            {successMessage}
          </p>
        ) : null}
        {reservations.length === 0 ? (
          <p className="account-page__empty">{t("noReservations")}</p>
        ) : (
          reservations.map((reservation) => (
            <article className="reservation-card" key={reservation.id}>
              <div>
                <h2>{reservation.space.name}</h2>
                <p>
                  {bogotaDateTime.format(new Date(reservation.startsAt))} –{" "}
                  {bogotaDateTime.format(new Date(reservation.endsAt))}
                </p>
                <p>
                  {reservation.durationHours} h ·{" "}
                  <LocalizedPrice amount={reservation.totalPrice} /> ·{" "}
                  {reservation.status === "confirmed"
                    ? t("confirmed")
                    : t("cancelled")}
                </p>
              </div>
              <div className="reservation-card__actions">
                {reservation.canCancel ? (
                  <button
                    type="button"
                    className="reservation-card__cancel"
                    onClick={() => void cancelReservation(reservation.id)}
                  >
                    {t("cancelReservation")}
                  </button>
                ) : null}
                {reservation.canDelete ? (
                  <button
                    type="button"
                    className="reservation-card__delete"
                    onClick={() => setPendingDelete(reservation)}
                  >
                    {t("deleteReservation")}
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("deleteReservationTitle")}
        description={t("deleteReservationDescription")}
        confirmLabel={t("deleteReservation")}
        cancelLabel={t("keepReservation")}
        isLoading={isDeleting}
        onConfirm={() => void deleteReservation()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
