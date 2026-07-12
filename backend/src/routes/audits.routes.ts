import { Router, Request, Response } from 'express';
import * as store from '../store';
import { AuditCycle, AuditVerification, AssetStatus } from '../models/types';

const router = Router();

/**
 * GET /api/audits
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.auditCycles);
});

/**
 * POST /api/audits
 * Create a new audit cycle
 */
router.post('/', (req: Request, res: Response) => {
  const { scope, startDate, endDate, auditors } = req.body;

  if (!scope || !startDate || !endDate) {
    res.status(400).json({ error: 'Scope, startDate, and endDate are required.' });
    return;
  }

  const newCycle: AuditCycle = {
    id: `audit-${Date.now()}`,
    scope,
    startDate,
    endDate,
    auditors: auditors || ['Sarah Jenkins'],
    status: 'Open',
    verifications: []
  };

  store.auditCycles.push(newCycle);

  store.addNotification(
    'audit',
    'Audit Cycle Initiated',
    `Audit cycle ${newCycle.id} opened for "${scope}". Range: ${startDate} to ${endDate}.`,
    'Audit'
  );

  store.saveStore();
  res.status(201).json(newCycle);
});

/**
 * PATCH /api/audits/:id/verify
 * Mark asset Verified/Missing/Damaged
 */
router.patch('/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { assetTag, status, verifiedBy, notes } = req.body;

  if (!assetTag || !status) {
    res.status(400).json({ error: 'Asset tag and status are required.' });
    return;
  }

  const cycle = store.auditCycles.find((c) => c.id === id);
  if (!cycle) {
    res.status(404).json({ error: 'Audit cycle not found.' });
    return;
  }

  if (cycle.status === 'Closed') {
    res.status(400).json({ error: 'Cannot verify assets in a closed audit cycle.' });
    return;
  }

  const validStatuses = ['Verified', 'Missing', 'Damaged'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Status must be Verified, Missing, or Damaged.' });
    return;
  }

  // Find asset and update its status
  const asset = store.assets.find((a) => a.tag === assetTag);
  if (!asset) {
    res.status(404).json({ error: `Asset with tag ${assetTag} not found.` });
    return;
  }

  // Update verification record in cycle
  const existingVerifIndex = cycle.verifications.findIndex((v) => v.assetTag === assetTag);
  const verification: AuditVerification = {
    assetTag,
    status: status as 'Verified' | 'Missing' | 'Damaged',
    verifiedBy: verifiedBy || 'Auditor',
    verifiedDate: new Date().toISOString().split('T')[0],
    notes: notes || ''
  };

  if (existingVerifIndex > -1) {
    cycle.verifications[existingVerifIndex] = verification;
  } else {
    cycle.verifications.push(verification);
  }

  // Sync back to asset status
  if (status === 'Missing') {
    asset.status = 'Missing';
  } else if (status === 'Damaged') {
    asset.status = 'Damaged';
    asset.condition = 'Poor';
  } else if (status === 'Verified') {
    // If it was missing/damaged, restore it
    if (asset.status === 'Missing' || asset.status === 'Damaged') {
      asset.status = 'Available';
      asset.condition = 'Good';
    }
  }

  store.addNotification(
    'audit',
    'Asset Reconciled in Audit',
    `Audit ${id}: Verified ${assetTag} as ${status}.`,
    'Audit'
  );

  store.saveStore();
  res.json({ success: true, cycle, asset });
});

/**
 * PATCH /api/audits/:id/close
 * Locks cycle, auto-generates discrepancy report, updates asset status
 */
router.patch('/:id/close', (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  const cycle = store.auditCycles.find((c) => c.id === id);
  if (!cycle) {
    res.status(404).json({ error: 'Audit cycle not found.' });
    return;
  }

  if (cycle.status === 'Closed') {
    res.status(400).json({ error: 'Audit cycle is already closed.' });
    return;
  }

  cycle.status = 'Closed';

  // Calculate discrepancy report counts
  const totalAssets = store.assets.length;
  let verified = 0;
  let missing = 0;
  let damaged = 0;

  cycle.verifications.forEach((v) => {
    if (v.status === 'Verified') verified++;
    else if (v.status === 'Missing') {
      missing++;
      // Set asset status to Missing
      const asset = store.assets.find(a => a.tag === v.assetTag);
      if (asset) {
        asset.status = 'Missing';
      }
    } else if (v.status === 'Damaged') {
      damaged++;
      const asset = store.assets.find(a => a.tag === v.assetTag);
      if (asset) {
        asset.status = 'Damaged';
      }
    }
  });

  cycle.discrepancyReport = {
    totalAssets,
    verified,
    missing,
    damaged,
    notes: notes || 'Audit cycle finalized.'
  };

  store.addNotification(
    'audit',
    'Audit Cycle Closed',
    `Audit cycle ${id} closed. Summary: ${verified} verified, ${missing} missing, ${damaged} damaged.`,
    'Audit'
  );

  store.saveStore();
  res.json(cycle);
});

export default router;
