import { LockMode } from '@mikro-orm/core';
import { NextResponse } from 'next/server';
import { errorResponse, requireUser } from '@/features/auth/http';
import type { Reservation } from '@/database/entities/reservation';
import { getEntityClass, getOrm } from '@/database/orm';
import { z } from 'zod';

const cancellationCutoffMilliseconds = 2 * 60 * 60 * 1000;

type ReservationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: ReservationRouteContext,
): Promise<NextResponse> {
  const access = await requireUser('autenticar la cancelación de reserva');
  if ('response' in access) return access.response;
  const { user } = access;

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return errorResponse(404, 'RESERVATION_NOT_FOUND', 'No se encontró esa reserva.');
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const reservationEntity = getEntityClass<Reservation>(em, 'Reservation');
    const result = await em.transactional(
      async (transaction) => {
        const reservation = await transaction.findOne(
          reservationEntity,
          { id },
          { lockMode: LockMode.PESSIMISTIC_WRITE },
        );

        if (
          !reservation ||
          (user.role !== 'admin' && reservation.user.id !== user.id)
        ) {
          return { error: 'RESERVATION_NOT_FOUND' as const };
        }
        if (reservation.status !== 'confirmed') {
          return { error: 'NOT_CONFIRMED' as const };
        }
        if (
          user.role !== 'admin' &&
          reservation.startsAt.getTime() - Date.now() < cancellationCutoffMilliseconds
        ) {
          return { error: 'CANCELLATION_WINDOW_CLOSED' as const };
        }

        reservation.status = 'cancelled';
        await transaction.flush();
        return { reservationId: reservation.id };
      },
      { clear: true },
    );

    if ('error' in result) {
      switch (result.error) {
        case 'RESERVATION_NOT_FOUND':
          return errorResponse(404, result.error, 'No se encontró esa reserva.');
        case 'NOT_CONFIRMED':
          return errorResponse(409, result.error, 'La reserva ya está cancelada.');
        case 'CANCELLATION_WINDOW_CLOSED':
          return errorResponse(
            409,
            result.error,
            'Puedes cancelar tu reserva hasta 2 horas antes de su inicio.',
          );
      }
    }

    return NextResponse.json({ cancelled: true, id: result.reservationId });
  } catch (error) {
    console.error('Could not cancel reservation:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo cancelar la reserva.');
  }
}
