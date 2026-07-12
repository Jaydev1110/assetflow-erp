/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView, UserProfile } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile;
  logout: () => void;
  unreadCount: number;
}

export default function Sidebar({ currentView, setView, user, logout, unreadCount }: SidebarProps) {
  const menuItems = [
    { view: 'Dashboard' as AppView, label: 'Dashboard', icon: 'dashboard' },
    { view: 'OrgSetup' as AppView, label: 'Organization Setup', icon: 'corporate_fare' },
    { view: 'Assets' as AppView, label: 'Assets', icon: 'inventory_2' },
    { view: 'Allocation' as AppView, label: 'Allocation & Transfer', icon: 'move_up' },
    { view: 'Booking' as AppView, label: 'Resource Booking', icon: 'event_seat' },
    { view: 'Maintenance' as AppView, label: 'Maintenance', icon: 'build' },
    { view: 'Audit' as AppView, label: 'Audit', icon: 'fact_check' },
    { view: 'Reports' as AppView, label: 'Reports', icon: 'analytics' },
    { view: 'Notifications' as AppView, label: 'Notifications', icon: 'notifications', badge: unreadCount },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-[#E5E7EB] bg-white hidden lg:flex flex-col py-6 z-50 select-none">
      {/* Brand Header */}
      <div className="px-6 mb-8 cursor-pointer" onClick={() => setView('Dashboard')}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111827] rounded-md flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <h1 className="font-bold text-xl tracking-tight text-[#111827]">AssetFlow</h1>
        </div>
        <p className="text-[11px] font-medium text-[#6B7280] mt-1 uppercase tracking-wider">Enterprise Management</p>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-3">
        {menuItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#F3F4F6] text-[#111827]'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#111827] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile and Settings Section */}
      <div className="mt-auto px-3 pt-6 border-t border-[#E5E7EB] flex flex-col gap-1">
        <button
          onClick={() => setView('Profile')}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
            currentView === 'Profile' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_circle</span>
          <span>Profile</span>
        </button>
        <button
          onClick={() => setView('Settings')}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
            currentView === 'Settings' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
