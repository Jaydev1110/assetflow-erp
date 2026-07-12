/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Asset } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  assets: Asset[];
  onUpdateProfile: (name: string, role: string) => void;
}

export default function ProfileView({ user, assets, onUpdateProfile }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [isEditing, setIsEditing] = useState(false);

  // Filter assets currently held by this user
  const userAssets = assets.filter((a) => a.owner?.toLowerCase() === user.name.toLowerCase());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, role);
    setIsEditing(false);
    alert('Operational profile updated successfully!');
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
        <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">User Profile Workspace</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-normal">
          Review personal settings, system authorization levels, and active asset custody ledgers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Info update */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-[#E5E7EB] mx-auto">
              <img referrerPolicy="no-referrer" src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#111827]">{user.name}</h3>
              <p className="text-xs text-[#1D4ED8] font-semibold bg-blue-50 px-2.5 py-1 rounded-full mt-1.5 inline-block border border-blue-100">
                {user.role}
              </p>
              <p className="text-[10px] text-[#6B7280] font-mono mt-1.5">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg text-xs font-semibold text-[#111827] transition cursor-pointer"
              >
                Edit Operational Details
              </button>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Assigned assets list (Custody Ledger) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
          <h4 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Your Active Custody Ledger
          </h4>

          {userAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280] space-y-2">
              <span className="material-symbols-outlined text-4xl text-[#D1D5DB]">inventory_2</span>
              <p className="font-semibold text-[#111827]">No equipment currently assigned to your direct custody.</p>
              <p className="text-[11px] leading-relaxed max-w-sm mx-auto font-normal">
                Assets allocated to you by department managers or system administrators will show up in this ledger.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {userAssets.map((asset) => (
                <div key={asset.tag} className="py-4 flex items-center justify-between text-xs hover:bg-[#F9FAFB] rounded-xl px-3 transition">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined bg-[#F3F4F6] p-2.5 rounded-xl text-[#111827]">
                      {asset.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-[#111827]">{asset.name}</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5 font-mono">
                        Tag: {asset.tag} • Class: {asset.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {asset.status}
                    </span>
                    <p className="text-[10px] text-[#6B7280] font-normal">{asset.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
