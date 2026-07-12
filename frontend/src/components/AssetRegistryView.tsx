/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Asset, AssetStatus, Department } from '../types';

interface AssetRegistryViewProps {
  assets: Asset[];
  departments: Department[];
  onAddAsset: (asset: Asset) => void;
  searchQuery: string;
  triggerAddModal?: boolean;
  onModalClosed?: () => void;
}

export default function AssetRegistryView({
  assets,
  departments,
  onAddAsset,
  searchQuery,
  triggerAddModal = false,
  onModalClosed,
}: AssetRegistryViewProps) {
  const [showAddModal, setShowAddModal] = useState(triggerAddModal);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for registering a new asset
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'IT Equipment',
    status: 'Available' as AssetStatus,
    location: '',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    condition: 'New' as 'New' | 'Good' | 'Fair' | 'Poor',
    isShared: true,
    isBookable: true,
    department: 'Software Engineering',
    imagePreviewUrl: '',
  });

  // Watch prop trigger for opening add modal (e.g., from header button shortcut)
  React.useEffect(() => {
    if (triggerAddModal) {
      setShowAddModal(true);
    }
  }, [triggerAddModal]);

  const handleCloseModal = () => {
    setShowAddModal(false);
    if (onModalClosed) onModalClosed();
  };

  // Filter Categories list
  const categories = ['All', ...Array.from(new Set(assets.map((a) => a.category)))];
  // Filter Statuses list
  const statuses = ['All', 'Available', 'Allocated', 'In Use', 'Maintenance', 'Missing', 'Damaged'];

  // Apply search and filters
  const filteredAssets = assets.filter((asset) => {
    // 1. Category Filter
    if (filterCategory !== 'All' && asset.category !== filterCategory) return false;
    // 2. Status Filter
    if (filterStatus !== 'All' && asset.status !== filterStatus) return false;
    // 3. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.tag.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        asset.location.toLowerCase().includes(q) ||
        (asset.owner && asset.owner.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Drag and Drop files handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewAsset({ ...newAsset, imagePreviewUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (PNG/JPG).');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.location || !newAsset.serialNumber || !newAsset.acquisitionCost) {
      alert('Please fill out all required fields.');
      return;
    }

    // Auto-generate tag code
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tag = `#AST-${randomNum}`;

    const iconMap: Record<string, string> = {
      'IT Equipment': 'laptop_mac',
      'Hardware': 'print',
      'Furniture': 'chair',
      'Media': 'camera',
    };

    const finalAsset: Asset = {
      tag,
      name: newAsset.name,
      category: newAsset.category,
      status: newAsset.status,
      location: newAsset.location,
      icon: iconMap[newAsset.category] || 'inventory_2',
      serialNumber: newAsset.serialNumber.toUpperCase(),
      acquisitionDate: newAsset.acquisitionDate,
      acquisitionCost: parseFloat(newAsset.acquisitionCost) || 0.00,
      condition: newAsset.condition,
      isShared: newAsset.isShared,
      isBookable: newAsset.isBookable,
      department: newAsset.department,
      imageUrl: newAsset.imagePreviewUrl || undefined,
      owner: newAsset.status === 'Available' ? undefined : 'Unassigned Tech',
    };

    onAddAsset(finalAsset);

    // Reset Form State
    setNewAsset({
      name: '',
      category: 'IT Equipment',
      status: 'Available',
      location: '',
      serialNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: '',
      condition: 'New',
      isShared: true,
      isBookable: true,
      department: 'Software Engineering',
      imagePreviewUrl: '',
    });

    handleCloseModal();
  };

  const getStatusStyle = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700';
      case 'Allocated':
      case 'In Use':
        return 'bg-blue-50 text-blue-700';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700';
      case 'Damaged':
        return 'bg-red-50 text-red-700';
      case 'Missing':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Asset Registry</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Comprehensive ledger and life cycle tracking of corporate real property.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs flex items-center justify-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[16px]">add_box</span>
          Register Asset
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="space-y-1.5 w-full sm:w-44">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Category</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1.5 w-full sm:w-44">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6B7280] font-normal self-end md:self-center">
          Showing <span className="font-semibold text-[#111827]">{filteredAssets.length}</span> of{' '}
          <span className="font-semibold text-[#111827]">{assets.length}</span> recorded assets
        </div>
      </div>

      {/* Assets Grid/List Canvas */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F3F4F6]/50 text-[#6B7280] text-[10px] font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Asset Tag / Name</th>
                <th className="py-4 px-6">Classification</th>
                <th className="py-4 px-6">Acquisition Info</th>
                <th className="py-4 px-6">Current Location</th>
                <th className="py-4 px-6">Condition</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B7280]">
                    No registered assets found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.tag} className="hover:bg-[#F3F4F6]/20 text-xs">
                    {/* Tag / Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] overflow-hidden flex items-center justify-center text-[#111827] shrink-0">
                          {asset.imageUrl ? (
                            <img referrerPolicy="no-referrer" src={asset.imageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">{asset.icon}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">{asset.name}</p>
                          <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{asset.tag}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 font-medium text-[#111827]">{asset.category}</td>

                    {/* Acquisition */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-[#111827]">${asset.acquisitionCost.toFixed(2)}</p>
                      <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{asset.acquisitionDate}</p>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-[#6B7280] font-medium">
                        <span className="material-symbols-outlined text-[15px] shrink-0">location_on</span>
                        <span>{asset.location}</span>
                      </div>
                      {asset.owner && (
                        <p className="text-[10px] text-[#111827] font-medium mt-0.5">Holder: {asset.owner}</p>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827]">
                        {asset.condition}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusStyle(asset.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {asset.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert(`Reviewing asset lifecycle audit trails for ${asset.tag}.`)}
                          className="px-2.5 py-1 text-[10px] bg-white text-[#111827] font-semibold rounded border border-[#E5E7EB] hover:bg-[#F3F4F6] transition"
                        >
                          Audit Log
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-6 my-8 space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827] text-base">Register Corporate Asset</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    placeholder="e.g. MacBook Pro 14"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Asset Category *
                  </label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                  >
                    <option>IT Equipment</option>
                    <option>Hardware</option>
                    <option>Furniture</option>
                    <option>Media</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    placeholder="e.g. SN-99201D"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none font-mono uppercase transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Assigned Division
                  </label>
                  <select
                    value={newAsset.department}
                    onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Cost Pool ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAsset.acquisitionCost}
                    onChange={(e) => setNewAsset({ ...newAsset, acquisitionCost: e.target.value })}
                    placeholder="2500.00"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Condition State
                  </label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as 'New' | 'Good' | 'Fair' | 'Poor' })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                  >
                    <option>New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Physical Location Room/Floor *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    placeholder="e.g. London Office Room 402"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    value={newAsset.acquisitionDate}
                    onChange={(e) => setNewAsset({ ...newAsset, acquisitionDate: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:border-[#D1D5DB] outline-none"
                  />
                </div>
              </div>

              {/* Toggle controls */}
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAsset.isShared}
                    onChange={(e) => setNewAsset({ ...newAsset, isShared: e.target.checked })}
                    className="rounded border-[#E5E7EB] text-[#111827] focus:ring-[#111827]"
                  />
                  <span>Is Shared Resource</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAsset.isBookable}
                    onChange={(e) => setNewAsset({ ...newAsset, isBookable: e.target.checked })}
                    className="rounded border-[#E5E7EB] text-[#111827] focus:ring-[#111827]"
                  />
                  <span>Is Bookable Slot</span>
                </label>
              </div>

              {/* Photo Upload Area supporting click & drag/drop */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Asset Photo Upload
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
                    dragActive ? 'border-[#111827] bg-[#F3F4F6]' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {newAsset.imagePreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        referrerPolicy="no-referrer"
                        src={newAsset.imagePreviewUrl}
                        alt="Preview"
                        className="mx-auto h-20 w-25 object-cover rounded-md border border-[#E5E7EB]"
                      />
                      <p className="text-[10px] text-emerald-600 font-bold">Image loaded successfully</p>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-3xl text-[#6B7280]">cloud_upload</span>
                      <p className="text-xs font-medium text-[#111827] mt-1.5">
                        Drag & drop file here or <span className="text-[#3c40c6] underline">browse</span>
                      </p>
                      <p className="text-[9px] text-[#6B7280] mt-0.5">Supports PNG, JPG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg text-xs font-semibold text-[#6B7280] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold transition"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
