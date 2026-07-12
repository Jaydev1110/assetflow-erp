import { Router, Request, Response } from 'express';
import * as store from '../store';

const router = Router();

/**
 * GET /api/categories
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.categories);
});

/**
 * POST /api/categories
 */
router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  const normalized = String(name).trim();
  
  if (store.categories.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
    res.status(409).json({ error: 'Category already exists.' });
    return;
  }

  store.categories.push(normalized);
  store.addNotification(
    'alert',
    'Asset Category Added',
    `Registered new asset category "${normalized}".`,
    'Asset Management'
  );
  store.saveStore();

  res.status(201).json({ category: normalized, categories: store.categories });
});

export default router;
