import { Router, Request, Response } from 'express';
import * as store from '../store';
import { UserProfile, Employee } from '../models/types';

const router = Router();

/**
 * POST /api/auth/login
 * Mock authentication, returns user + role.
 */
router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  // Find in employee registry
  const matchedEmployee = store.employees.find(
    (emp) => emp.email.toLowerCase() === email.toLowerCase()
  );

  if (matchedEmployee) {
    const userProfile: UserProfile = {
      name: matchedEmployee.name,
      email: matchedEmployee.email,
      role: matchedEmployee.role,
      avatarUrl: matchedEmployee.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    };
    res.json({ user: userProfile });
    return;
  }

  // Default fallback if not found in pre-seeded list (to make login frictionless)
  const defaultUserProfile: UserProfile = {
    name: email.split('@')[0],
    email: email,
    role: 'Employee',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  };
  res.json({ user: defaultUserProfile });
});

/**
 * POST /api/auth/signup
 * Creates Employee-only account.
 */
router.post('/signup', (req: Request, res: Response) => {
  const { name, email, department } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  const existing = store.employees.find(
    (emp) => emp.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    res.status(400).json({ error: 'User with this email already exists.' });
    return;
  }

  const newEmployee: Employee = {
    id: `EMP-${Date.now()}`,
    name,
    email,
    role: 'Employee',
    department: department || 'General Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  };

  store.employees.push(newEmployee);
  store.addNotification(
    'security',
    'New Employee Account Created',
    `Account registered for ${name} (${email}) in ${newEmployee.department}.`,
    'Security'
  );
  store.saveStore();

  const userProfile: UserProfile = {
    name: newEmployee.name,
    email: newEmployee.email,
    role: newEmployee.role,
    avatarUrl: newEmployee.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  };

  res.status(201).json({ user: userProfile });
});

export default router;
