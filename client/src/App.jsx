import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Customer Public Pages
import CustomerLanding from './pages/customer/CustomerLanding';
import CustomerIntakeFlow from './pages/customer/CustomerIntakeFlow';
import BookingConfirmation from './pages/customer/BookingConfirmation';

// Business Auth Pages
import BusinessLogin from './pages/business/BusinessLogin';
import BusinessRegister from './pages/business/BusinessRegister';

// Dashboard Layout & Pages
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/business/DashboardOverview';
import AppointmentsList from './pages/business/AppointmentsList';
import ServiceRequestsList from './pages/business/ServiceRequestsList';
import ServicesConfig from './pages/business/ServicesConfig';
import ScheduleSettings from './pages/business/ScheduleSettings';
import BusinessSettings from './pages/business/BusinessSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Public Routes */}
          <Route path="/" element={<CustomerLanding />} />
          <Route path="/intake" element={<CustomerIntakeFlow />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />

          {/* Business Auth Routes */}
          <Route path="/login" element={<BusinessLogin />} />
          <Route path="/register" element={<BusinessRegister />} />

          {/* Protected Business Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="appointments" element={<AppointmentsList />} />
            <Route path="requests" element={<ServiceRequestsList />} />
            <Route path="services" element={<ServicesConfig />} />
            <Route path="schedule" element={<ScheduleSettings />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
