import { randomUUID } from 'node:crypto';
import { defineEntity, p } from '@mikro-orm/core';
import { Space } from './space';
import { User } from './user';

export const ReservationSchema = defineEntity({
  name: 'Reservation',
  tableName: 'reservation',
  properties: {
    id: p.uuid().primary().onCreate(() => randomUUID()),
    user: () => p.manyToOne(User).fieldName('user_id').index(),
    space: () => p.manyToOne(Space).fieldName('space_id').index(),
    startsAt: p.datetime(),
    endsAt: p.datetime(),
    durationHours: p.integer(),
    totalPrice: p.integer(),
    status: p.enum(['confirmed', 'cancelled']).default('confirmed'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Reservation extends ReservationSchema.class {}

ReservationSchema.setClass(Reservation);
