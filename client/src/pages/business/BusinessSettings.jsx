import React, { useEffect, useState } from 'react';
import { Building, Phone, Mail, MapPin, Shield, Save, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function BusinessSettings() {
  const { updateBusinessState } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [arrivalWindowType, setArrivalWindowType] = useState('ESTIMATED_WINDOW');

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await api.get('/business');
        setBusiness(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setEmail(res.data.email || '');
        setAddress(res.data.address || '');
        setServiceArea(res.data.serviceArea || '');
        setEmergencyEnabled(res.data.emergencyEnabled ?? true);
        setArrivalWindowType(res.data.arrivalWindowType || 'ESTIMATED_WINDOW');
      } catch (err) {
        console.error('Error fetching business settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/business', {
        name,
        phone,
        email,
        address,
        serviceArea,
        emergencyEnabled,
        arrivalWindowType
      });
      setBusiness(res.data);
      updateBusinessState(res.data);
      setSuccessMsg('Business settings updated successfully!');
    } catch (err) {
      console.error('Error saving business settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading company settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Business Profile & Preferences</h2>
        <p className="text-xs text-slate-400">Configure public business identity, emergency indicators, and customer arrival wording</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl text-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Business Name *</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Public Dispatch Phone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Contact Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Service Area Radius *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Arrival Wording & Emergency Controls</h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Customer Arrival Promise Mode</label>
            <select
              value={arrivalWindowType}
              onChange={(e) => setArrivalWindowType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-roofing-500 font-bold"
            >
              <option value="ESTIMATED_WINDOW">Estimated Arrival Window (Recommended: "Based on availability, estimated arrival is 4:00 PM")</option>
              <option value="EXACT">Exact Appointment Promise ("Your appointment is scheduled for 4:00 PM")</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Controls the exact wording displayed to customers on the booking confirmation screen.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm block">Emergency Active Damage Indicator</span>
              <span className="text-slate-400 text-xs">Displays emergency service intake badge on customer landing page</span>
            </div>
            <input
              type="checkbox"
              checked={emergencyEnabled}
              onChange={(e) => setEmergencyEnabled(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-roofing-500 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-roofing-500 hover:bg-roofing-600 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-roofing-500/25"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
