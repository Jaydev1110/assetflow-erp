import { Router, Request, Response } from 'express';
import * as store from '../store';

const router = Router();

/**
 * GET /api/reports/utilization
 * Group assets by department and calculate utilization rate
 */
router.get('/utilization', (req: Request, res: Response) => {
  const reports = store.departments.map((dept) => {
    const deptAssets = store.assets.filter(
      (a) => a.department && a.department.toLowerCase() === dept.name.toLowerCase()
    );

    const total = deptAssets.length;
    const allocated = deptAssets.filter(
      (a) => a.status === 'Allocated' || a.status === 'In Use'
    ).length;

    const utilizationRate = total > 0 ? Math.round((allocated / total) * 100) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets: total,
      allocatedAssets: allocated,
      utilizationRate
    };
  });

  res.json(reports);
});

/**
 * GET /api/reports/cost-pools
 * Cost distribution by category
 */
router.get('/cost-pools', (req: Request, res: Response) => {
  const totalCost = store.assets.reduce((sum, a) => sum + a.acquisitionCost, 0);

  const categoriesReport = store.categories.map((cat) => {
    const catAssets = store.assets.filter(
      (a) => a.category.toLowerCase() === cat.toLowerCase()
    );
    const cost = catAssets.reduce((sum, a) => sum + a.acquisitionCost, 0);
    const percentage = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;

    return {
      category: cat,
      count: catAssets.length,
      cost,
      percentage
    };
  });

  res.json({
    totalCost,
    categoriesReport
  });
});

/**
 * GET /api/reports/idle-assets
 * List of available assets and their total values
 */
router.get('/idle-assets', (req: Request, res: Response) => {
  const idle = store.assets.filter((a) => a.status === 'Available');
  const totalCost = idle.reduce((sum, a) => sum + a.acquisitionCost, 0);

  res.json({
    count: idle.length,
    totalCost,
    assets: idle
  });
});

/**
 * GET /api/reports/maintenance-due
 * List of active maintenance tickets and total count
 */
router.get('/maintenance-due', (req: Request, res: Response) => {
  const tickets = store.maintenanceTickets.filter((t) => t.status !== 'RESOLVED');
  
  res.json({
    count: tickets.length,
    tickets
  });
});

export default router;
