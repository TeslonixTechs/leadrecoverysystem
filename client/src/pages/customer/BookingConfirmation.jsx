import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, Hash, Phone, ArrowLeft, Download, ExternalLink } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-slate-400">No active booking session found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Generate .ics calendar download
  const handleAddToCalendar = () => {
    const title = `ServiceFlow Appointment - ${booking.serviceName}`;
    const description = `Roofing appointment with Summit Ridge Roofing. Ref: ${booking.referenceNumber}`;
    const locationStr = booking.address;
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ServiceFlow Inc//Roofing Appointment//EN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${locationStr}
DTSTART:${booking.date.replace(/-/g, '')}T${booking.startTime.replace(':', '')}00
DTEND:${booking.date.replace(/-/g, '')}T${booking.endTime.replace(':', '')}00
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointment-${booking.referenceNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Animated Checkmark Header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your request has been scheduled.
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              We've received your request and added it to the company's schedule. The roofing team has your contact information and service details.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-roofing-400" /> Reference Number
              </span>
              <span className="font-mono font-bold text-sky-400 text-sm">{booking.referenceNumber}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-roofing-400" /> Date
              </span>
              <span className="font-bold text-white text-xs">{booking.date}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Estimated Arrival
              </span>
              <span className="font-extrabold text-amber-400 text-sm">{booking.estimatedArrival}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-roofing-400" /> Property Address
              </span>
              <span className="font-medium text-slate-300 text-xs text-right max-w-[200px] truncate">{booking.address}</span>
            </div>
          </div>

          {/* Wording notice */}
          <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            "{booking.arrivalWording}"
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleAddToCalendar}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Add to Calendar</span>
          </button>

          <a
            href="tel:2145550199"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Contact Business</span>
          </a>

          <button
            onClick={() => navigate('/')}
            className="bg-roofing-500 hover:bg-roofing-600 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-roofing-500/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
