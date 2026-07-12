import { Router, Request, Response } from 'express';
import * as store from '../store';

const router = Router();

/**
 * GET /api/notifications
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.notifications);
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read. Must be declared BEFORE /:id to avoid matching id = "read-all"
 */
router.patch('/read-all', (req: Request, res: Response) => {
  store.notifications.forEach((n) => {
    n.isRead = true;
  });

  store.saveStore();
  res.json({ success: true, count: store.notifications.length });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
router.patch('/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;

  const notif = store.notifications.find((n) => n.id === id);
  if (!notif) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  notif.isRead = true;

  store.saveStore();
  res.json(notif);
});

export default router;
