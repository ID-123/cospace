import { LockMode } from '@mikro-orm/core';
import { NextResponse } from 'next/server';
import { errorResponse } from '@/features/auth/http';
import { getAuthenticatedUser } from '@/features/auth/current-user';
import { getReservationScheduleError, reservationInputSchema } from '@/features/reservations/reservations';
import type { Reservation } from '@/database/entities/reservation';
import type { Space } from '@/database/entities/space';
import type { User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

const maximumFutureReservations = 3;
const bookingWindowMilliseconds = 2 * 60 * 60 * 1000;

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión para ver tus reservas.');
    }

    const orm = await getOrm();
    const em = orm.em.fork();
    const reservationEntity = getEntityClass<Reservation>(em, 'Reservation');
    const reservations = await em.find(
      reservationEntity,
      { user: user.id },
      { populate: ['space'], orderBy: { startsAt: 'ASC' } },
    );

    return NextResponse.json(
      reservations.map((reservation) => ({
        id: reservation.id,
        space: {
          id: reservation.space.id,
          name: reservation.space.name,
        },
        startsAt: reservation.startsAt.toISOString(),
        endsAt: reservation.endsAt.toISOString(),
        durationHours: reservation.durationHours,
        totalPrice: reservation.totalPrice,
        status: reservation.status,
        canCancel:
          reservation.status === 'confirmed' &&
          (user.role === 'admin' ||
            reservation.startsAt.getTime() - Date.now() >= bookingWindowMilliseconds),
      })),
    );
  } catch (error) {
    console.error('Could not load reservations:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudieron consultar tus reservas.');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let user: User | null;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error('Could not authenticate reservation request:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo verificar la sesión.');
  }
  if (!user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión para crear una reserva.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'Revisa los datos de la reserva.');
  }

  const validation = reservationInputSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      400,
      'INVALID_INPUT',
      validation.error.issues[0]?.message ?? 'Revisa los datos de la reserva.',
    );
  }

  const startsAt = new Date(validation.data.startsAt);
  const now = new Date();
  const scheduleError = getReservationScheduleError(
    startsAt,
    validation.data.durationHours,
    now,
  );
  if (scheduleError) {
    return errorResponse(400, 'INVALID_SCHEDULE', scheduleError);
  }

  const endsAt = new Date(
    startsAt.getTime() + validation.data.durationHours * 60 * 60 * 1000,
  );

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const reservationEntity = getEntityClass<Reservation>(em, 'Reservation');
    const result = await em.transactional(
      async (transaction) => {
        const lockedUser = await transaction.findOne(
          userEntity,
          { id: user.id, isActive: true },
          { lockMode: LockMode.PESSIMISTIC_WRITE },
        );
        if (!lockedUser) return { error: 'UNAUTHENTICATED' as const };

        const space = await transaction.findOne(
          spaceEntity,
          { id: validation.data.spaceId, isActive: true },
          { lockMode: LockMode.PESSIMISTIC_WRITE },
        );
        if (!space) return { error: 'SPACE_NOT_FOUND' as const };

        const overlappingSpaceReservation = await transaction.findOne(
          reservationEntity,
          {
            space,
            status: 'confirmed',
            startsAt: { $lt: endsAt },
            endsAt: { $gt: startsAt },
          },
        );
        if (overlappingSpaceReservation) return { error: 'SPACE_UNAVAILABLE' as const };

        const overlappingUserReservation = await transaction.findOne(
          reservationEntity,
          {
            user: lockedUser,
            status: 'confirmed',
            startsAt: { $lt: endsAt },
            endsAt: { $gt: startsAt },
          },
        );
        if (overlappingUserReservation) return { error: 'USER_SCHEDULE_CONFLICT' as const };

        const futureReservations = await transaction.count(reservationEntity, {
          user: lockedUser,
          status: 'confirmed',
          startsAt: { $gt: now },
        });
        if (futureReservations >= maximumFutureReservations) {
          return { error: 'RESERVATION_LIMIT' as const };
        }

        const reservation = transaction.create(reservationEntity, {
          user: lockedUser,
          space,
          startsAt,
          endsAt,
          durationHours: validation.data.durationHours,
          totalPrice: space.pricePerHour * validation.data.durationHours,
          status: 'confirmed',
        });
        transaction.persist(reservation);
        await transaction.flush();

        return {
          reservation: {
            id: reservation.id,
            space: { id: space.id, name: space.name },
            startsAt: reservation.startsAt.toISOString(),
            endsAt: reservation.endsAt.toISOString(),
            durationHours: reservation.durationHours,
            totalPrice: reservation.totalPrice,
            status: reservation.status,
          },
        };
      },
      { clear: true },
    );

    if ('error' in result) {
      switch (result.error) {
        case 'UNAUTHENTICATED':
          return errorResponse(401, result.error, 'Inicia sesión para crear una reserva.');
        case 'SPACE_NOT_FOUND':
          return errorResponse(404, result.error, 'El espacio no está disponible.');
        case 'SPACE_UNAVAILABLE':
          return errorResponse(409, result.error, 'El espacio ya está reservado en ese horario.');
        case 'USER_SCHEDULE_CONFLICT':
          return errorResponse(409, result.error, 'Ya tienes otra reserva en ese horario.');
        case 'RESERVATION_LIMIT':
          return errorResponse(409, result.error, 'Ya tienes 3 reservas futuras confirmadas.');
      }
    }

    return NextResponse.json({ reservation: result.reservation }, { status: 201 });
  } catch (error) {
    console.error('Could not create reservation:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo crear la reserva.');
  }
}
