import { Router, Request, Response } from 'express';
import * as store from '../store';

const router = Router();

/**
 * GET /api/employees
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.employees);
});

/**
 * PATCH /api/employees/:id/role
 * Admin-only role promotion (Mock auth, allows all requests but verifies employee exists)
 */
router.patch('/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    res.status(400).json({ error: 'Role is required.' });
    return;
  }

  const employee = store.employees.find((e) => e.id === id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  const oldRole = employee.role;
  employee.role = role;

  store.addNotification(
    'security',
    'Employee Role Promotion',
    `Promoted ${employee.name} from "${oldRole}" to "${role}".`,
    'Security'
  );
  store.saveStore();

  res.json(employee);
});

export default router;
