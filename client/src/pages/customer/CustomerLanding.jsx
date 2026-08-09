import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Phone, Clock, MapPin, Shield, CheckCircle, ArrowRight, AlertTriangle, Calendar } from 'lucide-react';
import api from '../../api/client';

export default function CustomerLanding() {
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await api.get('/public/business-info');
        setBusinessInfo(res.data);
      } catch (err) {
        console.error('Error fetching public business info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  const businessName = businessInfo?.name || 'Summit Ridge Roofing';
  const phone = businessInfo?.phone || '(214) 555-0199';
  const serviceArea = businessInfo?.serviceArea || 'Dallas-Fort Worth Metroplex';
  const ratingScore = businessInfo?.ratingScore || 4.9;
  const ratingCount = businessInfo?.ratingCount || 142;
  const emergencyEnabled = businessInfo?.emergencyEnabled ?? true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-roofing-900 text-white font-sans">
      {/* Top Banner */}
      <div className="bg-roofing-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">Live Availability Engine</span>
        <span>Instant appointment scheduling based on real-time crew availability</span>
      </div>

      {/* Header / Nav */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-roofing-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20 font-black text-xl text-white">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white">{businessName}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-roofing-500" /> {serviceArea}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{phone}</span>
          </a>
          <button
            onClick={() => navigate('/intake')}
            className="bg-roofing-500 hover:bg-roofing-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-roofing-500/25 flex items-center gap-2"
          >
            <span>Request Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 text-center">
        {/* Rating Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-amber-300 shadow-inner">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="font-bold text-white">{ratingScore}</span>
          <span className="text-slate-400">({ratingCount} verified Google reviews)</span>
        </div>

        {/* Emergency Badge */}
        {emergencyEnabled && (
          <div className="mb-6 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-md">
            <AlertTriangle className="w-4 h-4 text-emerald-400" />
            <span>Emergency Active Damage Intake Supported</span>
          </div>
        )}

        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Need Roofing Help? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-roofing-200 to-indigo-300">
            Let's Get You Scheduled.
          </span>
        </h2>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Tell us what you need and we'll help find the earliest available appointment based on our live schedule.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <button
            onClick={() => navigate('/intake')}
            className="w-full sm:w-auto bg-gradient-to-r from-roofing-500 to-sky-500 hover:from-roofing-600 hover:to-sky-600 text-white font-bold text-base px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-xl shadow-roofing-500/30 flex items-center justify-center gap-3 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-base px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            <span>Call Now</span>
          </a>
        </div>

        {/* Trust & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-slate-800 pt-12">
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Instant Arrival Window</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No back-and-forth phone tag. Our engine calculates earliest technician arrival immediately.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Business Hours</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mon – Fri: 8:00 AM – 6:00 PM<br />
              Saturday: 9:00 AM – 2:00 PM
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Service Area</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Serving {serviceArea} and surrounding residential communities.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {businessName}. Powered by ServiceFlow scheduling engine.</p>
          <a href="/login" className="text-slate-400 hover:text-white underline">Business Portal Login</a>
        </div>
      </footer>
    </div>
  );
}
