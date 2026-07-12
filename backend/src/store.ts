import fs from 'fs';
import path from 'path';
import {
  Asset,
  Department,
  Booking,
  MaintenanceTicket,
  NotificationLog,
  Allocation,
  TransferRequest,
  Employee,
  AuditCycle
} from './models/types';
import * as seed from './data/seedData';

// File path for persistence
const DB_FILE = path.join(__dirname, '../db.json');

// In-memory collections
export let assets: Asset[] = [];
export let departments: Department[] = [];
export let bookings: Booking[] = [];
export let maintenanceTickets: MaintenanceTicket[] = [];
export let notifications: NotificationLog[] = [];
export let allocations: Allocation[] = [];
export let transferRequests: TransferRequest[] = [];
export let auditCycles: AuditCycle[] = [];
export let employees: Employee[] = [];
export let categories: string[] = [];

// Helper function to save store to file
export function saveStore() {
  try {
    const data = {
      assets,
      departments,
      bookings,
      maintenanceTickets,
      notifications,
      allocations,
      transferRequests,
      auditCycles,
      employees,
      categories
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data to db.json:', error);
  }
}

// Helper function to load store from file
export function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      
      assets = data.assets || [];
      departments = data.departments || [];
      bookings = data.bookings || [];
      maintenanceTickets = data.maintenanceTickets || [];
      notifications = data.notifications || [];
      allocations = data.allocations || [];
      transferRequests = data.transferRequests || [];
      auditCycles = data.auditCycles || [];
      employees = data.employees || [];
      categories = data.categories || [];
      console.log('Store loaded successfully from db.json');
    } else {
      console.log('No db.json found. Initializing with mock seed data.');
      resetStore();
    }
  } catch (error) {
    console.error('Error loading data from db.json, falling back to seed data:', error);
    resetStore();
  }
}

// Reset store to original mock seed data
export function resetStore() {
  assets = JSON.parse(JSON.stringify(seed.INITIAL_ASSETS));
  departments = JSON.parse(JSON.stringify(seed.INITIAL_DEPARTMENTS));
  bookings = JSON.parse(JSON.stringify(seed.INITIAL_BOOKINGS));
  maintenanceTickets = JSON.parse(JSON.stringify(seed.INITIAL_MAINTENANCE));
  notifications = JSON.parse(JSON.stringify(seed.INITIAL_NOTIFICATIONS));
  allocations = JSON.parse(JSON.stringify(seed.INITIAL_ALLOCATIONS));
  transferRequests = JSON.parse(JSON.stringify(seed.INITIAL_TRANSFERS));
  auditCycles = JSON.parse(JSON.stringify(seed.INITIAL_AUDIT_CYCLES));
  employees = JSON.parse(JSON.stringify(seed.INITIAL_EMPLOYEES));
  categories = JSON.parse(JSON.stringify(seed.INITIAL_CATEGORIES));
  
  saveStore();
  console.log('Store has been reset to original seed data');
}

// Utility to push notifications easily on mutations
export function addNotification(
  type: NotificationLog['type'],
  title: string,
  description: string,
  category: string,
  hasActions?: boolean,
  targetId?: string
) {
  const newNotif: NotificationLog = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    description,
    isRead: false,
    timeAgo: 'Just now',
    category,
    hasActions,
    targetId
  };
  notifications.unshift(newNotif);
  saveStore();
  return newNotif;
}
