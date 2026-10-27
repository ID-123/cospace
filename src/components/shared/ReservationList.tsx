'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '@/components/shared/LocaleProvider';
import { LocalizedPrice } from '@/components/shared/LocalizedPrice';

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
  status: 'confirmed' | 'cancelled';
  canCancel: boolean;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export function ReservationList() {
  const { t, locale } = useLocale();
  const bogotaDateTime = new Intl.DateTimeFormat(
    locale === 'en' ? 'en-US' : 'es-CO',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    },
  );
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadReservations = useCallback(async () => {
    setErrorMessage('');
    try {
      const response = await fetch('/api/reservations');
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        const code = result.error?.code;
        setErrorMessage(
          code === 'UNAUTHENTICATED'
            ? t('unauthenticated')
            : code === 'INTERNAL_ERROR'
              ? t('loadReservationsError')
            : result.error?.message ?? t('loadReservationsError'),
        );
        return;
      }
      setReservations((await response.json()) as ReservationItem[]);
    } catch {
      setErrorMessage(t('connectionError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  async function cancelReservation(id: string) {
    setErrorMessage('');
    try {
      const response = await fetch(`/api/reservations/${id}`, { method: 'PATCH' });
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        const code = result.error?.code;
        const cancellationMessages: Record<string, string> = {
          CANCELLATION_WINDOW_CLOSED: t('cancellationWindowClosed'),
          NOT_CONFIRMED: t('reservationNotConfirmed'),
          RESERVATION_NOT_FOUND: t('reservationNotFound'),
        };
        setErrorMessage(
          (code ? cancellationMessages[code] : undefined) ??
            result.error?.message ??
            t('cancelReservationError'),
        );
        return;
      }
      await loadReservations();
    } catch {
      setErrorMessage(t('connectionError'));
    }
  }

  if (isLoading) return <p>{t('loadingReservations')}</p>;

  return (
    <section className="reservation-list" aria-label={t('reservationsTitle')}>
      {errorMessage ? (
        <p className="auth-form__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {reservations.length === 0 ? (
        <p className="account-page__empty">
          {t('noReservations')}
        </p>
      ) : (
        reservations.map((reservation) => (
          <article className="reservation-card" key={reservation.id}>
            <div>
              <h2>{reservation.space.name}</h2>
              <p>
                {bogotaDateTime.format(new Date(reservation.startsAt))} –{' '}
                {bogotaDateTime.format(new Date(reservation.endsAt))}
              </p>
              <p>
                {reservation.durationHours} h ·{' '}
                <LocalizedPrice amount={reservation.totalPrice} /> ·{' '}
                {reservation.status === 'confirmed'
                  ? t('confirmed')
                  : t('cancelled')}
              </p>
            </div>
            {reservation.canCancel ? (
              <button
                type="button"
                className="reservation-card__cancel"
                onClick={() => void cancelReservation(reservation.id)}
              >
                {t('cancelReservation')}
              </button>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
