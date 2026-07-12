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
}

export interface MaintenanceTicket {
  id: string; // e.g., SR-9042
  assetTag: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'TECHNICIAN_ASSIGNED' | 'IN_PROGRESS';
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
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}
