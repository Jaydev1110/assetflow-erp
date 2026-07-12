/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AppView, Asset, Department, NotificationLog } from '../types';

interface DashboardViewProps {
  assets: Asset[];
  departments: Department[];
  notifications: NotificationLog[];
  setView: (view: AppView) => void;
  onQuickAction: (action: 'asset' | 'booking' | 'ticket') => void;
}

export default function DashboardView({
  assets,
  departments,
  notifications,
  setView,
  onQuickAction,
}: DashboardViewProps) {
  // Compute metrics reactively
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const allocatedAssets = assets.filter((a) => a.status === 'Allocated' || a.status === 'In Use').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'Maintenance').length;

  // Compute department distribution for the chart
  const deptData = departments.map((dept) => {
    const deptAssets = assets.filter((a) => a.department === dept.name);
    const allocated = deptAssets.filter((a) => a.status === 'Allocated' || a.status === 'In Use').length;
    const utilizationRate = deptAssets.length > 0 ? Math.round((allocated / deptAssets.length) * 100) : 0;
    return {
      name: dept.name,
      total: deptAssets.length,
      allocated,
      rate: utilizationRate,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Overview Headings */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Dashboard</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-normal">
          Real-time enterprise asset utilization, booking allocation, and request pipelines.
        </p>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Registered', value: totalAssets, sub: 'Assets logged', icon: 'inventory_2' },
          { label: 'Available Now', value: availableAssets, sub: `${Math.round((availableAssets / (totalAssets || 1)) * 100)}% of total`, icon: 'check_circle' },
          { label: 'Allocated & In Use', value: allocatedAssets, sub: 'Deployed in production', icon: 'deployed_code' },
          { label: 'Under Maintenance', value: maintenanceAssets, sub: 'Active tickets', icon: 'build_circle' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-[#111827] mt-2">{card.value}</h3>
              <p className="text-xs text-[#6B7280] mt-1">{card.sub}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#111827]">
              <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Visual Utilization Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Chart Block */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-semibold text-[#111827]">Asset Deployment & Utilization</h4>
              <p className="text-xs text-[#6B7280] mt-0.5">Active allocation percentage by core business departments.</p>
            </div>
            <span className="text-xs bg-[#F3F4F6] text-[#111827] font-medium px-3 py-1 rounded-full">
              Q3 Real-time Data
            </span>
          </div>

          {/* Custom SVG/Bar Chart Visualizer */}
          <div className="space-y-4">
            {deptData.slice(0, 4).map((dept, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#111827]">{dept.name}</span>
                  <span className="text-[#6B7280]">{dept.allocated} / {dept.total} allocated ({dept.rate}%)</span>
                </div>
                <div className="w-full bg-[#F3F4F6] h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.rate}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      dept.rate > 80
                        ? 'bg-[#111827]'
                        : dept.rate > 40
                        ? 'bg-[#4B5563]'
                        : 'bg-[#9CA3AF]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827] inline-block"></span> High (&gt;80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4B5563] inline-block"></span> Optimal (40%-80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF] inline-block"></span> Low (&lt;40%)
            </span>
            <button
              onClick={() => setView('Reports')}
              className="text-[#111827] font-semibold hover:underline"
            >
              Analyze reports &rarr;
            </button>
          </div>
        </div>

        {/* Quick Actions Side Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-semibold text-[#111827] mb-1">Global Action Center</h4>
            <p className="text-xs text-[#6B7280] mb-4">Direct shortcuts to critical workflows.</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onQuickAction('asset')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] transition text-left"
              >
                <span className="material-symbols-outlined text-[18px]">add_box</span>
                Register New Equipment
              </button>
              <button
                onClick={() => setView('Allocation')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] transition text-left"
              >
                <span className="material-symbols-outlined text-[18px]">move_up</span>
                Initiate Allocation/Transfer
              </button>
              <button
                onClick={() => onQuickAction('ticket')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] transition text-left"
              >
                <span className="material-symbols-outlined text-[18px]">build</span>
                Request Repair Maintenance
              </button>
              <button
                onClick={() => onQuickAction('booking')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] transition text-left"
              >
                <span className="material-symbols-outlined text-[18px]">event_seat</span>
                Book Boardroom / Workstation
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
            <span className="text-[11px] text-[#6B7280] block">System Operations Health</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Full Integrity Stable
            </span>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent System Logs & Audit Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Logs Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-semibold text-[#111827]">Recent Activity Log</h4>
              <p className="text-xs text-[#6B7280] mt-0.5">Latest changes and triggered alert logs.</p>
            </div>
            <button
              onClick={() => setView('Notifications')}
              className="text-xs font-semibold text-[#111827] hover:underline"
            >
              See all
            </button>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {notifications.slice(0, 4).map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className={`material-symbols-outlined p-1.5 rounded-md text-[18px] ${
                    log.type === 'alert'
                      ? 'bg-red-50 text-red-700'
                      : log.type === 'booking'
                      ? 'bg-blue-50 text-blue-700'
                      : log.type === 'transfer'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {log.type === 'alert'
                      ? 'error'
                      : log.type === 'booking'
                      ? 'event_seat'
                      : log.type === 'transfer'
                      ? 'move_up'
                      : 'info'}
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-[#111827]">{log.title}</h5>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{log.description}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280] whitespace-nowrap">
                  {log.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Status Quick Panel */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-semibold text-[#111827] mb-1">Ongoing Audits</h4>
            <p className="text-xs text-[#6B7280] mb-4">Current verification cycles in progress.</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span>London Branch Q3</span>
                  <span className="text-[#6B7280]">85%</span>
                </div>
                <div className="w-full bg-[#F3F4F6] h-2 rounded-full">
                  <div className="w-[85%] h-full bg-[#111827] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span>IT Infrastructure Hub</span>
                  <span className="text-[#6B7280]">42%</span>
                </div>
                <div className="w-full bg-[#F3F4F6] h-2 rounded-full">
                  <div className="w-[42%] h-full bg-gray-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setView('Audit')}
            className="w-full mt-6 py-2.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            Open Audit Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}
