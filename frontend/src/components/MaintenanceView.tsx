/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Asset, MaintenanceTicket } from '../types';

interface MaintenanceViewProps {
  maintenanceTickets: MaintenanceTicket[];
  assets: Asset[];
  onAddTicket: (ticket: MaintenanceTicket) => void;
  onUpdateTicketStatus: (id: string, newStatus: MaintenanceTicket['status'], technician?: string) => void;
  onResolveTicket: (id: string, assetTag: string) => void;
  searchQuery: string;
  triggerAddModal?: boolean;
  onModalClosed?: () => void;
}

export default function MaintenanceView({
  maintenanceTickets,
  assets,
  onAddTicket,
  onUpdateTicketStatus,
  onResolveTicket,
  searchQuery,
  triggerAddModal = false,
  onModalClosed,
}: MaintenanceViewProps) {
  const [showAddModal, setShowAddModal] = useState(triggerAddModal);
  const [filterPriority, setFilterPriority] = useState('All');
  const [newTicket, setNewTicket] = useState({
    assetTag: '',
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    details: '',
  });

  // Watch modal trigger
  React.useEffect(() => {
    if (triggerAddModal) {
      setShowAddModal(true);
    }
  }, [triggerAddModal]);

  const handleCloseModal = () => {
    setShowAddModal(false);
    if (onModalClosed) onModalClosed();
  };

  // Filtered tickets based on search and priority
  const filteredTickets = maintenanceTickets.filter((ticket) => {
    // Priority filter
    if (filterPriority !== 'All' && ticket.priority !== filterPriority) return false;
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q) ||
        ticket.assetTag.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        (ticket.technicianName && ticket.technicianName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Kanban columns
  const columns: { id: MaintenanceTicket['status']; label: string; bg: string; border: string; text: string }[] = [
    { id: 'PENDING', label: 'Pending Review', bg: 'bg-[#F9FAFB]', border: 'border-[#E5E7EB]', text: 'text-[#EF4444]' },
    { id: 'APPROVED', label: 'Approved Requests', bg: 'bg-[#F9FAFB]', border: 'border-[#E5E7EB]', text: 'text-[#3B82F6]' },
    { id: 'TECHNICIAN_ASSIGNED', label: 'Tech Assigned', bg: 'bg-[#F9FAFB]', border: 'border-[#E5E7EB]', text: 'text-[#F59E0B]' },
    { id: 'IN_PROGRESS', label: 'Active Repairs', bg: 'bg-[#F9FAFB]', border: 'border-[#E5E7EB]', text: 'text-[#10B981]' },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.assetTag || !newTicket.title || !newTicket.description) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const randomId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: MaintenanceTicket = {
      id: randomId,
      assetTag: newTicket.assetTag,
      title: newTicket.title,
      description: newTicket.description,
      status: 'PENDING',
      timeAgo: 'Just now',
      priority: newTicket.priority,
      details: newTicket.details,
    };

    onAddTicket(ticket);

    // Reset Form
    setNewTicket({
      assetTag: '',
      title: '',
      description: '',
      priority: 'medium',
      details: '',
    });

    handleCloseModal();
  };

  const handleNextStatus = (ticket: MaintenanceTicket) => {
    if (ticket.status === 'PENDING') {
      onUpdateTicketStatus(ticket.id, 'APPROVED');
    } else if (ticket.status === 'APPROVED') {
      const techName = prompt('Enter the name of the assigned technician:', 'Jaydev Prajapati') || 'Marcus Chen';
      onUpdateTicketStatus(ticket.id, 'TECHNICIAN_ASSIGNED', techName);
    } else if (ticket.status === 'TECHNICIAN_ASSIGNED') {
      onUpdateTicketStatus(ticket.id, 'IN_PROGRESS', ticket.technicianName);
    } else if (ticket.status === 'IN_PROGRESS') {
      if (confirm(`Do you want to complete repair ticket ${ticket.id} and return asset ${ticket.assetTag} to service?`)) {
        onResolveTicket(ticket.id, ticket.assetTag);
      }
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-[#EF4444] border border-red-100';
      case 'medium':
        return 'bg-amber-50 text-[#F59E0B] border border-amber-100';
      case 'low':
        return 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8 h-[calc(100vh-90px)] flex flex-col"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Maintenance Pipeline</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Track active machinery repair tasks, service calls, and firmware update schedules.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs flex items-center justify-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[16px]">build</span>
          File Request
        </button>
      </div>

      {/* Filter and board stats */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#6B7280]">Filter Priority:</span>
          {['All', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filterPriority === p ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#6B7280] font-normal">
          Active Backlog: <span className="font-semibold text-[#111827]">{filteredTickets.length} Tickets</span>
        </span>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto pb-4">
        {columns.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col gap-3 min-h-[400px] h-full overflow-y-auto`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className={`text-xs font-semibold uppercase tracking-wider ${col.text}`}>
                  {col.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.text} bg-white border border-[#E5E7EB]`}>
                  {colTickets.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {colTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    layoutId={ticket.id}
                    className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#D1D5DB] transition duration-200 cursor-pointer flex flex-col gap-3 group relative"
                    onClick={() => handleNextStatus(ticket)}
                  >
                    {/* Priority & Ticket ID */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-semibold text-[#6B7280]">{ticket.id}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-medium rounded capitalize ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-xs font-semibold text-[#111827] group-hover:underline">{ticket.title}</h4>
                      <p className="text-[10px] text-[#6B7280] mt-1 line-clamp-2 leading-relaxed font-normal">{ticket.description}</p>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-[10px] text-[#6B7280]">
                      <span className="font-mono font-semibold text-[#111827]">{ticket.assetTag}</span>
                      <span>{ticket.timeAgo}</span>
                    </div>

                    {/* Technician assign details */}
                    {ticket.technicianName && (
                      <div className="bg-[#F3F4F6] p-1.5 rounded-md flex items-center justify-between text-[9px] text-[#111827] font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">engineering</span>
                          {ticket.technicianName}
                        </span>
                        {ticket.eta && <span className="bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB] font-mono text-[9px] text-[#6B7280]">{ticket.eta}</span>}
                      </div>
                    )}

                    {/* Action Hint Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 rounded-xl flex items-center justify-center transition">
                      <span className="bg-[#111827] text-white text-[9px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        {ticket.status === 'IN_PROGRESS' ? 'Resolve Task' : 'Promote Status'}
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                      </span>
                    </div>
                  </motion.div>
                ))}

                {colTickets.length === 0 && (
                  <div className="flex-1 border border-dashed border-[#E5E7EB] rounded-xl flex items-center justify-center p-8 text-center text-[10px] text-[#6B7280]">
                    No active tickets in this phase.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Maintenance Request Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827] text-base">Raise Repair Ticket</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Select Target Equipment *
                </label>
                <select
                  required
                  value={newTicket.assetTag}
                  onChange={(e) => setNewTicket({ ...newTicket, assetTag: e.target.value })}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  <option value="">-- Choose Asset Tag --</option>
                  {assets.map((asset) => (
                    <option key={asset.tag} value={asset.tag}>
                      {asset.tag} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Issue Summary Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. Broken screen or Fan noise"
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Priority Risk
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  <option value="high">High Risk (Downtime Imminent)</option>
                  <option value="medium">Medium Risk (Operational Lag)</option>
                  <option value="low">Low Risk (Minor Cosmetic/Align)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Detailed Diagnostic Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide precise details of alignment flaws, failure messages, or error logs..."
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none resize-none transition"
                />
              </div>

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
                  Open Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
