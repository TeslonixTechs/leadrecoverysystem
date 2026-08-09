import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Wrench, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { business, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/dashboard/appointments', icon: Calendar },
    { label: 'Service Requests', path: '/dashboard/requests', icon: FileText },
    { label: 'Services', path: '/dashboard/services', icon: Wrench },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Clock },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-roofing-500 to-sky-400 flex items-center justify-center font-black text-white text-lg shadow-md shadow-sky-500/20">
          S
        </div>
        <div className="min-w-0">
          <h2 className="font-extrabold text-sm text-white truncate">{business?.name || 'Summit Ridge'}</h2>
          <p className="text-[11px] text-roofing-400 font-medium truncate">ServiceFlow Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-roofing-500 text-white shadow-md shadow-roofing-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
