export type PendingReservation = {
  spaceId: string;
  startsAt: string;
  durationHours: number;
};

const storageKey = "cospace.pendingReservation";

export function savePendingReservation(reservation: PendingReservation): void {
  window.sessionStorage.setItem(storageKey, JSON.stringify(reservation));
}

export function readPendingReservation(): PendingReservation | null {
  const value = window.sessionStorage.getItem(storageKey);
  if (!value) return null;

  try {
    return JSON.parse(value) as PendingReservation;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return null;
  }
}

export function clearPendingReservation(): void {
  window.sessionStorage.removeItem(storageKey);
}

export async function submitReservation(reservation: PendingReservation) {
  return fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
  });
}
