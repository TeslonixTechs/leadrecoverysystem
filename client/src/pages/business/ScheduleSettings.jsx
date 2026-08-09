import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Save, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../../api/client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleSettings() {
  const [hours, setHours] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [bufferMinutes, setBufferMinutes] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add Blocked Modal
  const [blockTitle, setBlockTitle] = useState('Lunch Break');
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockStart, setBlockStart] = useState('12:00');
  const [blockEnd, setBlockEnd] = useState('13:00');
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/schedule');
      setHours(res.data.businessHours || []);
      setBlockedTimes(res.data.blockedTimes || []);
      setBufferMinutes(res.data.travelBufferMinutes || 30);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleHourChange = (dayOfWeek, field, value) => {
    setHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/schedule/hours', { hours });
      await api.put('/business', { travelBufferMinutes: Number(bufferMinutes) });
      setSuccessMsg('Schedule operating hours and travel buffer updated successfully!');
    } catch (err) {
      console.error('Error saving schedule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedTime = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedule/blocked-time', {
        title: blockTitle,
        date: blockDate,
        startTime: blockStart,
        endTime: blockEnd,
        isRecurring: true
      });
      await fetchSchedule();
      setBlockModalOpen(false);
    } catch (err) {
      console.error('Error adding blocked time:', err);
    }
  };

  const handleDeleteBlockedTime = async (id) => {
    try {
      await api.delete(`/schedule/blocked-time/${id}`);
      await fetchSchedule();
    } catch (err) {
      console.error('Error deleting blocked time:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading schedule settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Schedule & Availability Settings</h2>
          <p className="text-xs text-slate-400">Manage business operating hours, travel buffers, and recurring lunch/break blocks</p>
        </div>

        <button
          onClick={handleSaveHours}
          disabled={saving}
          className="bg-roofing-500 hover:bg-roofing-600 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-roofing-500/25"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Schedule Settings'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Travel Buffer Settings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" /> Travel & Buffer Time Config
        </h3>
        <p className="text-xs text-slate-400">
          Required buffer time added before/after appointments for travel and setup. Prevents impossible back-to-back scheduling.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <div className="w-48">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Buffer Time (Minutes)</label>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-roofing-500 font-bold"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Default)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Hours Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base text-white">Weekly Business Operating Hours</h3>

        <div className="space-y-3 divide-y divide-slate-800/60">
          {DAYS.map((dayName, idx) => {
            const h = hours.find(item => item.dayOfWeek === idx) || { dayOfWeek: idx, isOpen: false, openTime: '08:00', closeTime: '18:00' };
            return (
              <div key={idx} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="w-32 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${idx}`}
                    checked={h.isOpen}
                    onChange={(e) => handleHourChange(idx, 'isOpen', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-roofing-500 focus:ring-0"
                  />
                  <label htmlFor={`day-${idx}`} className={`font-bold ${h.isOpen ? 'text-white' : 'text-slate-500'}`}>
                    {dayName}
                  </label>
                </div>

                {h.isOpen ? (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Open:</span>
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:border-roofing-500 font-mono"
                    />
                    <span className="text-slate-400">Close:</span>
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:border-roofing-500 font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-slate-500 font-semibold italic">CLOSED</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Times Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Blocked Periods & Lunch Breaks</h3>
            <p className="text-xs text-slate-400">Periods during which no customer appointments can be booked</p>
          </div>

          <button
            onClick={() => setBlockModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Blocked Period</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {blockedTimes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No blocked periods configured.</p>
          ) : (
            blockedTimes.map((b) => (
              <div key={b.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm block">{b.title}</span>
                  <span className="text-slate-400">Date: {b.date} • Hours: <span className="font-mono text-amber-400">{b.startTime} - {b.endTime}</span></span>
                </div>
                <button
                  onClick={() => handleDeleteBlockedTime(b.id)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Blocked Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Blocked Period</h3>
              <button onClick={() => setBlockModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddBlockedTime} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Reason *</label>
                <input
                  type="text"
                  required
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="Lunch Break"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-roofing-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-roofing-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-roofing-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-roofing-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="bg-slate-800 text-slate-300 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Add Blocked Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
