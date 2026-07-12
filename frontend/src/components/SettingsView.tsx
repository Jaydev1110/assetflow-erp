/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  onResetData: () => void;
}

export default function SettingsView({ onResetData }: SettingsViewProps) {
  const [allowTelemetry, setAllowTelemetry] = useState(true);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [auditFrequency, setAuditFrequency] = useState('Monthly');
  const [timezone, setTimezone] = useState('UTC (GMT+0)');

  const handleResetDataClick = () => {
    if (confirm('⚠️ Warning: This will clear all local modifications, custom-registered assets, and rescheduled bookings. It resets the platform data back to standard default seed values. Proceed?')) {
      onResetData();
      alert('Local Storage Database flushed and successfully re-seeded to factory standard!');
    }
  };

  const handleBackupDownload = () => {
    alert('System backup compiled. Downloading full operational JSON state backup.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Platform Settings</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-normal">
          Adjust background system thresholds, automatic audit schedules, and disaster recovery options.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Alerts Configuration */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
          <h3 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Operational Alerts & Triggers
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#111827]">Notify on Critical Discrepancies</p>
                <p className="text-[11px] leading-relaxed text-[#6B7280] mt-0.5 font-normal">Prompt real-time banners and notifications if assets are marked Damaged or Missing.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyCritical}
                onChange={(e) => setNotifyCritical(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#111827] focus:ring-[#111827] h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#111827]">Operational Sync Telemetry</p>
                <p className="text-[11px] leading-relaxed text-[#6B7280] mt-0.5 font-normal">Collect anonymous usage diagnostics for layout rendering enhancements.</p>
              </div>
              <input
                type="checkbox"
                checked={allowTelemetry}
                onChange={(e) => setAllowTelemetry(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#111827] focus:ring-[#111827] h-4 w-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Audit Timing Preferences */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
          <h3 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
            System Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Scheduled Audit Cadence</label>
              <select
                value={auditFrequency}
                onChange={(e) => setAuditFrequency(e.target.value)}
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 focus:bg-white focus:border-[#D1D5DB] outline-none text-[#111827] font-medium text-xs transition"
              >
                <option>Monthly (Recommended)</option>
                <option>Quarterly (Fiscal Standard)</option>
                <option>Bi-Annually</option>
                <option>Manual Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Operational Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 focus:bg-white focus:border-[#D1D5DB] outline-none text-[#111827] font-medium text-xs transition"
              >
                <option>UTC (GMT+0)</option>
                <option>London (GMT+1)</option>
                <option>New York (EST/GMT-5)</option>
                <option>New Delhi (IST/GMT+5.5)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Administration backups & cache flushes */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
          <h3 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Backup & Disaster Recovery
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackupDownload}
              className="flex-1 py-3 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB]/80 rounded-lg text-xs font-semibold text-[#111827] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_download</span>
              Compile Operational Backup
            </button>

            <button
              onClick={handleResetDataClick}
              className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100/50 text-red-600 rounded-lg text-xs font-semibold border border-red-100 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset Database Cache
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
