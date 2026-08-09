import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, UserCheck, ExternalLink } from 'lucide-react';

export default function Header({ title }) {
  const { user, business } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">Business Management & Scheduling Dashboard</p>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-roofing-400 hover:text-roofing-300 bg-roofing-500/10 px-3 py-1.5 rounded-lg border border-roofing-500/20 transition-colors"
        >
          <span>Customer Intake View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white">{user?.email}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
