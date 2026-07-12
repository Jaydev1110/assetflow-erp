import { Router, Request, Response } from 'express';
import * as store from '../store';

const router = Router();

/**
 * POST /api/admin/reset
 * Restores the in-memory database to its initial mock seed values and persists the snapshot.
 */
router.post('/reset', (req: Request, res: Response) => {
  try {
    store.resetStore();
    res.json({
      success: true,
      message: 'In-memory data store has been restored to default seed values.'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to reset store.',
      details: error.message
    });
  }
});

export default router;
