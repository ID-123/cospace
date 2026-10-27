'use client';

import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/shared/LocaleProvider';
import { getReservationScheduleError } from '@/auth/reservations';

type ReservationFormProps = {
  spaceId: string;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

function getBogotaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

export function ReservationForm({ spaceId }: ReservationFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationHours, setDurationHours] = useState(1);
  const today = getBogotaDate(new Date());
  const maximumDate = addDays(today, 30);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const date = String(formData.get('date'));
    const startHour = String(formData.get('startHour')).padStart(2, '0');
    const startsAtDate = new Date(`${date}T${startHour}:00:00-05:00`);
    if (Number.isNaN(startsAtDate.getTime())) {
      setMessage(t('invalidDate'));
      return;
    }

    const scheduleError = getReservationScheduleError(
      startsAtDate,
      durationHours,
    );
    if (scheduleError) {
      setMessage(t('scheduleRuleError'));
      return;
    }
    const startsAt = startsAtDate.toISOString();

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, startsAt, durationHours }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        const apiErrorTranslations: Record<string, string> = {
          INVALID_SCHEDULE: t('scheduleRuleError'),
          SPACE_UNAVAILABLE: t('spaceUnavailable'),
          USER_SCHEDULE_CONFLICT: t('userScheduleConflict'),
          RESERVATION_LIMIT: t('reservationLimit'),
          SPACE_NOT_FOUND: t('spaceNotFound'),
          INVALID_INPUT: t('invalidInput'),
          INTERNAL_ERROR: t('createReservationError'),
        };
        setMessage(
          (result.error?.code
            ? apiErrorTranslations[result.error.code]
            : undefined) ??
            result.error?.message ??
            t('createReservationError'),
        );
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setMessage(t('connectionError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateDuration(event: ChangeEvent<HTMLSelectElement>) {
    const nextDuration = Number(event.currentTarget.value);
    setDurationHours(nextDuration);
  }

  const latestStartHour = 21 - durationHours;

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <label>
        {t('date')}
        <input name="date" type="date" min={today} max={maximumDate} required />
      </label>
      <label>
        {t('startTimeBogota')}
        <select name="startHour" defaultValue="09" required>
          {Array.from({ length: latestStartHour - 6 }, (_, index) => index + 7).map((hour) => (
            <option key={hour} value={String(hour).padStart(2, '0')}>
              {String(hour).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('duration')}
        <select
          name="durationHours"
          value={durationHours}
          onChange={updateDuration}
          required
        >
          {[1, 2, 3, 4].map((hours) => (
            <option key={hours} value={hours}>
              {hours} {hours === 1 ? t('hour') : t('hours')}
            </option>
          ))}
        </select>
      </label>
      {message ? (
        <p className="auth-form__error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('booking') : t('reserve')}
      </button>
    </form>
  );
}
