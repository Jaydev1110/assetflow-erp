import { Router, Request, Response } from 'express';
import * as store from '../store';
import { Department } from '../models/types';

const router = Router();

/**
 * GET /api/departments
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.departments);
});

/**
 * POST /api/departments
 */
router.post('/', (req: Request, res: Response) => {
  const { name, head, parentDept, icon } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Department name is required.' });
    return;
  }

  const newDept: Department = {
    id: `DEPT-${String(store.departments.length + 1).padStart(3, '0')}`,
    name,
    head: head || 'Unassigned',
    parentDept: parentDept || 'N/A',
    assetsCount: 0,
    status: 'Active',
    icon: icon || 'workspaces'
  };

  store.departments.push(newDept);
  store.addNotification(
    'alert',
    'Department Registered',
    `Department "${name}" has been established under ${newDept.parentDept}.`,
    'Infrastructure'
  );
  store.saveStore();

  res.status(201).json(newDept);
});

/**
 * PATCH /api/departments/:id
 */
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, head, parentDept, status, icon } = req.body;

  const deptIndex = store.departments.findIndex((d) => d.id === id);
  if (deptIndex === -1) {
    res.status(404).json({ error: 'Department not found.' });
    return;
  }

  const dept = store.departments[deptIndex];
  
  if (name !== undefined) dept.name = name;
  if (head !== undefined) dept.head = head;
  if (parentDept !== undefined) dept.parentDept = parentDept;
  if (status !== undefined) dept.status = status;
  if (icon !== undefined) dept.icon = icon;

  store.addNotification(
    'alert',
    'Department Profile Updated',
    `Department "${dept.name}" (${dept.id}) parameters were modified.`,
    'Infrastructure'
  );
  store.saveStore();

  res.json(dept);
});

export default router;
