import React, { useEffect, useState } from 'react';
import { Calendar, Search, Filter, Clock, MapPin, Phone, User, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected appointment for detail modal
  const [selectedApp, setSelectedApp] = useState(null);

  // Action state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      await fetchAppointments();
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = appointments.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      app.customer?.name?.toLowerCase().includes(q) ||
      app.customer?.phone?.includes(q) ||
      app.referenceNumber?.toLowerCase().includes(q) ||
      app.service?.name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading appointments schedule...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Appointments Schedule</h2>
          <p className="text-xs text-slate-400">View, reschedule, and manage scheduled service calls</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, ref, or service..."
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-roofing-500 w-full sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 font-semibold focus:outline-none focus:border-roofing-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Ref & Customer</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Date & Arrival</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No appointments matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-sky-400 block">{app.referenceNumber}</span>
                      <span className="font-bold text-white text-sm block">{app.customer?.name}</span>
                      <span className="text-[11px] text-slate-400 block">{app.customer?.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {app.service?.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate">
                      {app.customer?.address}, {app.customer?.city}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{app.date}</span>
                      <span className="font-mono text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded inline-block mt-0.5">
                        {app.estimatedArrival}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {app.durationMinutes} mins
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase border ${
                        app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'CONFIRMED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        app.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      
                      {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                          disabled={updatingId === app.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      )}

                      {app.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          disabled={updatingId === app.id}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-sky-400">{selectedApp.referenceNumber}</span>
                <h3 className="text-lg font-bold text-white">{selectedApp.service?.name}</h3>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="font-bold text-white text-sm">{selectedApp.customer?.name}</p>
                <p className="text-slate-400 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedApp.customer?.phone}</p>
                <p className="text-slate-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedApp.customer?.address}, {selectedApp.customer?.city} {selectedApp.customer?.zipCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Scheduled Date</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedApp.date}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Estimated Arrival</span>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">{selectedApp.estimatedArrival}</p>
                </div>
              </div>

              {selectedApp.notes && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Appointment Notes</span>
                  <p className="text-slate-300 text-xs mt-1">"{selectedApp.notes}"</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedApp(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
