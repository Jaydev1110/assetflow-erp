import { Router, Request, Response } from 'express';
import * as store from '../store';
import { MaintenanceTicket, AssetStatus } from '../models/types';

const router = Router();

/**
 * GET /api/maintenance
 */
router.get('/', (req: Request, res: Response) => {
  res.json(store.maintenanceTickets);
});

/**
 * POST /api/maintenance
 * Raise a maintenance request (starts in PENDING status)
 * Sets linked asset status to Maintenance.
 */
router.post('/', (req: Request, res: Response) => {
  const { assetTag, title, description, priority, details } = req.body;

  if (!assetTag || !title) {
    res.status(400).json({ error: 'Asset tag and title are required.' });
    return;
  }

  // Check if asset exists
  const asset = store.assets.find((a) => a.tag === assetTag);
  if (!asset) {
    res.status(404).json({ error: `Asset with tag ${assetTag} not found.` });
    return;
  }

  const newTicket: MaintenanceTicket = {
    id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    assetTag,
    title,
    description: description || 'Routine maintenance required.',
    status: 'PENDING',
    timeAgo: 'Just now',
    details: details || '',
    priority: priority || 'medium'
  };

  store.maintenanceTickets.push(newTicket);

  // Force asset status to Maintenance
  asset.status = 'Maintenance';

  store.addNotification(
    'maintenance',
    'Maintenance Ticket Opened',
    `Repair order ${newTicket.id} filed for ${asset.name} (${assetTag}). Status set to Maintenance.`,
    'Maintenance'
  );

  store.saveStore();
  res.status(201).json(newTicket);
});

/**
 * PATCH /api/maintenance/:id/status
 * Progresses status: PENDING -> APPROVED -> TECHNICIAN_ASSIGNED -> IN_PROGRESS -> RESOLVED.
 * Approving -> linked asset status = 'Maintenance'
 * Resolving -> linked asset status = 'Available'
 */
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, technicianName, eta } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  const ticket = store.maintenanceTickets.find((t) => t.id === id);
  if (!ticket) {
    res.status(404).json({ error: 'Maintenance ticket not found.' });
    return;
  }

  const proposedStatus = String(status).toUpperCase();
  const validStatuses = ['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  if (!validStatuses.includes(proposedStatus)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  // Update status and fields
  ticket.status = proposedStatus as MaintenanceTicket['status'];
  if (technicianName !== undefined) ticket.technicianName = technicianName;
  if (eta !== undefined) ticket.eta = eta;

  // Handle side-effects on linked asset
  const asset = store.assets.find((a) => a.tag === ticket.assetTag);
  if (asset) {
    if (proposedStatus === 'RESOLVED') {
      asset.status = 'Available';
      asset.condition = 'Good'; // Restored to operational condition
      
      // Let's filter resolved tickets out of active list if we want to mirror frontend delete,
      // but in this backend let's keep it and set its status.
      // We will also send a success response indicating resolution.
    } else {
      asset.status = 'Maintenance';
    }
  }

  // Set default ETA on technician assignment if not provided
  if (proposedStatus === 'TECHNICIAN_ASSIGNED' && !ticket.eta) {
    ticket.eta = '3h';
  }

  // Push notifications based on status
  if (proposedStatus === 'RESOLVED') {
    store.addNotification(
      'maintenance',
      'Maintenance Ticket Resolved',
      `Repair order ${ticket.id} completed. Equipment ${ticket.assetTag} returned to Available inventory.`,
      'Maintenance'
    );
  } else {
    store.addNotification(
      'maintenance',
      'Maintenance Status Updated',
      `Ticket ${ticket.id} status changed to ${proposedStatus}.`,
      'Maintenance'
    );
  }

  store.saveStore();
  res.json(ticket);
});

/**
 * DELETE /api/maintenance/:id
 * Direct resolver (similar to frontend handleResolveTicket filter)
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const ticketIndex = store.maintenanceTickets.findIndex((t) => t.id === id);
  if (ticketIndex === -1) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const ticket = store.maintenanceTickets[ticketIndex];
  
  // Set asset back to Available
  const asset = store.assets.find(a => a.tag === ticket.assetTag);
  if (asset) {
    asset.status = 'Available';
    asset.condition = 'Good';
  }

  store.maintenanceTickets.splice(ticketIndex, 1);

  store.addNotification(
    'maintenance',
    'Maintenance Ticket Resolved & Closed',
    `Repair order ${ticket.id} for ${ticket.assetTag} resolved and removed from tracking registry.`,
    'Maintenance'
  );

  store.saveStore();
  res.json({ success: true, message: 'Ticket resolved and deleted.' });
});

export default router;
