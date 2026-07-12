import { Router, Request, Response } from 'express';
import * as store from '../store';
import { Allocation, TransferRequest, AssetStatus } from '../models/types';
import { checkAssetAllocationStatus } from '../services/allocation.service';

const router = Router();

/**
 * GET /api/allocations
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.allocations);
});

/**
 * POST /api/allocations
 * Allocate an asset. Rejects with 409 if already allocated.
 */
router.post('/', (req: Request, res: Response) => {
  const { assetTag, employeeName, department, allocatedDate, expectedReturnDate } = req.body;

  if (!assetTag || !employeeName || !department) {
    res.status(400).json({ error: 'Asset tag, employee name, and department are required.' });
    return;
  }

  // Enforce double-allocation check
  const check = checkAssetAllocationStatus(assetTag);
  if (!check.isAvailable) {
    res.status(409).json({
      error: 'Asset is already allocated.',
      details: check.reason,
      currentHolder: check.currentHolder,
      currentDepartment: check.currentDepartment
    });
    return;
  }

  const newAllocation: Allocation = {
    id: `alloc-${Date.now()}`,
    assetTag,
    employeeName,
    department,
    allocatedDate: allocatedDate || new Date().toISOString().split('T')[0],
    expectedReturnDate: expectedReturnDate || '',
    status: 'Active'
  };

  store.allocations.push(newAllocation);

  // Update linked asset status and owner
  const asset = store.assets.find((a) => a.tag === assetTag);
  if (asset) {
    asset.status = 'Allocated';
    asset.owner = employeeName;
    asset.department = department;
  }

  store.addNotification(
    'transfer',
    'Asset Allocated',
    `Asset ${assetTag} has been assigned to ${employeeName} (${department}).`,
    'Asset Management'
  );

  store.saveStore();
  res.status(201).json(newAllocation);
});

/**
 * POST /api/allocations/:id/return
 * Mark asset returned, update status to Available
 */
router.post('/:id/return', (req: Request, res: Response) => {
  const { id } = req.params;
  const { condition, notes } = req.body;

  const allocation = store.allocations.find((a) => a.id === id);
  if (!allocation) {
    res.status(404).json({ error: 'Allocation record not found.' });
    return;
  }

  allocation.status = 'Returned';
  if (notes) {
    allocation.conditionNotes = notes;
  }

  // Re-adjust asset status
  const asset = store.assets.find((a) => a.tag === allocation.assetTag);
  if (asset) {
    asset.status = 'Available';
    asset.owner = undefined;
    if (condition) {
      asset.condition = condition;
    }
  }

  store.addNotification(
    'transfer',
    'Asset Returned',
    `Asset ${allocation.assetTag} was returned by ${allocation.employeeName}. Status set to Available.`,
    'Asset Management'
  );

  store.saveStore();
  res.json({ success: true, allocation });
});

/**
 * GET /api/transfers
 * (Implicit endpoint for listing requests, good for complete implementation)
 */
router.get('/transfers', (req: Request, res: Response) => {
  res.json(store.transferRequests);
});

/**
 * POST /api/transfers
 * Initiate a transfer request
 */
router.post('/transfers', (req: Request, res: Response) => {
  const { assetTag, fromEmployee, toEmployee, reason } = req.body;

  if (!assetTag || !fromEmployee || !toEmployee) {
    res.status(400).json({ error: 'Asset tag, sender, and recipient are required.' });
    return;
  }

  const newTransfer: TransferRequest = {
    id: `xfer-${Date.now()}`,
    assetTag,
    fromEmployee,
    toEmployee,
    reason: reason || 'Dept Restructuring',
    status: 'Requested',
    requestedDate: new Date().toISOString().split('T')[0]
  };

  store.transferRequests.push(newTransfer);

  store.addNotification(
    'transfer',
    'Transfer Requested',
    `Transfer requested for ${assetTag} from ${fromEmployee} to ${toEmployee}.`,
    'Asset Management',
    true, // Actions available (approve/reject)
    newTransfer.id
  );

  store.saveStore();
  res.status(201).json(newTransfer);
});

/**
 * PATCH /api/transfers/:id/approve
 * Approve transfer -> returns old holder allocation, creates new active allocation, updates owner
 */
router.patch('/transfers/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;

  const transfer = store.transferRequests.find((t) => t.id === id);
  if (!transfer) {
    res.status(404).json({ error: 'Transfer request not found.' });
    return;
  }

  if (transfer.status !== 'Requested') {
    res.status(400).json({ error: `Transfer request is already ${transfer.status.toLowerCase()}.` });
    return;
  }

  transfer.status = 'Approved';

  // Find previous active allocation and return it
  const activeAlloc = store.allocations.find(
    (a) => a.assetTag === transfer.assetTag && a.status === 'Active'
  );

  if (activeAlloc) {
    activeAlloc.status = 'Returned';
    activeAlloc.conditionNotes = `Closed via transfer request approval ${id}`;
  }

  // Find asset to update department
  const asset = store.assets.find((a) => a.tag === transfer.assetTag);
  let recipientDept = 'General Operations';
  if (asset) {
    asset.owner = transfer.toEmployee;
    // Find recipient's department from employees list
    const recipientEmp = store.employees.find(e => e.name === transfer.toEmployee);
    if (recipientEmp) {
      asset.department = recipientEmp.department;
      recipientDept = recipientEmp.department;
    }
  }

  // Create new active allocation
  const newAllocation: Allocation = {
    id: `alloc-${Date.now()}`,
    assetTag: transfer.assetTag,
    employeeName: transfer.toEmployee,
    department: recipientDept,
    allocatedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    status: 'Active'
  };
  store.allocations.push(newAllocation);

  store.addNotification(
    'transfer',
    'Transfer Approved',
    `Transfer approved: ${transfer.assetTag} transferred to ${transfer.toEmployee}.`,
    'Asset Management'
  );

  store.saveStore();
  res.json({ success: true, transfer, newAllocation });
});

/**
 * PATCH /api/transfers/:id/reject
 * Reject transfer
 */
router.patch('/transfers/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;

  const transfer = store.transferRequests.find((t) => t.id === id);
  if (!transfer) {
    res.status(404).json({ error: 'Transfer request not found.' });
    return;
  }

  if (transfer.status !== 'Requested') {
    res.status(400).json({ error: `Transfer request is already ${transfer.status.toLowerCase()}.` });
    return;
  }

  transfer.status = 'Rejected';

  store.addNotification(
    'transfer',
    'Transfer Rejected',
    `Transfer request for ${transfer.assetTag} to ${transfer.toEmployee} was declined.`,
    'Asset Management'
  );

  store.saveStore();
  res.json({ success: true, transfer });
});

export default router;
