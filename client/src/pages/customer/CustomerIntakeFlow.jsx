import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, CloudLightning, Search, Home, Droplets, ShieldCheck,
  ArrowRight, ArrowLeft, Check, Camera, Sparkles, AlertCircle, Calendar, MapPin, Phone, Mail, User
} from 'lucide-react';
import api from '../../api/client';

export default function CustomerIntakeFlow() {
  const navigate = useNavigate();

  // Wizard Step (1 to 6)
  const [step, setStep] = useState(1);

  // Business Data
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [urgency, setUrgency] = useState('ROUTINE');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dallas');
  const [zipCode, setZipCode] = useState('75201');
  const [photos, setPhotos] = useState([]);

  // Auto classification state
  const [classifiedService, setClassifiedService] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Booking submit state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Fetch business info & services on load
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/public/business-info');
        setBusiness(res.data);
        setServices(res.data.services || []);
        if (res.data.services?.length > 0) {
          setSelectedServiceId(res.data.services[0].id);
        }
      } catch (err) {
        console.error('Failed to load business data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Trigger classification when entering/leaving problem description
  const handleAnalyzeDescription = async () => {
    if (!problemDescription.trim() || !business?.id) return;
    setIsClassifying(true);
    try {
      const res = await api.post('/public/classify', {
        businessId: business.id,
        problemDescription
      });
      if (res.data?.suggestedServiceId) {
        setClassifiedService(res.data);
      }
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Final Booking
  const handleSubmitBooking = async () => {
    setIsBooking(true);
    setBookingError(null);

    try {
      const res = await api.post('/public/book', {
        businessId: business.id,
        serviceId: selectedServiceId,
        name: customerName,
        phone,
        email,
        address,
        city,
        zipCode,
        problemDescription,
        urgency,
        photoUrls: photos,
        currentTimeOverride: '14:10' // Enables demo 2:10 PM test simulation
      });

      // Navigate to confirmation with response data
      navigate('/confirmation', { state: { booking: res.data } });
    } catch (err) {
      console.error('Booking submission error:', err);
      setBookingError(err.response?.data?.error || 'Unable to complete appointment booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const selectedServiceObj = services.find(s => s.id === selectedServiceId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-roofing-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading service intake wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header & Progress */}
      <div className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step > 1 ? 'Back' : 'Home'}</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-white">{business?.name || 'Summit Ridge Roofing'}</h1>
            <p className="text-[11px] text-roofing-400 font-medium">Service Scheduling Request</p>
          </div>

          <span className="text-xs font-bold text-roofing-400 bg-roofing-500/10 px-2.5 py-1 rounded-full border border-roofing-500/20">
            Step {step} of 6
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-roofing-500 to-sky-400 h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container */}
      <main className="max-w-2xl mx-auto px-4 pt-8">

        {/* STEP 1: SERVICE TYPE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What do you need help with?</h2>
              <p className="text-slate-400 text-sm">Select the option that best describes your current roofing need.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((svc) => {
                const isSelected = selectedServiceId === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 relative ${
                      isSelected
                        ? 'bg-roofing-600/20 border-roofing-500 text-white shadow-lg shadow-roofing-500/10 ring-1 ring-roofing-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-roofing-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Wrench className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">{svc.name}</h3>
                        {isSelected && <Check className="w-4 h-4 text-roofing-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{svc.description}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Est. Duration: {svc.durationMinutes >= 60 ? `${svc.durationMinutes / 60} hrs` : `${svc.durationMinutes} mins`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedServiceId}
              className="w-full bg-roofing-500 hover:bg-roofing-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-roofing-500/25 mt-8"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PROBLEM DESCRIPTION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tell us briefly what is happening</h2>
              <p className="text-slate-400 text-sm">Provide a short description of the issue or project details.</p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={5}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                onBlur={handleAnalyzeDescription}
                placeholder="Example: Water is coming through my bedroom ceiling after last night's storm..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roofing-500 focus:ring-1 focus:ring-roofing-500 transition-all"
              />

              {/* Classification Recommendation Box */}
              {classifiedService && (
                <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-4 text-xs text-sky-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Smart Recommendation</p>
                    <p className="mt-0.5 text-sky-300">
                      Based on your problem description, we recommend <span className="font-bold text-white underline">{classifiedService.suggestedServiceName}</span>.
                    </p>
                    {selectedServiceId !== classifiedService.suggestedServiceId && (
                      <button
                        onClick={() => setSelectedServiceId(classifiedService.suggestedServiceId)}
                        className="mt-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-3 py-1 rounded text-[11px] transition-colors"
                      >
                        Switch to {classifiedService.suggestedServiceName}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  handleAnalyzeDescription();
                  setStep(3);
                }}
                disabled={!problemDescription.trim()}
                className="w-2/3 bg-roofing-500 hover:bg-roofing-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-roofing-500/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: URGENCY */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">How urgent is the problem?</h2>
              <p className="text-slate-400 text-sm">Select the level of urgency for scheduling prioritization.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'EMERGENCY', label: 'Emergency / Active Damage', desc: 'Water actively pouring inside, heavy storm damage, or collapsed ceiling.', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
                { id: 'URGENT', label: 'Urgent', desc: 'Roof leaking during rain or missing shingles after storm.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
                { id: 'ROUTINE', label: 'Routine', desc: 'General inspection, minor maintenance, or replacement quote.', color: 'border-sky-500/50 bg-sky-500/10 text-sky-300' },
                { id: 'NOT_SURE', label: 'Not Sure', desc: 'Unsure of extent; would like professional assessment.', color: 'border-slate-700 bg-slate-900 text-slate-300' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setUrgency(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                    urgency === opt.id
                      ? 'border-roofing-500 bg-roofing-500/15 text-white ring-1 ring-roofing-500'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm text-white block">{opt.label}</span>
                    <span className="text-xs text-slate-400 mt-1 block">{opt.desc}</span>
                  </div>
                  {urgency === opt.id && <Check className="w-5 h-5 text-roofing-400 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-slate-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>This classification field is used solely for service scheduling and dispatch prioritization.</span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 bg-roofing-500 hover:bg-roofing-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-roofing-500/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROPERTY & CONTACT INFORMATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Property & Contact Information</h2>
              <p className="text-slate-400 text-sm">Where should the roofing team be dispatched?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(214) 555-0199"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Property Street Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="1234 Main Street"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dallas"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="75201"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-roofing-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!customerName || !phone || !address || !city || !zipCode}
                className="w-2/3 bg-roofing-500 hover:bg-roofing-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-roofing-500/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: OPTIONAL PHOTOS */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Attach Damage Photos (Optional)</h2>
              <p className="text-slate-400 text-sm">Photos are optional but can help the team understand your request.</p>
            </div>

            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/50 hover:border-slate-700 transition-colors">
              <Camera className="w-10 h-10 text-roofing-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Click to upload photo files</p>
              <p className="text-xs text-slate-500 mb-4">PNG, JPG, or WEBP images up to 5MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload-input"
              />
              <label
                htmlFor="photo-upload-input"
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-block"
              >
                Select Photos
              </label>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Uploaded Images ({photos.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={p} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full text-[10px] transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(4)}
                className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="w-2/3 bg-roofing-500 hover:bg-roofing-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-roofing-500/25"
              >
                <span>Review Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SUMMARY & SUBMIT */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Review Your Service Request</h2>
              <p className="text-slate-400 text-sm">Please verify your details before finding available appointment slots.</p>
            </div>

            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{bookingError}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
              {/* Service */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Service Requested</span>
                  <span className="font-bold text-sm text-white">{selectedServiceObj?.name}</span>
                  <span className="text-slate-400 text-[11px] block">{selectedServiceObj?.durationMinutes} min estimated job duration</span>
                </div>
                <button onClick={() => setStep(1)} className="text-roofing-400 hover:underline font-semibold">Edit</button>
              </div>

              {/* Problem */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Problem Description</span>
                  <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">"{problemDescription}"</p>
                </div>
                <button onClick={() => setStep(2)} className="text-roofing-400 hover:underline font-semibold">Edit</button>
              </div>

              {/* Urgency */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Urgency Level</span>
                  <span className="font-semibold text-amber-400 text-xs">{urgency}</span>
                </div>
                <button onClick={() => setStep(3)} className="text-roofing-400 hover:underline font-semibold">Edit</button>
              </div>

              {/* Property & Contact */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Contact & Address</span>
                  <p className="font-bold text-white text-xs mt-0.5">{customerName} • {phone}</p>
                  <p className="text-slate-300 text-xs">{address}, {city} {zipCode}</p>
                </div>
                <button onClick={() => setStep(4)} className="text-roofing-400 hover:underline font-semibold">Edit</button>
              </div>

              {/* Photos */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Photos Attached</span>
                  <span className="text-slate-300 text-xs">{photos.length} image file(s)</span>
                </div>
                <button onClick={() => setStep(5)} className="text-roofing-400 hover:underline font-semibold">Edit</button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(5)}
                className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmitBooking}
                disabled={isBooking}
                className="w-2/3 bg-gradient-to-r from-roofing-500 to-sky-500 hover:from-roofing-600 hover:to-sky-600 disabled:opacity-50 text-white font-extrabold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-roofing-500/30"
              >
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Availability...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Find Available Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
