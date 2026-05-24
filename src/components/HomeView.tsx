import React, { useState, useEffect } from 'react';
import { HeartPulse, Stethoscope, ShieldAlert, Award, CalendarClock, PhoneCall, HelpCircle, ArrowRight, Ambulance, ShieldCheck, ClipboardCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Doctor, HealthTip } from '../types';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'patient' | 'doctor' | 'admin') => void;
  onOpenLogin: (defaultRole?: 'patient' | 'doctor' | 'admin') => void;
}

const CONSTANT_HEALTH_TIPS: HealthTip[] = [
  {
    id: 1,
    title: "10-Minute Morning Stretch Workout",
    category: "Exercise",
    content: "Start your morning with simple movements: neck rolls, hamstring bends, and thoracic extensions. This increases systemic circulation by up to 25%, reduces joint stiffness, and elevates mental clarity throughout your working day.",
    author: "Dr. Aisha Patel (Pediatrics)"
  },
  {
    id: 2,
    title: "Building an Ideal Nutritional Plate",
    category: "Nutrition",
    content: "Aim to structure meals using the clinical 'Bento' design: fill 50% of the plate with colorful antioxidant vegetables, 25% with premium lean proteins (salmon, tofu, egg), and 25% with complex low-glycemic grains (quinoa, wild rice).",
    author: "Dr. James Taylor (General Medicine)"
  },
  {
    id: 3,
    title: "Vascular Health & Walking Paces",
    category: "Wellness",
    content: "Just 30 minutes of daily fast-paced walking improves vascular elasticity, helps regularize high blood pressure (hypertension), elevates heart tone, and decreases overall arterial resistance.",
    author: "Dr. Robert Smith (Cardiology)"
  }
];

export default function HomeView({ onNavigate, onOpenLogin }: HomeViewProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState('Critical Breathless Symptoms / Stroke');
  const [ambulanceSubmitted, setAmbulanceSubmitted] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState('');

  // Fetch doctors dynamically to display options
  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      })
      .catch((err) => console.error('Error fetching public doctor roster:', err));
  }, []);

  const handleEmergencyDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!emergencyName || !emergencyPhone || !emergencyLocation) {
      setErrorFeedback('Please fill out all emergency details immediately.');
      return;
    }

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: emergencyName,
          callerPhone: emergencyPhone,
          locationAddress: emergencyLocation,
          emergencyType
        })
      });

      if (res.ok) {
        setAmbulanceSubmitted(true);
        setEmergencyName('');
        setEmergencyPhone('');
        setEmergencyLocation('');
      } else {
        const data = await res.json();
        setErrorFeedback(data.error || 'Gateway error dispatching ambulance. Call 911 directly.');
      }
    } catch (err) {
      console.error(err);
      setErrorFeedback('No server response. Call 911 directly.');
    }
  };

  return (
    <div className="id-home-view" id="public-home-wrapper">
      {/* Dynamic Alert Banner for Ambulance Submissions */}
      {ambulanceSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" id="emergency-alert-popup">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full border border-rose-100 shadow-2xl text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 animate-pulse">
              <Ambulance className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-2xl text-slate-800">AMBULANCE DISPATCHED!</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              An emergency vehicle has been dispatched immediately. Our medical alert operators have forwarded your location coordinates. Please keep this line open and clear.
            </p>
            <div className="bg-rose-50 hover:bg-rose-50/70 text-rose-800 font-bold p-3 rounded-xl text-xs flex items-center gap-2 text-left justify-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Assigned Responders: AMB-04 (St. Mary's ER)</span>
            </div>
            <button
              id="emergency-popup-close-btn"
              onClick={() => setAmbulanceSubmitted(false)}
              className="w-full bg-slate-850 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Acknowledge Dispatch
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 md:py-20 border-b border-slate-100 dark:border-slate-850" id="home-hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-statement-col">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-extrabold text-xs rounded-full uppercase tracking-wider shadow-xs" id="hero-badge">
              <HeartPulse className="h-3.5 w-3.5 animate-pulse" /> Compassionate Clinical Assistance
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black italic text-slate-900 dark:text-white tracking-tight leading-none" id="hero-main-title">
              Life Line <br />
              <span className="text-blue-600 dark:text-blue-400">A Health Assistance</span> <br />
              Web Application
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-xl" id="hero-description text">
              Empowering active medical assistance, direct clinical appointment calendars, real-time emergency responder dispatches, and responsive health advisors in one unified portal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4" id="hero-cta-buttons">
              <button
                id="hero-book-apt-btn"
                onClick={() => onOpenLogin('patient')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 text-base"
              >
                Book Appointment Online
                <CalendarClock className="h-5 w-5" />
              </button>
              <button
                id="hero-ai-chat-link-btn"
                onClick={() => {
                  const el = document.getElementById('ai-chat-advisor-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold px-7 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 text-base cursor-pointer"
              >
                Talk with AI Advisor
                <Sparkles className="h-5 w-5 text-amber-500" />
              </button>
            </div>
 
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800" id="hero-stats-panel">
              <div id="stat-doc-count">
                <span className="text-3xl font-black text-slate-800 dark:text-white block">5+</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Specialists</span>
              </div>
              <div id="stat-speed-rating">
                <span className="text-3xl font-black text-slate-800 dark:text-white block">10 Min</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Ambulance ER Response</span>
              </div>
              <div id="stat-retention">
                <span className="text-3xl font-black text-slate-800 dark:text-white block">99.8%</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Patient Satisfaction</span>
              </div>
            </div>
          </div>
 
          <div className="lg:col-span-5 relative" id="hero-illustration-col">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full filter blur-3xl" id="hero-blur-decor"></div>
            {/* Elegant Bento Healthcare Card */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-5" id="hero-bento-visual">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4" id="hero-bento-head">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Emergency Services</span>
                <span className="h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
              </div>
 
              <div className="flex gap-4 p-4 bg-rose-50/50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-left" id="hero-emergency-card">
                <ShieldAlert className="h-10 w-10 text-rose-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Critical Rescue Unit</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-1">If you have critical trauma, stroke symptoms, or cardiovascular chest strain, request helper dispatch instantly below.</p>
                </div>
              </div>
 
              {/* public doctor availability snippet */}
              <div className="space-y-3" id="hero-bento-doc-snippet">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide text-left block">On-duty Specialists</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors text-xs text-left animate-fade-in" id="hero-doc-item-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold">RS</div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Dr. Robert Smith</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Cardiology Specialist</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded text-[10px]">On Call</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors text-xs text-left animate-fade-in" id="hero-doc-item-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold">AP</div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Dr. Aisha Patel</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Pediatrics care</p>
                      </div>
                    </div>
                    <span className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-extrabold px-1.5 py-0.5 rounded text-[10px]">9:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-300" id="home-services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-3 font-sans" id="services-header">
            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest block animate-pulse">Comprehensive Ecosystem</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black italic text-blue-950 dark:text-white">Our Assisted Healthcare Services</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Life Line combines automated wellness engines with human medical credentials for real outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="services-grid">
            <div className="p-6 bg-slate-50/50 hover:bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900 rounded-3xl text-left transition-all hover:shadow-xl group" id="service-card-1">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <CalendarClock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white mt-5">Appointment Calendars</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">Book consultations effortlessly. Select specialty doctors, assign slots, and monitor live statuses.</p>
            </div>

            <div className="p-6 bg-slate-50/50 hover:bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900 rounded-3xl text-left transition-all hover:shadow-xl group" id="service-card-2">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Ambulance className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white mt-5">Emergency Ambulance Dispatch</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">Rapid dispatch system connected with nearby community hospitals for fast clinical response.</p>
            </div>

            <div className="p-6 bg-slate-50/50 hover:bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900 rounded-3xl text-left transition-all hover:shadow-xl group" id="service-card-3">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white mt-5">Dr. LifeLine AI chatbot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">Clinical knowledge base responses powered by server-side Gemini 3.5 AI flash for diet, fitness, and advice.</p>
            </div>

            <div className="p-6 bg-slate-50/50 hover:bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900 rounded-3xl text-left transition-all hover:shadow-xl group" id="service-card-4">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white mt-5">Dynamic Health Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">Store medical histories, prescription lists, and diagnosis records securely within standard database registers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Assistance Section (Emergency contact button & Ambulance Form) */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden" id="emergency-system-section">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-blue-600/10 rounded-l-full filter blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text description */}
            <div className="lg:col-span-6 space-y-6 text-left" id="emergency-text-col">
              <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-black uppercase">
                <Ambulance className="h-3.5 w-3.5 text-rose-400" /> EMERGENCY HELP DESK
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-black italic tracking-tight text-white">Need Urgent Rescue? <br />Request Ambulance Now</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg font-medium">
                Fill out the live dispatch form on the right. Our system immediately triggers a distress request, registers your call in the Life Line SQL Database, assigns the closest ambulance unit, and notifies on-call regional hospitals.
              </p>
              
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 max-w-md" id="emergency-direct-helplines">
                <p className="text-xs text-slate-400 uppercase font-black tracking-wide">Direct Helpline Numbers</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2" id="direct-helpline-amb">
                    <PhoneCall className="h-4 w-4 text-rose-400 animate-pulse" />
                    <div>
                      <p className="text-xs text-slate-500">Ambulance Direct</p>
                      <p className="font-extrabold text-white text-sm">+1 800-555-0191</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" id="direct-helpline-desk">
                    <PhoneCall className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-500">On-Call Desk</p>
                      <p className="font-extrabold text-white text-sm">+1 800-555-0199</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby Hospitals Display */}
              <div className="space-y-3" id="nearby-hospitals-section">
                <p className="text-xs text-slate-400 uppercase font-black tracking-wide">Regional Trauma Hospitals</p>
                <div className="grid grid-cols-2 gap-3" id="nearby-hospitals-grid">
                  <div className="p-2.5 bg-slate-800/40 rounded-lg text-xs" id="hospital-card-1">
                    <p className="font-bold text-slate-200">St. Mary's General Hospital</p>
                    <p className="text-[10px] text-slate-500">2.4 miles • Trauma lvl 1</p>
                  </div>
                  <div className="p-2.5 bg-slate-800/40 rounded-lg text-xs" id="hospital-card-2">
                    <p className="font-bold text-slate-200">City Memorial ER Center</p>
                    <p className="text-[10px] text-slate-500">4.1 miles • High availability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambulance Dispatch Form */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800" id="ambulance-form-col">
              <h3 className="font-serif font-black italic text-xl text-blue-950 dark:text-white mb-2 text-left flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-rose-500" />
                Live Ambulance Dispatcher
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 text-left font-medium">No registration required. Enter details to dispatch immediate medical backup.</p>

              {errorFeedback && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl mb-4 text-left" id="emergency-error-card">
                  {errorFeedback}
                </div>
              )}

              <form onSubmit={handleEmergencyDispatch} className="space-y-4" id="ambulance-request-form">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div id="amb-field-caller">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Your Name</label>
                    <input
                      type="text"
                      id="amb-caller-name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Eleanor Vance"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div id="amb-field-phone">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Direct Phone</label>
                    <input
                      type="tel"
                      id="amb-caller-phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+1 555-9001"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="text-left" id="amb-field-location">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Emergency Street Address</label>
                  <textarea
                    id="amb-caller-location"
                    value={emergencyLocation}
                    onChange={(e) => setEmergencyLocation(e.target.value)}
                    placeholder="Directions or coordinates..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>

                <div className="text-left" id="amb-field-type">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Severity Scenario</label>
                  <select
                    id="amb-caller-type"
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Critical Breathless Symptoms / Stroke">Critical Breathless Symptoms / Stroke</option>
                    <option value="Severe Physical Trauma / Accidental Injury">Severe Physical Trauma / Accidental Injury</option>
                    <option value="Unconsciousness / Poisoning">Unconsciousness / Poisoning</option>
                    <option value="Active Labor Support">Active Labor Support</option>
                    <option value="Cardiac Chest Pain">Cardiac Chest Pain</option>
                  </select>
                </div>

                <button
                  id="amb-submit-btn"
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-98 shadow-md shadow-rose-600/10 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  Confirm Emergency Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-300" id="home-about-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative" id="about-decor-col">
            <div className="p-8 bg-blue-50/50 dark:bg-slate-900 rounded-3xl text-left border border-blue-50 dark:border-slate-800" id="about-qualities-box">
              <h3 className="font-black text-lg text-slate-800 dark:text-blue-105 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" /> Life Line Standards
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-normal" id="about-quality-item-1">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Encrypted Record Store</span>
                    High integrity digital record management securely organized with relational database tables.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-normal" id="about-quality-item-2">
                  <Stethoscope className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Vetted Specialist Physicians</span>
                    Our platform roster recruits board-certified medical experts with a minimum of 8 years clinical experience.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 text-left space-y-6" id="about-text-col">
            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest block">ABOUT THE MEDICAL PROJECT</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black italic text-blue-950 dark:text-white leading-tight">Elevating Health Intelligence through Connected Care</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              Life Line - A Health Assistance Web App was designed to solve coordination delays in medical workflows. We have crafted a secure, full-stack, responsive ecosystem encompassing Patients, Doctor consultations, Ambulance personnel, and Database admins in single dashboard loops.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              Patients receive seamless logins, medical condition trackers, and automatic appointment scheduling. Doctors utilize responsive prescription/diagnostic inputs. Admins coordinate clinical personnel and ambulance dispatches in dynamic real-time tables.
            </p>
            <button
              id="about-action-login-btn"
              onClick={() => onOpenLogin('patient')}
              className="text-blue-600 hover:text-blue-700 font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer group"
            >
              Get Started with Patient Portal 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Public Wellness & Clinical Health Tips Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 border-t border-b border-slate-100 dark:border-slate-800/80" id="health-tips-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          <div className="max-w-xl mx-auto space-y-2" id="tips-header">
            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest block">Patient Self-Care</span>
            <span className="text-3xl font-serif font-black italic text-blue-950 dark:text-blue-105 block">Assisted Health & Wellness Tips</span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium animate-pulse">Curated guidelines published by board-certified Life Line physicians to prevent clinical risks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="tips-cards-grid">
            {CONSTANT_HEALTH_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-all duration-300" id={`public-tip-card-${idx}`}>
                <div>
                  <div className="flex items-center justify-between mb-4" id={`public-tip-header-${idx}`}>
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                      {tip.category}
                    </span>
                    <HeartPulse className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mb-2 leading-snug">{tip.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{tip.content}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 flex items-center gap-1.5" id={`public-tip-author-${idx}`}>
                  <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                  {tip.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
