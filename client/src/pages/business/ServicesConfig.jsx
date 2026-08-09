import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function ServicesConfig() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(60);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description || '');
    setDurationMinutes(svc.durationMinutes);
    setIsActive(svc.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, {
          name,
          description,
          durationMinutes: Number(durationMinutes),
          isActive
        });
      } else {
        await api.post('/services', {
          name,
          description,
          durationMinutes: Number(durationMinutes),
          isActive
        });
      }
      await fetchServices();
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service from customer intake?')) return;
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading service configurations...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Services & Duration Config</h2>
          <p className="text-xs text-slate-400">Configure offerings and job durations used dynamically by the scheduling engine</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-roofing-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div key={svc.id} className={`bg-slate-900 border rounded-2xl p-6 space-y-4 transition-all flex flex-col justify-between ${
            svc.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">{svc.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  svc.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                }`}>
                  {svc.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{svc.description || 'No description provided.'}</p>
              
              <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Job Duration: {svc.durationMinutes >= 60 ? `${svc.durationMinutes / 60} hrs (${svc.durationMinutes}m)` : `${svc.durationMinutes} mins`}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(svc)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit</span>
              </button>
              {svc.isActive && (
                <button
                  onClick={() => handleDelete(svc.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Deactivate</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roof Repair"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-roofing-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Service description shown to customers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-roofing-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  min={15}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-roofing-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Common values: 60 (1 hr), 90 (1.5 hrs), 120 (2 hrs)</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-roofing-500 focus:ring-0"
                />
                <label htmlFor="active-toggle" className="text-slate-300 font-semibold">Active for customer scheduling</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
