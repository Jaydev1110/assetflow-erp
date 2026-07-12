/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, Asset, Department, Booking, MaintenanceTicket, NotificationLog, UserProfile, AssetStatus } from './types';
import {
  DEFAULT_USER,
  INITIAL_ASSETS,
  INITIAL_DEPARTMENTS,
  INITIAL_BOOKINGS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  loadData,
  saveData,
} from './data/seedData';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import OrgSetupView from './components/OrgSetupView';
import AssetRegistryView from './components/AssetRegistryView';
import AllocationView from './components/AllocationView';
import BookingView from './components/BookingView';
import MaintenanceView from './components/MaintenanceView';
import AuditView from './components/AuditView';
import ReportsView from './components/ReportsView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Session Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => loadData<boolean>('is_logged_in', false));
  const [user, setUser] = useState<UserProfile>(() => loadData<UserProfile>('user_profile', DEFAULT_USER));

  // Active View Tab State
  const [currentView, setView] = useState<AppView>('Dashboard');

  // Core Synced Operational Datasets
  const [assets, setAssets] = useState<Asset[]>(() => loadData<Asset[]>('assets_ledger', INITIAL_ASSETS));
  const [departments, setDepartments] = useState<Department[]>(() => loadData<Department[]>('departments_matrix', INITIAL_DEPARTMENTS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadData<Booking[]>('bookings_agenda', INITIAL_BOOKINGS));
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => loadData<MaintenanceTicket[]>('maintenance_tickets', INITIAL_MAINTENANCE));
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => loadData<NotificationLog[]>('notifications_logs', INITIAL_NOTIFICATIONS));

  // Global Cross-view Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile drawer controls
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global "+ Add" shortcuts trigger indicators
  const [triggerAddShortcut, setTriggerAddShortcut] = useState<'asset' | 'booking' | 'ticket' | 'department' | null>(null);

  // Sync to local storage upon updates (session only)
  useEffect(() => {
    saveData('is_logged_in', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    saveData('user_profile', user);
  }, [user]);

  // Load database state from backend API on mount/authentication
  useEffect(() => {
    const initData = async () => {
      try {
        const [assetsRes, deptsRes, bookingsRes, maintRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/departments'),
          fetch('http://localhost:5000/api/bookings'),
          fetch('http://localhost:5000/api/maintenance'),
          fetch('http://localhost:5000/api/notifications')
        ]);

        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (deptsRes.ok) setDepartments(await deptsRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (maintRes.ok) setMaintenanceTickets(await maintRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (err) {
        console.error('Error loading datasets from API:', err);
      }
    };

    if (isLoggedIn) {
      initData();
    }
  }, [isLoggedIn]);

  // Compute unread alert count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Sign out helper
  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('Dashboard');
  };

  // Sign in bypass success handler
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
  };

  // Operational State Mutation Callback Handlers:
  
  // 1. Add Asset & increment associated department assets count via API
  const handleAddAsset = async (asset: Asset) => {
    try {
      const res = await fetch('http://localhost:5000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset)
      });
      if (res.ok) {
        const newAsset = await res.json();
        setAssets((prev) => [newAsset, ...prev]);

        // Refresh departments & notifications to sync counters/logs
        const [deptsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/departments'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        if (deptsRes.ok) setDepartments(await deptsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to add asset:', err);
    }
  };

  // 2. Add Department Cost Center via API
  const handleAddDepartment = async (dept: Omit<Department, 'assetsCount'>) => {
    try {
      const res = await fetch('http://localhost:5000/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept)
      });
      if (res.ok) {
        const newDept = await res.json();
        setDepartments((prev) => [...prev, newDept]);

        // Refresh notifications
        const notifRes = await fetch('http://localhost:5000/api/notifications');
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to add department:', err);
    }
  };

  // 3. Chain-of-Custody Allocation Transfer
  // If asset is already allocated, creates a transfer request.
  // If asset is available, directly allocates it.
  const handleTransferAsset = async (assetTag: string, newOwner: string, newDept: string) => {
    const asset = assets.find((a) => a.tag === assetTag);
    const isCurrentlyAllocated = asset && asset.status === 'Allocated';

    try {
      if (isCurrentlyAllocated) {
        // Submit transfer request (Requested status)
        const res = await fetch('http://localhost:5000/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetTag,
            fromEmployee: asset.owner || 'Marcus Chen',
            toEmployee: newOwner,
            reason: 'Custody realignment'
          })
        });

        if (res.ok) {
          // Reload notifications
          const notifRes = await fetch('http://localhost:5000/api/notifications');
          if (notifRes.ok) setNotifications(await notifRes.json());
          alert(`Transfer request submitted successfully (status: Requested).`);
          return { success: true };
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error || 'Failed to submit transfer request.'}`);
          return { success: false, error: errData };
        }
      } else {
        // Allocate available asset directly
        const res = await fetch('http://localhost:5000/api/allocations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetTag,
            employeeName: newOwner,
            department: newDept
          })
        });

        if (res.ok) {
          const newAlloc = await res.json();
          // Reload assets & notifications (since status was changed to Allocated)
          const [assetsRes, notifRes] = await Promise.all([
            fetch('http://localhost:5000/api/assets'),
            fetch('http://localhost:5000/api/notifications')
          ]);
          if (assetsRes.ok) setAssets(await assetsRes.json());
          if (notifRes.ok) setNotifications(await notifRes.json());
          alert('Asset allocated successfully!');
          return { success: true };
        } else if (res.status === 409) {
          const errData = await res.json();
          return { success: false, error: errData };
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error || 'Failed to allocate asset.'}`);
          return { success: false, error: errData };
        }
      }
    } catch (err) {
      console.error('Failed to process custody transfer:', err);
      return { success: false, error: { error: 'Network error connecting to backend.' } };
    }
  };

  // 4. File Maintenance repair requests via API (syncs asset status to Maintenance)
  const handleAddTicket = async (ticket: MaintenanceTicket) => {
    try {
      const res = await fetch('http://localhost:5000/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: ticket.assetTag,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          details: ticket.details
        })
      });
      if (res.ok) {
        const newTicket = await res.json();
        setMaintenanceTickets((prev) => [newTicket, ...prev]);

        // Reload assets and notifications (due to status sync)
        const [assetsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to raise maintenance ticket:', err);
    }
  };

  // 5. Progress repair task lifecycle via API
  const handleUpdateTicketStatus = async (id: string, newStatus: MaintenanceTicket['status'], technician?: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          technicianName: technician
        })
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setMaintenanceTickets((prev) =>
          prev.map((t) => (t.id === id ? updatedTicket : t))
        );

        // Reload assets and notifications in case of status-sync changes
        const [assetsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  // 6. Complete repair order and return asset to standard service via API
  const handleResolveTicket = async (id: string, assetTag: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED'
        })
      });
      if (res.ok) {
        setMaintenanceTickets((prev) => prev.filter((t) => t.id !== id));

        // Reload assets & notifications (syncs asset status to Available)
        const [assetsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to resolve maintenance ticket:', err);
    }
  };

  // 7. Secure Boardroom/Space booking slot via API (enforces overlaps)
  const handleAddBooking = async (booking: Booking) => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      if (res.ok) {
        const newBooking = await res.json();
        setBookings((prev) => [newBooking, ...prev]);

        // Reload notifications
        const notifRes = await fetch('http://localhost:5000/api/notifications');
        if (notifRes.ok) setNotifications(await notifRes.json());
        return { success: true };
      } else if (res.status === 409) {
        const errData = await res.json();
        // Temporarily put the booking block in local state flagged as conflict so it renders red on schedule
        const conflictBooking = { ...booking, isConflict: true };
        setBookings((prev) => [conflictBooking, ...prev]);
        return { success: false, error: errData };
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to book slot.'}`);
        return { success: false, error: errData };
      }
    } catch (err) {
      console.error('Failed to secure booking:', err);
      return { success: false, error: { error: 'Network connection failed.' } };
    }
  };

  // 8. Revoke meeting room booking reservation via API
  const handleRemoveBooking = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));

        // Reload notifications
        const notifRes = await fetch('http://localhost:5000/api/notifications');
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // 9. Reconcile asset audited details via API verify
  const handleReconcileAsset = async (tag: string, status: AssetStatus, condition: Asset['condition']) => {
    try {
      // Find active audit cycle
      const cyclesRes = await fetch('http://localhost:5000/api/audits');
      let cycleId = 'audit-1';
      if (cyclesRes.ok) {
        const cycles = await cyclesRes.json();
        const openCycle = cycles.find((c: any) => c.status === 'Open');
        if (openCycle) cycleId = openCycle.id;
      }

      const res = await fetch(`http://localhost:5000/api/audits/${cycleId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: tag,
          status: status === 'Available' ? 'Verified' : status,
          verifiedBy: user?.name || 'Administrator',
          notes: `Reconciled condition: ${condition}`
        })
      });

      if (res.ok) {
        // Reload assets & notifications
        const [assetsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      }
    } catch (err) {
      console.error('Failed to reconcile asset:', err);
    }
  };

  // 10. Mark single alert notification as read via API
  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  // 11. Mark all notifications as read via API
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  // 12. Approve requested booking or transfer request notification via API
  const handleActionApprove = async (id: string, booking: Omit<Booking, 'id'>, type?: string, targetId?: string) => {
    try {
      if (type === 'transfer' && targetId) {
        // Hit PATCH /api/transfers/:id/approve
        const res = await fetch(`http://localhost:5000/api/transfers/${targetId}/approve`, {
          method: 'PATCH'
        });
        if (res.ok) {
          await handleMarkRead(id);
          // Reload assets and notifications
          const [assetsRes, notifRes] = await Promise.all([
            fetch('http://localhost:5000/api/assets'),
            fetch('http://localhost:5000/api/notifications')
          ]);
          if (assetsRes.ok) setAssets(await assetsRes.json());
          if (notifRes.ok) setNotifications(await notifRes.json());
          alert('Asset Transfer Approved and custody reassigned successfully!');
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error || 'Failed to approve transfer request.'}`);
        }
      } else {
        // Standard room booking approval
        const res = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...booking,
            resource: 'Boardroom Delta'
          })
        });

        if (res.ok) {
          const newBooking = await res.json();
          setBookings((prev) => [newBooking, ...prev]);

          // Mark notification read
          await handleMarkRead(id);

          // Reload notifications
          const notifRes = await fetch('http://localhost:5000/api/notifications');
          if (notifRes.ok) setNotifications(await notifRes.json());
          alert('Meeting Request Confirmed and Reservation secured!');
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error || 'Failed to approve booking.'}`);
        }
      }
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  // 13. Deny and dismiss notification request or transfer request
  const handleActionDeny = async (id: string, type?: string, targetId?: string) => {
    try {
      if (type === 'transfer' && targetId) {
        // Hit PATCH /api/transfers/${targetId}/reject
        const res = await fetch(`http://localhost:5000/api/transfers/${targetId}/reject`, {
          method: 'PATCH'
        });
        if (res.ok) {
          await handleMarkRead(id);
          const notifRes = await fetch('http://localhost:5000/api/notifications');
          if (notifRes.ok) setNotifications(await notifRes.json());
          alert('Asset Transfer Request rejected & request dismissed.');
        } else {
          const errData = await res.json();
          alert(`Error: ${errData.error || 'Failed to reject transfer request.'}`);
        }
      } else {
        await handleMarkRead(id);
        alert('Meeting Request Denied & Request Dismissed.');
      }
    } catch (err) {
      console.error('Failed to deny request:', err);
    }
  };

  // 14. Update operational details on Profile
  const handleUpdateProfile = (newName: string, newRole: string) => {
    setUser((prev) => ({ ...prev, name: newName, role: newRole }));
  };

  // 15. Reset database via API
  const handleResetData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/reset', {
        method: 'POST'
      });
      if (res.ok) {
        // Reload all data arrays from API
        const [assetsRes, deptsRes, bookingsRes, maintRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/assets'),
          fetch('http://localhost:5000/api/departments'),
          fetch('http://localhost:5000/api/bookings'),
          fetch('http://localhost:5000/api/maintenance'),
          fetch('http://localhost:5000/api/notifications')
        ]);

        if (assetsRes.ok) setAssets(await assetsRes.json());
        if (deptsRes.ok) setDepartments(await deptsRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (maintRes.ok) setMaintenanceTickets(await maintRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());

        alert('All database values reset to original default seed state!');
      }
    } catch (err) {
      console.error('Failed to reset database:', err);
    }
  };

  // Global "+ Add" dropdown dynamic navigation router:
  const handleGlobalAddShortcut = (action: 'asset' | 'department' | 'booking' | 'ticket') => {
    if (action === 'asset') {
      setView('Assets');
      setTriggerAddShortcut('asset');
    } else if (action === 'department') {
      setView('OrgSetup');
      setTriggerAddShortcut('department');
    } else if (action === 'booking') {
      setView('Booking');
      setTriggerAddShortcut('booking');
    } else if (action === 'ticket') {
      setView('Maintenance');
      setTriggerAddShortcut('ticket');
    }
  };

  // Helper renderer to load corresponding tab panel view:
  const renderActiveView = () => {
    switch (currentView) {
      case 'Dashboard':
        return (
          <DashboardView
            assets={assets}
            departments={departments}
            notifications={notifications}
            setView={setView}
            onQuickAction={handleGlobalAddShortcut}
          />
        );
      case 'OrgSetup':
        return (
          <OrgSetupView
            departments={departments}
            assets={assets}
            onAddDepartment={handleAddDepartment}
            searchQuery={searchQuery}
          />
        );
      case 'Assets':
        return (
          <AssetRegistryView
            assets={assets}
            departments={departments}
            onAddAsset={handleAddAsset}
            searchQuery={searchQuery}
            triggerAddModal={triggerAddShortcut === 'asset'}
            onModalClosed={() => setTriggerAddShortcut(null)}
          />
        );
      case 'Allocation':
        return (
          <AllocationView
            assets={assets}
            departments={departments}
            onTransferAsset={handleTransferAsset}
          />
        );
      case 'Booking':
        return (
          <BookingView
            bookings={bookings}
            assets={assets}
            onAddBooking={handleAddBooking}
            onRemoveBooking={handleRemoveBooking}
            triggerAddModal={triggerAddShortcut === 'booking'}
            onModalClosed={() => setTriggerAddShortcut(null)}
          />
        );
      case 'Maintenance':
        return (
          <MaintenanceView
            maintenanceTickets={maintenanceTickets}
            assets={assets}
            onAddTicket={handleAddTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onResolveTicket={handleResolveTicket}
            searchQuery={searchQuery}
            triggerAddModal={triggerAddShortcut === 'ticket'}
            onModalClosed={() => setTriggerAddShortcut(null)}
          />
        );
      case 'Audit':
        return <AuditView assets={assets} onReconcileAsset={handleReconcileAsset} />;
      case 'Reports':
        return <ReportsView assets={assets} departments={departments} />;
      case 'Notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onActionApprove={handleActionApprove}
            onActionDeny={handleActionDeny}
          />
        );
      case 'Profile':
        return <ProfileView user={user} assets={assets} onUpdateProfile={handleUpdateProfile} />;
      case 'Settings':
        return <SettingsView onResetData={handleResetData} />;
      default:
        return (
          <DashboardView
            assets={assets}
            departments={departments}
            notifications={notifications}
            setView={setView}
            onQuickAction={handleGlobalAddShortcut}
          />
        );
    }
  };

  // If user is unauthenticated, redirect to gateway onboarding layout
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d] font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentView={currentView}
        setView={setView}
        user={user}
        logout={handleLogout}
        unreadCount={unreadCount}
      />

      {/* Sticky App Header */}
      <Header
        currentView={currentView}
        setView={setView}
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openMobileMenu={() => setMobileMenuOpen(true)}
        onAddShortcut={handleGlobalAddShortcut}
      />

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#E5E7EB] z-50 shadow-2xl p-6 lg:hidden flex flex-col"
            >
              {/* Header inside drawer */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#111827] rounded-md flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <h1 className="font-bold text-xl tracking-tight text-[#111827]">AssetFlow</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] transition"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
                {[
                  { view: 'Dashboard' as AppView, label: 'Dashboard', icon: 'dashboard' },
                  { view: 'OrgSetup' as AppView, label: 'Organization Setup', icon: 'corporate_fare' },
                  { view: 'Assets' as AppView, label: 'Assets', icon: 'inventory_2' },
                  { view: 'Allocation' as AppView, label: 'Allocation & Transfer', icon: 'move_up' },
                  { view: 'Booking' as AppView, label: 'Resource Booking', icon: 'event_seat' },
                  { view: 'Maintenance' as AppView, label: 'Maintenance', icon: 'build' },
                  { view: 'Audit' as AppView, label: 'Audit', icon: 'fact_check' },
                  { view: 'Reports' as AppView, label: 'Reports', icon: 'analytics' },
                  { view: 'Notifications' as AppView, label: 'Notifications', icon: 'notifications', badge: unreadCount },
                ].map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        setView(item.view);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#F3F4F6] text-[#111827] font-bold'
                          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#111827] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Footer inside mobile drawer */}
              <div className="mt-auto pt-6 border-t border-[#E5E7EB] flex flex-col gap-1">
                <button
                  onClick={() => {
                    setView('Profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    currentView === 'Profile' ? 'bg-[#F3F4F6] text-[#111827] font-bold' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  <span className="text-left">Profile</span>
                </button>
                <button
                  onClick={() => {
                    setView('Settings');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    currentView === 'Settings' ? 'bg-[#F3F4F6] text-[#111827] font-bold' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  <span className="text-left">Settings</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="text-left">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Viewport Content Stage */}
      <main className="lg:pl-[260px] min-h-[calc(100vh-80px)] bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
