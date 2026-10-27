import { z } from 'zod';

export const reservationInputSchema = z.object({
  spaceId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }),
  durationHours: z.number().int().min(1).max(4),
});

const bogotaTime = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getBogotaParts(date: Date): Record<string, number> {
  return Object.fromEntries(
    bogotaTime
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
}

export function getBogotaDate(date: Date): string {
  const { year, month, day } = getBogotaParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getReservationScheduleError(
  startsAt: Date,
  durationHours: number,
  now = new Date(),
): string | null {
  if (
    !Number.isInteger(durationHours) ||
    durationHours < 1 ||
    durationHours > 4
  ) {
    return 'La reserva debe durar entre 1 y 4 horas completas.';
  }

  if (Number.isNaN(startsAt.getTime())) {
    return 'Selecciona una fecha válida.';
  }

  if (startsAt.getTime() <= now.getTime()) {
    return 'La reserva no puede comenzar en el pasado.';
  }

  if (startsAt.getTime() > now.getTime() + 30 * 24 * 60 * 60 * 1000) {
    return 'Solo puedes reservar con hasta 30 días de anticipación.';
  }

  const localStart = getBogotaParts(startsAt);
  if (
    localStart.minute !== 0 ||
    localStart.second !== 0 ||
    startsAt.getUTCMilliseconds() !== 0
  ) {
    return 'La reserva debe iniciar en una hora completa.';
  }

  if (localStart.hour < 7 || localStart.hour + durationHours > 21) {
    return 'El horario de reserva debe estar entre las 07:00 y las 21:00.';
  }

  return null;
}
