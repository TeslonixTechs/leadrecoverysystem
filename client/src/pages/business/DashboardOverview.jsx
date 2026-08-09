import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, CheckCircle2, XCircle, Clock, ArrowRight, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, reqRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/service-requests')
        ]);
        setAppointments(appRes.data || []);
        setRequests(reqRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'CANCELLED');
  const newRequests = requests.filter(r => r.status === 'NEW' || r.status === 'SCHEDULED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');

  // Find next upcoming appointment today or future
  const nextAppointment = appointments
    .filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading dashboard metrics...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-roofing-500/10 text-roofing-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{todayAppointments.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Scheduled for {todayStr}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Requests</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{newRequests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Pending/scheduled leads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{completedAppointments.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Finished service calls</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cancelled / Void</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{cancelledAppointments.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Cancelled slots</p>
        </div>

      </div>

      {/* Highlight Card: Next Appointment */}
      {nextAppointment && (
        <div className="bg-gradient-to-r from-roofing-900/80 via-slate-900 to-slate-900 border border-roofing-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-roofing-500/20 text-roofing-300 text-xs font-bold px-3 py-1 rounded-full border border-roofing-500/30">
                <Clock className="w-3.5 h-3.5" /> Next Scheduled Appointment
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                {nextAppointment.estimatedArrival} <span className="text-base font-normal text-slate-400">({nextAppointment.date})</span>
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                  {nextAppointment.service?.name}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" /> {nextAppointment.customer?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {nextAppointment.customer?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {nextAppointment.customer?.address}, {nextAppointment.customer?.city}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/appointments')}
              className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-roofing-500/30"
            >
              <span>Manage Appointments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Today's Appointments & Incoming Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Schedule Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-roofing-400" /> Today's Schedule
            </h3>
            <button
              onClick={() => navigate('/dashboard/appointments')}
              className="text-xs font-semibold text-roofing-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((app) => (
                <div key={app.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        {app.estimatedArrival}
                      </span>
                      <span className="font-bold text-sm text-white">{app.service?.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{app.customer?.name} • {app.customer?.address}, {app.customer?.city}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${
                    app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    app.status === 'IN_PROGRESS' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Leads Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" /> Incoming Requests & Leads
            </h3>
            <button
              onClick={() => navigate('/dashboard/requests')}
              className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
            >
              View Requests <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No service requests received yet.</p>
          ) : (
            <div className="space-y-2.5">
              {requests.slice(0, 4).map((req) => (
                <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{req.customer?.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      req.urgency === 'EMERGENCY' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      req.urgency === 'URGENT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-1">"{req.problemDescription}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Requested: {req.service?.name}</span>
                    <span className="text-sky-400 font-medium">Arrival: {req.appointment?.estimatedArrival || 'TBD'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
