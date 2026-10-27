import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getReservationScheduleError } from './reservations';

const now = new Date('2026-10-28T15:00:00.000Z');

describe('reservation schedule rules', () => {
  it('accepts a whole-hour reservation within the Bogotá business hours', () => {
    assert.equal(
      getReservationScheduleError(new Date('2026-10-29T14:00:00.000Z'), 2, now),
      null,
    );
  });

  it('allows a reservation to end exactly at 21:00 Bogotá time', () => {
    assert.equal(
      getReservationScheduleError(new Date('2026-10-29T01:00:00.000Z'), 1, now),
      null,
    );
  });

  it('rejects a reservation that would end after 21:00 Bogotá time', () => {
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-29T01:00:00.000Z'), 2, now),
      null,
    );
  });

  it('rejects non-hour start times and past dates', () => {
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-29T14:30:00.000Z'), 1, now),
      null,
    );
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-28T14:00:00.000Z'), 1, now),
      null,
    );
  });

  it('accepts a reservation starting at 07:00 Bogotá time', () => {
    assert.equal(
      getReservationScheduleError(new Date('2026-10-29T12:00:00.000Z'), 1, now),
      null,
    );
  });

  it('rejects reservations outside business hours or with invalid durations', () => {
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-29T11:00:00.000Z'), 1, now),
      null,
    );
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-29T14:00:00.000Z'), 0, now),
      null,
    );
    assert.notEqual(
      getReservationScheduleError(new Date('2026-10-29T14:00:00.000Z'), 1.5, now),
      null,
    );
  });

  it('rejects invalid dates', () => {
    assert.notEqual(getReservationScheduleError(new Date('invalid'), 1, now), null);
  });

  it('rejects dates more than 30 days ahead', () => {
    assert.notEqual(
      getReservationScheduleError(new Date('2026-11-28T16:00:00.000Z'), 1, now),
      null,
    );
  });
});
