/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openMobileMenu: () => void;
  onAddShortcut: (action: 'asset' | 'department' | 'booking' | 'ticket') => void;
}

export default function Header({
  currentView,
  setView,
  user,
  searchQuery,
  setSearchQuery,
  openMobileMenu,
  onAddShortcut,
}: HeaderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const getPlaceholderText = () => {
    switch (currentView) {
      case 'OrgSetup':
        return 'Search departments, divisions...';
      case 'Assets':
        return 'Search by tag, name, serial or location...';
      case 'Booking':
        return 'Search bookings, rooms...';
      case 'Maintenance':
        return 'Search maintenance tickets...';
      case 'Notifications':
        return 'Search logs and alerts...';
      default:
        return 'Search assets, users, or locations...';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] flex justify-between items-center w-full px-6 py-4 lg:pl-[284px]">
      {/* Search Input & Mobile Drawer Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={openMobileMenu}
          className="lg:hidden p-2 text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3F4F6] border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm font-normal text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] focus:ring-1 focus:ring-[#D1D5DB] outline-none transition"
            placeholder={getPlaceholderText()}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#111827] font-medium"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Profile, Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Support Help Center */}
        <button
          onClick={() => alert('Support portal opened. Welcome to the AssetFlow help center!')}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span>Help</span>
        </button>

        {/* Global Add Dropdown Shortcut */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-4 py-2 bg-[#111827] text-white rounded-lg text-xs font-medium hover:bg-black transition active:scale-95 flex items-center gap-1"
          >
            <span>+ Add</span>
            <span className="material-symbols-outlined text-xs leading-none">expand_more</span>
          </button>

          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-sm py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    onAddShortcut('asset');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111827] hover:bg-[#F3F4F6] font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">add_box</span>
                  Register Asset
                </button>
                <button
                  onClick={() => {
                    onAddShortcut('booking');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111827] hover:bg-[#F3F4F6] font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">event_available</span>
                  Book Resource
                </button>
                <button
                  onClick={() => {
                    onAddShortcut('ticket');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111827] hover:bg-[#F3F4F6] font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                  Raise Request
                </button>
                <button
                  onClick={() => {
                    onAddShortcut('department');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111827] hover:bg-[#F3F4F6] font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                  Add Department
                </button>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-[#E5E7EB] mx-1"></div>

        {/* User Info & Avatar */}
        <div
          onClick={() => setView('Profile')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB] transition group-hover:ring-2 group-hover:ring-black/5">
            <img referrerPolicy="no-referrer" className="w-full h-full object-cover" src={user.avatarUrl} alt={user.name} />
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-[#111827] group-hover:underline">
            {user.name.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
