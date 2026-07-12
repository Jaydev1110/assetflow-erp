/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NotificationLog, Booking } from '../types';

interface NotificationsViewProps {
  notifications: NotificationLog[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onActionApprove: (id: string, booking: Omit<Booking, 'id'>, type?: string, targetId?: string) => void;
  onActionDeny: (id: string, type?: string, targetId?: string) => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onActionApprove,
  onActionDeny,
}: NotificationsViewProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter categories list
  const filterCategories = ['All', 'Infrastructure', 'Resource Booking', 'Asset Management', 'Security', 'Reports'];

  const filteredLogs = notifications.filter((log) => {
    if (activeFilter === 'All') return true;
    return log.category === activeFilter;
  });

  const getLogIcon = (type: NotificationLog['type']) => {
    switch (type) {
      case 'alert':
        return { name: 'error', bg: 'bg-red-50 text-red-700' };
      case 'booking':
        return { name: 'event_seat', bg: 'bg-indigo-50 text-indigo-700' };
      case 'transfer':
        return { name: 'swap_horiz', bg: 'bg-blue-50 text-blue-700' };
      case 'maintenance':
        return { name: 'build', bg: 'bg-amber-50 text-amber-700' };
      case 'security':
        return { name: 'gpp_bad', bg: 'bg-orange-50 text-orange-700' };
      case 'reports':
        return { name: 'analytics', bg: 'bg-emerald-50 text-emerald-700' };
      default:
        return { name: 'notifications', bg: 'bg-gray-50 text-gray-700' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Notifications & Alerts</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Real-time audit alerts, user custody changes, and facility bookings approval desk.
          </p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg text-xs font-semibold text-[#111827] transition flex items-center justify-center gap-2 self-start cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Mark All Read
        </button>
      </div>

      {/* Category Chips Filtering */}
      <div className="flex flex-wrap gap-2.5">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeFilter === cat
                ? 'bg-[#111827] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification Timeline ledger list */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden divide-y divide-[#E5E7EB]">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280] font-normal">
            No notification logs found matching this filter group.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const iconSpec = getLogIcon(log.type);
            return (
              <div
                key={log.id}
                className={`p-5 flex flex-col sm:flex-row gap-4 justify-between items-start transition ${
                  !log.isRead ? 'bg-blue-50/20' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                {/* Information Info Body */}
                <div className="flex gap-4 items-start flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent ${iconSpec.bg}`}>
                    <span className="material-symbols-outlined text-[20px]">{iconSpec.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#111827]">{log.title}</h4>
                      {!log.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed pr-6 font-normal">{log.description}</p>
                    <div className="flex items-center gap-3.5 pt-1 text-[10px] text-[#6B7280]">
                      <span className="bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB] font-mono font-medium text-[#6B7280]">
                        {log.category}
                      </span>
                      <span>{log.timeAgo}</span>
                    </div>

                    {/* Actionable Approval Buttons */}
                    {log.hasActions && (
                      <div className="flex items-center gap-2.5 pt-3">
                        <button
                          onClick={() => {
                            // Automatically insert room booking reservation or approve transfer request
                            onActionApprove(
                              log.id,
                              {
                                title: 'Strategic Planning Sync',
                                timeFrom: '14:00',
                                timeTo: '15:30',
                                date: '2023-10-24',
                                teamName: 'Marketing Strategy Team',
                              },
                              log.type,
                              log.targetId
                            );
                          }}
                          className="px-3.5 py-1.5 bg-[#111827] text-white hover:bg-black rounded-lg text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Approve Request
                        </button>
                        <button
                          onClick={() => onActionDeny(log.id, log.type, log.targetId)}
                          className="px-3.5 py-1.5 border border-[#E5E7EB] hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-semibold text-[#6B7280] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          Deny & Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mark as read helper */}
                {!log.isRead && (
                  <button
                    onClick={() => onMarkRead(log.id)}
                    className="text-[10px] font-semibold text-[#111827] hover:underline cursor-pointer shrink-0 pt-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
