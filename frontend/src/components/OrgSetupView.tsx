/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Department, Asset } from '../types';

interface OrgSetupViewProps {
  departments: Department[];
  assets: Asset[];
  onAddDepartment: (dept: Omit<Department, 'assetsCount'>) => void;
  searchQuery: string;
}

type TabType = 'departments' | 'categories' | 'members';

export default function OrgSetupView({
  departments,
  assets,
  onAddDepartment,
  searchQuery,
}: OrgSetupViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    id: '',
    head: '',
    parentDept: 'Technology Division',
    status: 'Active' as 'Active' | 'Inactive',
    icon: 'developer_board',
  });

  // Predefined icons list for selecting department icon
  const iconList = [
    { value: 'developer_board', label: 'Tech Board' },
    { value: 'palette', label: 'Design Palette' },
    { value: 'security', label: 'Shield' },
    { value: 'payments', label: 'Finance Cash' },
    { value: 'history_edu', label: 'Marketing Pen' },
    { value: 'fact_check', label: 'QA Checklist' },
    { value: 'handshake', label: 'HR Hands' },
  ];

  // Derived category list
  const categorySummary = Array.from(new Set(assets.map((a) => a.category))).map((cat) => {
    const catAssets = assets.filter((a) => a.category === cat);
    return {
      name: cat,
      count: catAssets.length,
      cost: catAssets.reduce((sum, a) => sum + a.acquisitionCost, 0),
    };
  });

  // Derived members list from assets owners
  const membersList = [
    { name: 'Sarah Jenkins', email: 's.jenkins@assetflow.com', dept: 'Software Engineering', role: 'Engineering Lead', status: 'Active' },
    { name: 'Michael Chen', email: 'm.chen@assetflow.com', dept: 'UI/UX Design', role: 'Design Principal', status: 'Active' },
    { name: 'Elena Rodriguez', email: 'e.rodriguez@assetflow.com', dept: 'Content Marketing', role: 'Content Lead', status: 'Active' },
    { name: 'David Vance', email: 'd.vance@assetflow.com', dept: 'Data Security', role: 'SecOps Architect', status: 'Active' },
    { name: 'Marcus Chen', email: 'marcus.c@assetflow.com', dept: 'Software Engineering', role: 'Senior Engineer', status: 'Active' },
    { name: 'Liam Thorne', email: 'liam.t@assetflow.com', dept: 'UI/UX Design', role: 'Visual Designer', status: 'Active' },
  ];

  // Filtering based on searchQuery and activeTab
  const filteredDepts = departments.filter((dept) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(query) ||
      dept.id.toLowerCase().includes(query) ||
      dept.head.toLowerCase().includes(query) ||
      dept.parentDept.toLowerCase().includes(query)
    );
  });

  const filteredCategories = categorySummary.filter((cat) => {
    if (!searchQuery) return true;
    return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMembers = membersList.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.dept.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.id || !newDept.head) {
      alert('Please fill out all mandatory fields.');
      return;
    }
    // Check if ID is unique
    if (departments.some((d) => d.id.toUpperCase() === newDept.id.toUpperCase())) {
      alert('Department ID already exists.');
      return;
    }

    onAddDepartment({
      id: newDept.id.toUpperCase(),
      name: newDept.name,
      head: newDept.head,
      parentDept: newDept.parentDept,
      status: newDept.status,
      icon: newDept.icon,
    });

    // Reset Form
    setNewDept({
      name: '',
      id: '',
      head: '',
      parentDept: 'Technology Division',
      status: 'Active',
      icon: 'developer_board',
    });
    setShowAddModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Organization Setup</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Manage cost centers, department categories, and personnel assignments.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition flex items-center justify-center gap-2 self-start cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Department
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-[#E5E7EB] flex gap-6">
        {[
          { id: 'departments', label: 'Departments & Divisions', icon: 'corporate_fare' },
          { id: 'categories', label: 'Category Mapping', icon: 'category' },
          { id: 'members', label: 'Team Members', icon: 'groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 pb-3.5 text-xs font-semibold transition-all border-b-2 relative cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
            <h3 className="text-sm font-semibold text-[#111827]">Core Departments</h3>
            <span className="text-[11px] text-[#6B7280] font-normal">
              Showing {filteredDepts.length} departments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Dept / ID</th>
                  <th className="py-4 px-6">Division Head</th>
                  <th className="py-4 px-6">Parent Division</th>
                  <th className="py-4 px-6 text-center">Managed Assets</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredDepts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#6B7280] font-normal">
                      No departments match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDepts.map((dept) => (
                    <tr key={dept.id} className="hover:bg-[#F9FAFB] text-xs transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]">
                            <span className="material-symbols-outlined text-[18px]">{dept.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#111827]">{dept.name}</p>
                            <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{dept.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#111827]">{dept.head}</td>
                      <td className="py-4 px-6 font-normal text-[#6B7280]">{dept.parentDept}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-1 rounded-full font-mono font-semibold text-[#111827]">
                          {dept.assetsCount}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            dept.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dept.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          ></span>
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => alert(`Direct configuration for ${dept.name} is a premium module.`)}
                          className="p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#E5E7EB] flex justify-between items-center text-[10px] font-semibold text-[#6B7280]">
            <span>Showing {filteredDepts.length} of {departments.length} rows</span>
            <div className="flex gap-1.5">
              <button disabled className="px-3 py-1.5 border border-[#E5E7EB] bg-[#F3F4F6] text-gray-400 rounded-lg cursor-not-allowed">Previous</button>
              <button disabled className="px-3 py-1.5 border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-[#F3F4F6] text-[#111827]">
                  <span className="material-symbols-outlined text-[20px]">
                    {cat.name === 'IT Equipment'
                      ? 'laptop_mac'
                      : cat.name === 'Hardware'
                      ? 'print'
                      : cat.name === 'Furniture'
                      ? 'chair'
                      : cat.name === 'Media'
                      ? 'camera'
                      : 'category'}
                  </span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                  {cat.count} Units
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">{cat.name}</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5 font-normal">Asset classification mapping group</p>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] flex justify-between items-center">
                <span className="text-[10px] text-[#6B7280] font-normal">Cumulative Cost Pool</span>
                <span className="text-xs font-mono font-semibold text-[#111827]">
                  ${cat.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Name / Contact</th>
                  <th className="py-4 px-6">Allocated Department</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredMembers.map((m, index) => (
                  <tr key={index} className="hover:bg-[#F9FAFB] text-xs transition">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-[#111827]">{m.name}</p>
                        <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">{m.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#111827]">{m.dept}</td>
                    <td className="py-4 px-6 text-[#6B7280] font-normal">{m.role}</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-[#111827] hover:underline text-xs font-semibold cursor-pointer">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827] text-sm">Add New Department</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Legal Operations"
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Dept ID (Unique Tag) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDept.id}
                    onChange={(e) => setNewDept({ ...newDept, id: e.target.value })}
                    placeholder="e.g. DEPT-007"
                    className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Parent Division
                  </label>
                  <select
                    value={newDept.parentDept}
                    onChange={(e) => setNewDept({ ...newDept, parentDept: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
                  >
                    <option>Technology Division</option>
                    <option>Corporate Operations</option>
                    <option>Growth & Sales</option>
                    <option>Finance Division</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Department Head *
                </label>
                <input
                  type="text"
                  required
                  value={newDept.head}
                  onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  placeholder="Full Name"
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Icon Symbol
                  </label>
                  <select
                    value={newDept.icon}
                    onChange={(e) => setNewDept({ ...newDept, icon: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
                  >
                    {iconList.map((ic) => (
                      <option key={ic.value} value={ic.value}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Status
                  </label>
                  <select
                    value={newDept.status}
                    onChange={(e) => setNewDept({ ...newDept, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg text-xs font-semibold text-[#6B7280] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
