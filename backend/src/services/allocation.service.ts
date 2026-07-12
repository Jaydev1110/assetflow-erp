import * as store from '../store';

export interface AllocationCheckResult {
  isAvailable: boolean;
  reason?: string;
  currentHolder?: string;
  currentDepartment?: string;
}

/**
 * Checks if an asset is available for allocation.
 * If not, retrieves the current allocation or owner details.
 */
export function checkAssetAllocationStatus(assetTag: string): AllocationCheckResult {
  const asset = store.assets.find((a) => a.tag === assetTag);
  if (!asset) {
    return {
      isAvailable: false,
      reason: 'Asset does not exist.'
    };
  }

  if (asset.status !== 'Available') {
    // Attempt to locate an active allocation record for details
    const activeAlloc = store.allocations.find((a) => a.assetTag === assetTag && a.status === 'Active');
    return {
      isAvailable: false,
      reason: `Asset is currently in '${asset.status}' status.`,
      currentHolder: activeAlloc?.employeeName || asset.owner || 'N/A',
      currentDepartment: activeAlloc?.department || asset.department || 'N/A'
    };
  }

  return {
    isAvailable: true
  };
}
