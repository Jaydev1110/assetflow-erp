/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Asset, Department } from '../types';

interface AllocationViewProps {
  assets: Asset[];
  departments: Department[];
  onTransferAsset: (assetTag: string, newOwner: string, newDept: string) => Promise<{ success: boolean, error?: any }>;
}

export default function AllocationView({ assets, departments, onTransferAsset }: AllocationViewProps) {
  const [selectedAssetTag, setSelectedAssetTag] = useState('');
  const [recipient, setRecipient] = useState('');
  const [targetDept, setTargetDept] = useState('Software Engineering');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ message: string; holder?: string; dept?: string } | null>(null);
  const [transferHistory, setTransferHistory] = useState([
    { tag: '#AST-4092', action: 'Assigned Custody', from: 'Storage Hub 1', to: 'Sarah Jenkins', date: '2023-10-12', status: 'Completed' },
    { tag: '#AST-2023', action: 'Transferred Department', from: 'IT Ops', to: 'Liam Thorne', date: '2023-08-05', status: 'Completed' },
    { tag: '#AST-1092', action: 'Branch Deployment', from: 'Main Office', to: 'Marcus Chen', date: '2023-11-02', status: 'Completed' },
  ]);

  // Find currently selected asset
  const selectedAsset = assets.find((a) => a.tag === selectedAssetTag);

  // Filter only assets that can be allocated (e.g. status "Available" or "Allocated")
  const transferrableAssets = assets.filter((a) => a.status === 'Available' || a.status === 'Allocated');

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetTag || !recipient) {
      alert('Please select an asset and state the custodian recipient.');
      return;
    }

    setErrorMsg(null);

    // Call async custody transfer handler
    const res = await onTransferAsset(selectedAssetTag, recipient, targetDept);

    if (res && !res.success) {
      setErrorMsg({
        message: res.error.details || 'Double-allocation warning triggered.',
        holder: res.error.currentHolder || 'Marcus Chen',
        dept: res.error.currentDepartment || 'Software Engineering'
      });
    } else {
      setErrorMsg(null);

      // Append to local transfer logs
      const newLog = {
        tag: selectedAssetTag,
        action: 'Assigned Custody',
        from: selectedAsset?.owner || 'Main Office Hub',
        to: recipient,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
      };

      setTransferHistory([newLog, ...transferHistory]);

      // Reset Form
      setSelectedAssetTag('');
      setRecipient('');
      setReason('');
    }
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
        <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Custody & Allocation Transfer</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-normal">
          Initiate chain-of-custody transfer orders and track physical deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Form (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
            <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
              Create Allocation Request
            </h3>

            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              {/* Asset Dropdown Selector */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Select Registered Equipment *
                </label>
                <select
                  required
                  value={selectedAssetTag}
                  onChange={(e) => setSelectedAssetTag(e.target.value)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  <option value="">-- Choose Asset Tag or Name --</option>
                  {transferrableAssets.map((asset) => (
                    <option key={asset.tag} value={asset.tag}>
                      {asset.tag} - {asset.name} ({asset.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reactive Warning Banners */}
              {selectedAsset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-3.5 rounded-xl border text-xs leading-normal ${
                    selectedAsset.isShared
                      ? 'bg-amber-50 border-amber-200/60 text-amber-800'
                      : 'bg-indigo-50 border-indigo-200/60 text-indigo-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-lg">
                      {selectedAsset.isShared ? 'warning' : 'info'}
                    </span>
                    <div>
                      <p className="font-semibold">
                        {selectedAsset.isShared ? 'Shared Asset Warning' : 'Direct Allocation Asset'}
                      </p>
                      <p className="text-[10px] mt-0.5 opacity-90">
                        {selectedAsset.isShared
                          ? 'This asset is configured as a communal/shared resource. Re-allocating direct custody might restrict access for other scheduled personnel.'
                          : 'This is a single-custody equipment item. Completing this transfer updates the primary operational host ledger and reports immediate responsibility.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recipient Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Recipient Custodian / Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Alex Rivera or Marketing Team"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Receiving Department *
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Justification Reason */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Transfer Justification / Reason
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the operational reason or project requirement for this allocation transfer..."
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none resize-none transition"
                />
              </div>

              {/* Dynamic Allocation Conflict warning banner */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs leading-normal"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-lg text-red-600 shrink-0">warning</span>
                    <div>
                      <p className="font-semibold text-red-950">Asset Allocation Blocked</p>
                      <p className="text-[10px] mt-1 text-red-700">
                        {errorMsg.message}
                      </p>
                      <p className="text-[10px] mt-1.5 text-red-900 font-medium">
                        Current Custodian: <strong>{errorMsg.holder}</strong> (Dept: {errorMsg.dept})
                      </p>
                      <p className="text-[9px] mt-1 text-red-600">
                        Since this asset is currently allocated, you can re-submit to initiate a transfer request instead of direct allocation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#111827] text-white hover:bg-black py-2.5 rounded-lg text-xs font-semibold transition active:scale-[0.98]"
                >
                  Authorize custody transfer order &rarr;
                </button>
              </div>
            </form>
          </div>

          {/* Allocation Logs History (Lower Panel) */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h4 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
              Transfer Logs Chain
            </h4>

            <div className="divide-y divide-[#E5E7EB]">
              {transferHistory.map((item, index) => (
                <div key={index} className="py-3 flex items-center justify-between text-xs hover:bg-[#F3F4F6]/40 rounded-md px-2 transition">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#6B7280] bg-[#F3F4F6] p-1.5 rounded-lg text-[18px]">
                      swap_horiz
                    </span>
                    <div>
                      <p className="font-semibold text-[#111827]">{item.action}</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Asset: <span className="font-mono">{item.tag}</span> • From: {item.from} to {item.to}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-[#6B7280]">{item.date}</p>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Asset Details Sidebar (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
            <h4 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
              Equipment Profile
            </h4>

            {selectedAsset ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {selectedAsset.imageUrl ? (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-[#E5E7EB]">
                    <img
                      referrerPolicy="no-referrer"
                      src={selectedAsset.imageUrl}
                      alt={selectedAsset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-xl bg-[#F3F4F6] flex flex-col items-center justify-center text-[#6B7280]">
                    <span className="material-symbols-outlined text-4xl">{selectedAsset.icon}</span>
                    <span className="text-[10px] mt-2 font-medium">No Image Registered</span>
                  </div>
                )}

                <div>
                  <h5 className="font-semibold text-sm text-[#111827]">{selectedAsset.name}</h5>
                  <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">Tag: {selectedAsset.tag}</p>
                </div>

                <div className="divide-y divide-[#E5E7EB] text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#6B7280]">Category</span>
                    <span className="font-semibold text-[#111827]">{selectedAsset.category}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#6B7280]">Current Custodian</span>
                    <span className="font-semibold text-[#111827]">{selectedAsset.owner || 'Storage Hub'}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#6B7280]">Condition State</span>
                    <span className="font-semibold text-[#111827]">{selectedAsset.condition}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#6B7280]">Capital Pool Cost</span>
                    <span className="font-mono font-semibold text-[#111827]">${selectedAsset.acquisitionCost.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-[#6B7280] space-y-2">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                <p className="text-xs font-medium">No asset selected</p>
                <p className="text-[10px] opacity-80 leading-normal">Select an equipment item from the list to view its active custodian ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
