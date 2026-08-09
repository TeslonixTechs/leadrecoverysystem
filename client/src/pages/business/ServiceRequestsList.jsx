import React, { useEffect, useState } from 'react';
import { FileText, Search, User, Phone, MapPin, AlertCircle, Camera, Calendar, Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function ServiceRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get('/service-requests');
        setRequests(res.data || []);
      } catch (err) {
        console.error('Error fetching service requests:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading incoming service requests...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Service Requests & Incoming Leads</h2>
        <p className="text-xs text-slate-400">View customer descriptions, urgency levels, photos, and linked appointment times</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No service requests received yet.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase border ${
                    req.urgency === 'EMERGENCY' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    req.urgency === 'URGENT' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {req.urgency} Urgency
                  </span>
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {req.service?.name}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <p className="font-bold text-white text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {req.customer?.name}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {req.customer?.phone}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {req.customer?.address}, {req.customer?.city}
                  </p>
                </div>

                {/* Problem Description */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Customer Description</span>
                  <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 italic leading-relaxed">
                    "{req.problemDescription}"
                  </p>
                </div>

                {/* Photos Thumbnails */}
                {req.photoUrls && req.photoUrls.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Attached Photos ({req.photoUrls.length})</span>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {req.photoUrls.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoModal(photo)}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-slate-800 shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <img src={photo} alt={`Photo ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Appointment Info Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Scheduled Arrival:</span>
                <span className="font-bold text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">
                  {req.appointment?.estimatedArrival || 'Unassigned'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Photo View Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full relative">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-lg hover:text-slate-300"
            >
              Close ✕
            </button>
            <img src={selectedPhotoModal} alt="Enlarged intake photo" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-slate-800" />
          </div>
        </div>
      )}

    </div>
  );
}
