/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Booking, Asset } from '../types';

interface BookingViewProps {
  bookings: Booking[];
  assets: Asset[];
  onAddBooking: (booking: Booking) => Promise<{ success: boolean, error?: any }>;
  onRemoveBooking: (id: string) => void;
  triggerAddModal?: boolean;
  onModalClosed?: () => void;
}

export default function BookingView({
  bookings,
  assets,
  onAddBooking,
  onRemoveBooking,
  triggerAddModal = false,
  onModalClosed,
}: BookingViewProps) {
  const [selectedRoom, setSelectedRoom] = useState('Boardroom Delta');
  const [showAddModal, setShowAddModal] = useState(triggerAddModal);

  // Form Booking values
  const [newBooking, setNewBooking] = useState({
    title: '',
    timeFrom: '09:00',
    timeTo: '10:00',
    teamName: '',
    date: '2023-10-24',
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

  const rooms = [
    { name: 'Boardroom Delta', cap: 16, info: 'A/V Integrated, Main Floor' },
    { name: 'Conference Room Sigma', cap: 8, info: 'Wallboard and Smart TV' },
    { name: 'Creative Studio Hub', cap: 12, info: 'Direct physical assets workspace' },
    { name: 'Focus Pod Alpha', cap: 2, info: 'Single-User acoustic booth' },
  ];

  // Map 24-hour schedules to vertical timeline slots (from 08:00 to 18:00)
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Convert "HH:MM" to float hour
  const timeToFloat = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  // Check overlap collision
  const checkCollision = (from: string, to: string) => {
    const fromF = timeToFloat(from);
    const toF = timeToFloat(to);

    return bookings.some((b) => {
      const bFromF = timeToFloat(b.timeFrom);
      const bToF = timeToFloat(b.timeTo);
      return (fromF < bToF && toF > bFromF);
    });
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.title || !newBooking.teamName) {
      alert('Please fill out all fields.');
      return;
    }

    const booking: Booking = {
      id: `book-${Date.now()}`,
      title: newBooking.title,
      timeFrom: newBooking.timeFrom,
      timeTo: newBooking.timeTo,
      date: newBooking.date,
      teamName: newBooking.teamName,
      resource: selectedRoom
    };

    const res = await onAddBooking(booking);

    // Reset Form
    setNewBooking({
      title: '',
      timeFrom: '09:00',
      timeTo: '10:00',
      teamName: '',
      date: '2023-10-24',
    });

    handleCloseModal();

    if (res && !res.success) {
      const conflict = res.error.conflictingBooking;
      alert(`⚠️ Overlapping Time Conflict Warning! Your booking overlaps with an existing reservation: "${conflict ? conflict.title : 'Conflict'}" booked by "${conflict ? conflict.teamName : 'Unknown'}" on ${booking.date} (${conflict ? conflict.timeFrom : ''} - ${conflict ? conflict.timeTo : ''}). It has been flagged in red on the schedule.`);
    } else {
      alert('Reservation slot secured successfully!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">Resource Scheduler</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-normal">
            Reserve boardrooms, audio equipment arrays, and operational lab stations.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs flex items-center justify-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[16px]">event_available</span>
          Book a Slot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Rooms Selection list */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Select Resource</h3>
          <div className="flex flex-col gap-2">
            {rooms.map((room) => {
              const isSelected = selectedRoom === room.name;
              return (
                <button
                  key={room.name}
                  onClick={() => setSelectedRoom(room.name)}
                  className={`w-full p-4 text-left rounded-2xl border transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#F3F4F6] border-[#D1D5DB] text-[#111827]'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs text-[#111827]">{room.name}</span>
                    <span className="text-[10px] font-semibold bg-[#E5E7EB] px-2 py-0.5 rounded text-[#111827]">
                      Cap: {room.cap}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-80 font-normal leading-normal">{room.info}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Timeline Grid */}
        <div className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4">
            <div>
              <h4 className="text-sm font-semibold text-[#111827]">{selectedRoom} Schedule</h4>
              <p className="text-[10px] text-[#6B7280] font-medium">October 24, 2023 (Operational Cycle)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-[#6B7280]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#E5E7EB] inline-block" /> Secured
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-100 border border-red-200 inline-block" /> Conflict Zone
              </span>
            </div>
          </div>

          {/* Interactive hour timeline canvas */}
          <div className="relative border border-[#E5E7EB] rounded-xl bg-[#F9FAFB] p-4">
            {/* Hour markers & Grid cells */}
            <div className="space-y-0 timeline-grid relative">
              {hours.map((hour, idx) => (
                <div key={idx} className="h-16 flex items-start border-t border-[#E5E7EB]/50 pt-1.5 text-[10px] font-mono text-[#6B7280] font-medium relative">
                  <span className="w-12">{hour}</span>
                  <div className="flex-1 h-full border-l border-[#E5E7EB]/50 relative" />
                </div>
              ))}

              {/* Placed Bookings Blocks */}
              {bookings.map((booking) => {
                const startHour = timeToFloat(booking.timeFrom);
                const endHour = timeToFloat(booking.timeTo);
                const duration = endHour - startHour;

                // Scale positions. Let 08:00 be top: 0px. Each hour is 64px (h-16)
                const topOffset = (startHour - 8) * 64 + 6; // slightly adjusted for padding
                const heightVal = duration * 64 - 4;

                // Avoid negative or weird dimensions
                if (topOffset < 0 || heightVal < 10) return null;

                return (
                  <div
                    key={booking.id}
                    style={{ top: `${topOffset}px`, height: `${heightVal}px` }}
                    className={`absolute left-16 right-4 rounded-xl px-4 py-2.5 border flex flex-col justify-between transition-all group ${
                      booking.isConflict
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : booking.isLocked
                        ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'
                        : 'bg-[#E5E7EB] border-[#D1D5DB] text-[#111827] hover:bg-[#D1D5DB]/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-semibold truncate pr-4">{booking.title}</h5>
                        {!booking.isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Cancel this room reservation?')) {
                                onRemoveBooking(booking.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[10px] bg-white hover:bg-red-50 text-red-600 px-2 py-0.5 rounded border border-[#E5E7EB] font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                        {booking.timeFrom} - {booking.timeTo} • Team: {booking.teamName}
                      </p>
                    </div>

                    {booking.isConflict && (
                      <span className="text-[9px] font-bold text-[#ba1a1a] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Overlapping Slot Collision
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Current Simulated Time indicator */}
              <div
                style={{ top: `${(10.25 - 8) * 64 + 6}px` }}
                className="absolute left-12 right-0 border-t-2 border-dashed border-red-400 z-10 flex items-center"
              >
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-r-md leading-none select-none">
                  Simulated Time: 10:15
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Booking Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#111827] text-base">Book Space Slot</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Select Room Target
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none font-medium text-[#111827]"
                >
                  {rooms.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} (Cap: {r.cap})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Meeting Subject Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBooking.title}
                  onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                  placeholder="e.g. Project Delta Planning"
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Start Time *
                  </label>
                  <select
                    value={newBooking.timeFrom}
                    onChange={(e) => setNewBooking({ ...newBooking, timeFrom: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none text-[#111827] font-medium"
                  >
                    <option>08:00</option>
                    <option>09:00</option>
                    <option>09:30</option>
                    <option>10:00</option>
                    <option>10:30</option>
                    <option>11:00</option>
                    <option>11:30</option>
                    <option>12:00</option>
                    <option>13:00</option>
                    <option>14:00</option>
                    <option>15:00</option>
                    <option>16:00</option>
                    <option>17:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    End Time *
                  </label>
                  <select
                    value={newBooking.timeTo}
                    onChange={(e) => setNewBooking({ ...newBooking, timeTo: e.target.value })}
                    className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs focus:bg-white focus:border-[#D1D5DB] outline-none text-[#111827] font-medium"
                  >
                    <option>09:00</option>
                    <option>09:30</option>
                    <option>10:00</option>
                    <option>10:30</option>
                    <option>11:00</option>
                    <option>11:30</option>
                    <option>12:00</option>
                    <option>13:00</option>
                    <option>14:00</option>
                    <option>15:00</option>
                    <option>16:00</option>
                    <option>16:30</option>
                    <option>17:00</option>
                    <option>18:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Host Team / Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBooking.teamName}
                  onChange={(e) => setNewBooking({ ...newBooking, teamName: e.target.value })}
                  placeholder="e.g. Design Studio Crew"
                  className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition"
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
                  Book Slot
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
