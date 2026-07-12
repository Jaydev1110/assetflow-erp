/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Asset, AssetStatus } from '../types';

interface AuditViewProps {
  assets: Asset[];
  onReconcileAsset: (tag: string, status: AssetStatus, condition: Asset['condition']) => void;
}

export default function AuditView({ assets, onReconcileAsset }: AuditViewProps) {
  const [selectedAssetTag, setSelectedAssetTag] = useState('');
  const [reconcileStatus, setReconcileStatus] = useState<AssetStatus>('Available');
  const [reconcileCondition, setReconcileCondition] = useState<Asset['condition']>('Good');

  // Find missing and damaged assets from current live list
  const missingAssets = assets.filter((a) => a.status === 'Missing');
  const damagedAssets = assets.filter((a) => a.status === 'Damaged');

  // Find currently selected asset for reconciliation card
  const selectedAsset = assets.find((a) => a.tag === selectedAssetTag);

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetTag) return;

    onReconcileAsset(selectedAssetTag, reconcileStatus, reconcileCondition);
    setSelectedAssetTag('');
    alert(`Asset ${selectedAssetTag} successfully reconciled to ${reconcileStatus} / ${reconcileCondition}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Physical Audit & Reconciliation</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-normal">
          Perform scheduled asset inspections, confirm chain-of-custody, and reconcile missing items.
        </p>
      </div>

      {/* Discrepancy Warnings Banners */}
      {(missingAssets.length > 0 || damagedAssets.length > 0) && (
        <div className="space-y-3">
          {missingAssets.map((asset) => (
            <motion.div
              key={asset.tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-900 flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-[20px] text-[#EF4444] shrink-0">error</span>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Missing Asset Discrepancy Tripped</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-relaxed font-normal">
                  Asset <span className="font-mono font-semibold text-red-800">{asset.tag}</span> ({asset.name}) is flagged as <span className="font-semibold">Missing</span>. Last logged at {asset.location}. Immediate reconciliation is required.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssetTag(asset.tag);
                  setReconcileStatus('Available');
                  setReconcileCondition(asset.condition);
                }}
                className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 font-semibold rounded-lg text-[10px] transition shrink-0"
              >
                Reconcile Now
              </button>
            </motion.div>
          ))}

          {damagedAssets.map((asset) => (
            <motion.div
              key={asset.tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-[20px] text-[#F59E0B] shrink-0">warning</span>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Damaged Asset Report</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-relaxed font-normal">
                  Asset <span className="font-mono font-semibold text-amber-900">{asset.tag}</span> ({asset.name}) is flagged as <span className="font-semibold">Damaged</span> (Condition: {asset.condition}). Last assigned to {asset.owner || 'N/A'}.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssetTag(asset.tag);
                  setReconcileStatus('Maintenance');
                  setReconcileCondition('Good');
                }}
                className="px-3 py-1.5 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 font-semibold rounded-lg text-[10px] transition shrink-0"
              >
                Send to Repair
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Audit Cycles Progress & Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">Q3 London Audit Cycle</h3>
            <span className="text-[10px] bg-emerald-50 text-[#047857] font-semibold px-2 py-0.5 rounded-full border border-emerald-100">In Progress</span>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#6B7280] font-normal">Verified Ledger Progress</span>
              <span className="font-semibold text-[#111827]">85%</span>
            </div>
            <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-[#10B981] rounded-full" />
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center text-white text-[10px] font-bold">SJ</div>
              <span className="font-semibold text-[#111827]">Sarah Jenkins (Auditor)</span>
            </div>
            <span className="text-[10px] text-[#6B7280] font-normal">Ends in 5 days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">IT Infrastructure Hub</h3>
            <span className="text-[10px] bg-blue-50 text-[#1D4ED8] font-semibold px-2 py-0.5 rounded-full border border-blue-100">Assigned</span>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#6B7280] font-normal">Verified Ledger Progress</span>
              <span className="font-semibold text-[#111827]">42%</span>
            </div>
            <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
              <div className="w-[42%] h-full bg-[#3B82F6] rounded-full" />
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">MC</div>
              <span className="font-semibold text-[#111827]">Marcus Chen (Auditor)</span>
            </div>
            <span className="text-[10px] text-[#6B7280] font-normal">Ends in 12 days</span>
          </div>
        </div>
      </div>

      {/* Reconciliation Workspace Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
          <h4 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Reconciliation Workspace ledger
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280] text-[10px] font-semibold uppercase">
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Condition</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {assets.map((asset) => (
                  <tr key={asset.tag} className="hover:bg-[#F9FAFB] transition">
                    <td className="py-3 font-medium">
                      <p className="text-[#111827] font-semibold">{asset.name}</p>
                      <p className="text-[9px] text-[#6B7280] font-mono">{asset.tag}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-semibold text-[#111827]">{asset.status}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-[#F3F4F6] rounded border border-[#E5E7EB] font-mono font-medium text-[10px] text-[#6B7280]">
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedAssetTag(asset.tag);
                          setReconcileStatus(asset.status);
                          setReconcileCondition(asset.condition);
                        }}
                        className="px-3 py-1.5 bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] rounded-lg text-xs font-semibold transition"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Reconcile card action form */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
          <h4 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">Reconciliation Form</h4>

          {selectedAsset ? (
            <form onSubmit={handleReconcileSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-[#6B7280] font-normal">Reconciling equipment:</p>
                <h5 className="font-semibold text-[#111827] text-sm mt-1">{selectedAsset.name}</h5>
                <p className="text-[10px] font-mono text-[#6B7280]">{selectedAsset.tag}</p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Confirm Status
                </label>
                <select
                  value={reconcileStatus}
                  onChange={(e) => setReconcileStatus(e.target.value as AssetStatus)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  <option value="Available">Available (In Storage)</option>
                  <option value="Allocated">Allocated (Assigned)</option>
                  <option value="In Use">In Use (Active Deploy)</option>
                  <option value="Maintenance">Maintenance (Repair)</option>
                  <option value="Missing">Missing (Discrepancy)</option>
                  <option value="Damaged">Damaged (Faulty)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Verify Condition State
                </label>
                <select
                  value={reconcileCondition}
                  onChange={(e) => setReconcileCondition(e.target.value as Asset['condition'])}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  <option>New</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Sign & Authorize Audit Log
              </button>
            </form>
          ) : (
            <div className="py-12 text-center text-[#6B7280] space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#D1D5DB]">fact_check</span>
              <p className="text-xs font-semibold text-[#111827]">Select an asset</p>
              <p className="text-[11px] leading-relaxed font-normal">Select any asset from the ledger table on the left to confirm details and update its ledger entry status.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
