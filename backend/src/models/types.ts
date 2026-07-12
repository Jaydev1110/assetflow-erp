/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView =
  | 'Dashboard'
  | 'OrgSetup'
  | 'Assets'
  | 'Allocation'
  | 'Booking'
  | 'Maintenance'
  | 'Audit'
  | 'Reports'
  | 'Notifications'
  | 'Profile'
  | 'Settings'
  | 'Login';

export type AssetStatus = 'Available' | 'Allocated' | 'In Use' | 'Maintenance' | 'Missing' | 'Damaged';

export interface Asset {
  tag: string; // e.g., #AST-4092
  name: string;
  category: string;
  status: AssetStatus;
  location: string;
  icon: string; // Google Material Symbol code e.g. "laptop_mac"
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  isShared: boolean;
  isBookable: boolean;
  imageUrl?: string;
  owner?: string;
  department?: string;
}

export interface Department {
  id: string; // e.g., DEPT-001
  name: string;
  head: string;
  parentDept: string;
  assetsCount: number;
  status: 'Active' | 'Inactive';
  icon: string;
}

export interface Booking {
  id: string;
  title: string;
  timeFrom: string; // e.g. "09:30"
  timeTo: string;   // e.g. "11:00"
  date: string;     // e.g. "2023-10-24"
  teamName?: string;
  isConflict?: boolean;
  isLocked?: boolean;
  resource?: string; // e.g. "Boardroom Delta"
}

export interface MaintenanceTicket {
  id: string; // e.g., SR-9042
  assetTag: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'TECHNICIAN_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  technicianName?: string;
  eta?: string;
  timeAgo: string;
  details?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface NotificationLog {
  id: string;
  type: 'alert' | 'booking' | 'transfer' | 'maintenance' | 'audit' | 'security' | 'reports';
  title: string;
  description: string;
  isRead: boolean;
  timeAgo: string;
  category: string; // e.g., "Infrastructure", "Resource Booking"
  hasActions?: boolean;
  targetId?: string; // Links back to target request or booking if actions are pending
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

// Backend-Only Models
export interface Allocation {
  id: string; // e.g. alloc-1
  assetTag: string;
  employeeName: string;
  department: string;
  allocatedDate: string;
  expectedReturnDate: string;
  status: 'Active' | 'Returned';
  conditionNotes?: string;
}

export interface TransferRequest {
  id: string; // e.g. xfer-1
  assetTag: string;
  fromEmployee: string;
  toEmployee: string;
  reason: string;
  status: 'Requested' | 'Approved' | 'Rejected';
  requestedDate: string;
}

export interface Employee {
  id: string; // e.g. EMP-001
  name: string;
  email: string;
  role: string; // e.g. Enterprise Administrator, Department Head, Asset Manager, Employee
  department: string;
  avatarUrl?: string;
}

export interface AuditVerification {
  assetTag: string;
  status: 'Verified' | 'Missing' | 'Damaged';
  verifiedBy: string;
  verifiedDate: string;
  notes?: string;
}

export interface AuditCycle {
  id: string; // e.g. audit-1
  scope: string; // e.g. "Software Engineering", "IT Equipment"
  startDate: string;
  endDate: string;
  auditors: string[];
  status: 'Open' | 'Closed';
  verifications: AuditVerification[];
  discrepancyReport?: {
    totalAssets: number;
    verified: number;
    missing: number;
    damaged: number;
    notes: string;
  };
}
