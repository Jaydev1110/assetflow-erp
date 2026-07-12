import { Router, Request, Response } from 'express';
import * as store from '../store';
import { Asset, AssetStatus } from '../models/types';

const router = Router();

/**
 * Helper to generate a unique asset tag matching #AST-XXXX format
 */
function generateAssetTag(): string {
  let tag = '';
  let exists = true;
  while (exists) {
    const num = Math.floor(1000 + Math.random() * 9000);
    tag = `#AST-${num}`;
    exists = store.assets.some((a) => a.tag === tag);
  }
  return tag;
}

/**
 * GET /api/assets
 * Filters by category, status, and department (case-insensitive query params)
 */
router.get('/', (req: Request, res: Response) => {
  const { category, status, department } = req.query;
  let result = store.assets;

  if (category) {
    result = result.filter(
      (a) => a.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (status) {
    result = result.filter(
      (a) => a.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  if (department) {
    result = result.filter(
      (a) => a.department && a.department.toLowerCase() === String(department).toLowerCase()
    );
  }

  res.json(result);
});

/**
 * POST /api/assets
 * Register new asset
 */
router.post('/', (req: Request, res: Response) => {
  const {
    name,
    category,
    location,
    icon,
    serialNumber,
    acquisitionDate,
    acquisitionCost,
    condition,
    isShared,
    isBookable,
    owner,
    department,
    imageUrl
  } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: 'Name and category are required.' });
    return;
  }

  const generatedTag = generateAssetTag();
  
  // Icon defaults based on category
  let defaultIcon = icon || 'inventory_2';
  if (!icon) {
    const catLower = category.toLowerCase();
    if (catLower.includes('it') || catLower.includes('laptop') || catLower.includes('computer')) {
      defaultIcon = 'laptop_mac';
    } else if (catLower.includes('furniture') || catLower.includes('chair') || catLower.includes('desk')) {
      defaultIcon = 'chair';
    } else if (catLower.includes('media') || catLower.includes('camera') || catLower.includes('video')) {
      defaultIcon = 'camera';
    } else if (catLower.includes('printer') || catLower.includes('hardware')) {
      defaultIcon = 'print';
    }
  }

  const newAsset: Asset = {
    tag: generatedTag,
    name,
    category,
    status: 'Available',
    location: location || 'Main Storage Bin',
    icon: defaultIcon,
    serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    acquisitionDate: acquisitionDate || new Date().toISOString().split('T')[0],
    acquisitionCost: Number(acquisitionCost) || 0.0,
    condition: condition || 'New',
    isShared: isShared !== undefined ? Boolean(isShared) : true,
    isBookable: isBookable !== undefined ? Boolean(isBookable) : false,
    owner: owner || undefined,
    department: department || undefined,
    imageUrl: imageUrl || undefined
  };

  store.assets.push(newAsset);

  // Sync assets count in department
  if (newAsset.department) {
    const dept = store.departments.find(
      (d) => d.name.toLowerCase() === newAsset.department?.toLowerCase() || d.id === newAsset.department
    );
    if (dept) {
      dept.assetsCount += 1;
    }
  }

  // Push audit trail log
  store.addNotification(
    'alert',
    'Asset Registered',
    `Registered "${newAsset.name}" with tag ${newAsset.tag} in ${newAsset.department || 'General'}.`,
    'Asset Management'
  );

  store.saveStore();
  res.status(201).json(newAsset);
});

/**
 * PATCH /api/assets/:tag
 * Update location/status/condition
 */
router.patch('/:tag', (req: Request, res: Response) => {
  const { tag } = req.params;
  const { name, category, status, location, condition, owner, department, icon, isShared, isBookable } = req.body;

  const asset = store.assets.find((a) => a.tag === tag);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found.' });
    return;
  }

  const oldDept = asset.department;

  if (name !== undefined) asset.name = name;
  if (category !== undefined) asset.category = category;
  if (status !== undefined) asset.status = status as AssetStatus;
  if (location !== undefined) asset.location = location;
  if (condition !== undefined) asset.condition = condition;
  if (owner !== undefined) asset.owner = owner;
  if (icon !== undefined) asset.icon = icon;
  if (isShared !== undefined) asset.isShared = Boolean(isShared);
  if (isBookable !== undefined) asset.isBookable = Boolean(isBookable);

  if (department !== undefined) {
    asset.department = department;
    
    // Recalculate departments count if department changed
    if (oldDept !== department) {
      if (oldDept) {
        const oDept = store.departments.find(d => d.name === oldDept || d.id === oldDept);
        if (oDept) oDept.assetsCount = Math.max(0, oDept.assetsCount - 1);
      }
      if (department) {
        const nDept = store.departments.find(d => d.name === department || d.id === department);
        if (nDept) nDept.assetsCount += 1;
      }
    }
  }

  store.addNotification(
    'alert',
    'Asset Updated',
    `Asset ${asset.tag} properties modified (Status: ${asset.status}, Loc: ${asset.location}).`,
    'Asset Management'
  );

  store.saveStore();
  res.json(asset);
});

export default router;
