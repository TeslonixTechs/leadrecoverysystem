import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Authenticating portal session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Get dynamic header title based on current route
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/appointments')) return 'Appointments Schedule';
    if (path.includes('/requests')) return 'Service Requests & Leads';
    if (path.includes('/services')) return 'Services Configuration';
    if (path.includes('/schedule')) return 'Schedule & Operating Hours';
    if (path.includes('/settings')) return 'Business Settings';
    return 'Dashboard Overview';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle()} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
