import { Router, Request, Response } from 'express';
import * as store from '../store';
import { Booking } from '../models/types';
import { checkBookingOverlap } from '../services/booking.service';

const router = Router();

/**
 * GET /api/bookings
 * Filters by resource and date if query parameters are provided.
 */
router.get('/', (req: Request, res: Response) => {
  const { resource, date } = req.query;
  let result = store.bookings;

  if (resource) {
    result = result.filter(
      (b) => (b.resource || 'Boardroom Delta').toLowerCase() === String(resource).toLowerCase()
    );
  }

  if (date) {
    result = result.filter((b) => b.date === String(date));
  }

  res.json(result);
});

/**
 * POST /api/bookings
 * Schedules a new resource booking slot. Enforces overlap validation.
 */
router.post('/', (req: Request, res: Response) => {
  const { title, timeFrom, timeTo, date, teamName, resource } = req.body;

  if (!title || !timeFrom || !timeTo || !date) {
    res.status(400).json({ error: 'Title, timeFrom, timeTo, and date are required.' });
    return;
  }

  const selectedResource = resource || 'Boardroom Delta';

  // Server-side overlap checking
  const overlapCheck = checkBookingOverlap(selectedResource, date, timeFrom, timeTo);
  if (overlapCheck.hasOverlap) {
    res.status(409).json({
      error: 'Booking conflict detected.',
      message: 'The requested time slot overlaps with an existing active booking.',
      conflictingBooking: overlapCheck.overlappingBooking
    });
    return;
  }

  const newBooking: Booking = {
    id: `book-${Date.now()}`,
    title,
    timeFrom,
    timeTo,
    date,
    teamName: teamName || 'General Staff',
    isLocked: false,
    resource: selectedResource
  };

  store.bookings.push(newBooking);

  store.addNotification(
    'booking',
    'Meeting Reservation Placed',
    `"${title}" booked at ${timeFrom}-${timeTo} for ${selectedResource} by ${newBooking.teamName}.`,
    'Resource Booking'
  );

  store.saveStore();
  res.status(201).json(newBooking);
});

/**
 * PATCH /api/bookings/:id/cancel
 * Revokes resource booking reservation.
 */
router.patch('/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;

  const bookingIndex = store.bookings.findIndex((b) => b.id === id);
  if (bookingIndex === -1) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const booking = store.bookings[bookingIndex];
  if (booking.isLocked) {
    res.status(403).json({ error: 'Locked bookings cannot be cancelled.' });
    return;
  }

  // Remove booking from store
  store.bookings.splice(bookingIndex, 1);

  store.addNotification(
    'booking',
    'Booking Reservation Cancelled',
    `Reservation for "${booking.title}" was cancelled by the coordinator.`,
    'Resource Booking'
  );

  store.saveStore();
  res.json({ success: true, message: 'Booking reservation successfully cancelled.' });
});

export default router;
