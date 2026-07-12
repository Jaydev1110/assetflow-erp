/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Asset, Department } from '../types';

interface ReportsViewProps {
  assets: Asset[];
  departments: Department[];
}

export default function ReportsView({ assets, departments }: ReportsViewProps) {
  const [reportType, setReportType] = useState('capital');

  // Compute stats
  const totalCost = assets.reduce((sum, a) => sum + a.acquisitionCost, 0);
  const averageCost = assets.length > 0 ? totalCost / assets.length : 0;
  const idleAssets = assets.filter((a) => a.status === 'Available');
  const criticalAssets = assets.filter((a) => a.condition === 'Poor' || a.status === 'Damaged');

  // Category distributions
  const categoryChart = Array.from(new Set(assets.map((a) => a.category))).map((cat) => {
    const catAssets = assets.filter((a) => a.category === cat);
    const catCost = catAssets.reduce((sum, a) => sum + a.acquisitionCost, 0);
    return { name: cat, count: catAssets.length, cost: catCost };
  });

  // Export report dummy downloader helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Asset Tag,Name,Category,Status,Acquisition Date,Cost Pool\n';

    assets.forEach((a) => {
      csvContent += `${a.tag},"${a.name}",${a.category},${a.status},${a.acquisitionDate},${a.acquisitionCost}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AssetFlow_Operational_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Financial Reports & Analytics</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Evaluate cost pool summaries, asset depreciation logs, and utilization rates.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs flex items-center justify-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Full CSV
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Capital Cost Pool</span>
          <h3 className="text-3xl font-semibold tracking-tight text-[#111827] mt-2">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-[#6B7280] mt-1.5 font-normal">
            Across {assets.length} logged assets (Avg: ${averageCost.toFixed(2)})
          </p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Idle Capital Assets</span>
          <h3 className="text-3xl font-semibold tracking-tight text-[#111827] mt-2">
            {idleAssets.length} Units
          </h3>
          <p className="text-xs text-[#6B7280] mt-1.5 font-normal">
            In storage awaiting department allocation transfers
          </p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Nearing Retirement / Damaged</span>
          <h3 className="text-3xl font-semibold tracking-tight text-red-600 mt-2">
            {criticalAssets.length} Units
          </h3>
          <p className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md inline-block mt-1.5 self-start font-medium">
            Condition: Poor or Flagged Damaged
          </p>
        </div>
      </div>

      {/* Analytics Chart & Category Cost Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown visual table */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
            <h4 className="text-base font-semibold text-[#111827]">Asset Category Cost Pools</h4>
            <span className="text-xs font-normal text-[#6B7280]">Active Portfolio Distribution</span>
          </div>

          <div className="space-y-4">
            {categoryChart.map((cat, index) => {
              const pct = totalCost > 0 ? (cat.cost / totalCost) * 100 : 0;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#111827] font-medium">{cat.name} ({cat.count} units)</span>
                    <span className="text-[#6B7280] font-mono font-medium">${cat.cost.toFixed(2)} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-[#111827] rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Report details */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-semibold text-[#111827] mb-1">Operational Reports</h4>
            <p className="text-xs text-[#6B7280] font-normal mb-4">Depreciation ledger summaries.</p>

            <div className="space-y-3">
              {[
                { name: 'Fixed Asset Register', format: 'PDF', icon: 'picture_as_pdf' },
                { name: 'Depreciation Ledger Q3', format: 'XLSX', icon: 'table_view' },
                { name: 'Maintenance Expense Log', format: 'CSV', icon: 'receipt_long' },
                { name: 'Utilization & Downtime Report', format: 'HTML', icon: 'query_stats' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => alert(`Initiating export preparation for ${doc.name}.`)}
                  className="p-3 bg-[#F3F4F6] hover:bg-[#E5E7EB]/80 rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-medium text-[#111827]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#6B7280]">{doc.icon}</span>
                    {doc.name}
                  </span>
                  <span className="bg-[#111827] text-white text-[9px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                    {doc.format}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-[#6B7280] font-normal">Report Generated by AssetFlow Engine</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
