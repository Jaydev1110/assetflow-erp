import * as store from '../store';
import { Booking } from '../models/types';

/**
 * Converts a time string "HH:MM" to numerical minutes of the day.
 */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export interface BookingCheckResult {
  hasOverlap: boolean;
  overlappingBooking?: Booking;
}

/**
 * Validates if a proposed booking slot overlaps with an existing reservation.
 */
export function checkBookingOverlap(
  resource: string | undefined,
  date: string,
  timeFrom: string,
  timeTo: string,
  excludeBookingId?: string
): BookingCheckResult {
  const newStart = timeToMinutes(timeFrom);
  const newEnd = timeToMinutes(timeTo);

  const matchedResource = resource || 'Boardroom Delta';

  const overlap = store.bookings.find((b) => {
    // Do not check overlap against itself when updating/canceling
    if (excludeBookingId && b.id === excludeBookingId) {
      return false;
    }

    const bResource = b.resource || 'Boardroom Delta';
    if (bResource.toLowerCase() !== matchedResource.toLowerCase()) {
      return false;
    }

    if (b.date !== date) {
      return false;
    }

    const bStart = timeToMinutes(b.timeFrom);
    const bEnd = timeToMinutes(b.timeTo);

    // Overlap condition: start1 < end2 AND end1 > start2
    return newStart < bEnd && newEnd > bStart;
  });

  if (overlap) {
    return {
      hasOverlap: true,
      overlappingBooking: overlap
    };
  }

  return {
    hasOverlap: false
  };
}
