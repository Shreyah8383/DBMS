import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, ClipboardCheck, HeartPulse, UserCircle, Stethoscope, Clock, 
  ShieldAlert, CheckCircle, Save, Users, Search, Mail, Phone, Calendar, 
  Activity, FileText, User, Info, ArrowRight, CornerDownRight 
} from 'lucide-react';
import { Doctor, Appointment, Patient } from '../types';

interface DoctorDashboardProps {
  doctor: Doctor;
  onUpdateDoctor: (updatedDoctor: Doctor) => void;
}

export default function DoctorDashboard({ doctor, onUpdateDoctor }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Pending' | 'All'>('Pending');
  const [viewMode, setViewMode] = useState<'appointments' | 'patients'>('appointments');

  // States for Patient records DB
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showOnlyBooked, setShowOnlyBooked] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Edit Doctor parameters state
  const [isEditingPhysician, setIsEditingPhysician] = useState(false);
  const [availabilityHours, setAvailabilityHours] = useState(doctor.availabilityHours);
  const [consultationFee, setConsultationFee] = useState(doctor.consultationFee.toString());
  const [phone, setPhone] = useState(doctor.phone);

  // Active appointment update parameters state
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  
  const [formFeedback, setFormFeedback] = useState({ error: '', info: '' });

  useEffect(() => {
    fetchAppointments();
  }, [doctor.id]);

  useEffect(() => {
    if (viewMode === 'patients') {
      fetchPatients();
    }
  }, [viewMode]);

  const fetchPatients = async () => {
    setLoading(true);
    setFormFeedback({ error: '', info: '' });
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        if (data.length > 0 && selectedPatientId === null) {
          setSelectedPatientId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setFormFeedback({ error: 'Gateway sync error fetching patient folders.', info: '' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setFormFeedback({ error: '', info: '' });
    try {
      const res = await fetch(`/api/appointments?doctorId=${doctor.id}`);
      if (res.ok) {
        const apps = await res.json();
        setAppointments(apps);
      }
    } catch (err) {
      console.error(err);
      setFormFeedback({ error: 'Gateway sync error fetching appointment calendars.', info: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ error: '', info: '' });

    try {
      const res = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityHours,
          consultationFee: Number(consultationFee),
          phone
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateDoctor(data.doctor);
        setIsEditingPhysician(false);
        setFormFeedback({ error: '', info: 'Physician settings successfully saved.' });
      } else {
        setFormFeedback({ error: 'Failed to update practitioner configuration.', info: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusTransition = async (appointmentId: number, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setFormFeedback({ error: '', info: `Appointment status updated to ${status}.` });
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDraftPrescription = (app: Appointment) => {
    setEditingAppointmentId(app.id);
    setDiagnosisInput(app.diagnosis || '');
    setPrescriptionInput(app.prescription || '');
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointmentId === null) return;

    try {
      const res = await fetch(`/api/appointments/${editingAppointmentId}/prescription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diagnosisInput,
          prescription: prescriptionInput,
          status: 'Completed' // Automatically finalize status on medical report save
        })
      });

      if (res.ok) {
        setFormFeedback({ error: '', info: 'Clinical prescription drafted and consultations finalized.' });
        setEditingAppointmentId(null);
        fetchAppointments();
      } else {
        setFormFeedback({ error: 'Error logging report.', info: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === 'Pending') {
      return app.status === 'Pending' || app.status === 'Confirmed';
    }
    return true; // Return all appointments on 'All' tab
  });

  return (
    <div className="id-doctor-dashboard" id="doctor-dashboard-wrapper">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" id="doctor-dashboard-header">
        <div className="text-left">
          <h2 className="text-3xl font-serif font-black italic text-blue-950 dark:text-blue-105">Physician Care Control Center</h2>
          <p className="text-xs text-slate-500 font-medium">Dr. {doctor.fullName} • {doctor.specialization} clinical board room.</p>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'patients' && (
            <button
              onClick={fetchPatients}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              id="doctor-refresh-patients-btn"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Patients Directory
            </button>
          )}
          <button
            onClick={fetchAppointments}
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
            id="doctor-refresh-btn"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Consultation Records
          </button>
        </div>
      </div>

      {formFeedback.info && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="doctor-info-banner">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{formFeedback.info}</span>
        </div>
      )}

      {formFeedback.error && (
        <div className="p-4 bg-rose-50 border border-rose-150 text-rose-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="doctor-error-banner">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{formFeedback.error}</span>
        </div>
      )}

      {/* View Mode Switching Sub-Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-1.5 rounded-2xl w-fit mb-8 gap-1.5" id="doctor-dashboard-nav-tabs">
        <button
          id="doctor-btn-mode-appointments"
          onClick={() => setViewMode('appointments')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer uppercase tracking-wider transition-all duration-300 ${
            viewMode === 'appointments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Appointments & Consultations
        </button>
        <button
          id="doctor-btn-mode-patients"
          onClick={() => setViewMode('patients')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer uppercase tracking-wider transition-all duration-300 ${
            viewMode === 'patients'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Patient Records Database
        </button>
      </div>

      {viewMode === 'patients' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="doctor-patients-layout-grid">
          {/* Left: Patient list directories with elegant filters */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between" id="doctor-patients-aside-panel">
            <div className="text-left mb-6" id="doctor-patients-search-header">
              <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Patient Folders Directory
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Browse and search medical records of all clinic patients.</p>

              {/* Patient searches query form */}
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Query by name, email, or groups..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-200 shadow-inner"
                  id="doctor-patient-search-input"
                />
                <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Option toggle for booked online count */}
              <label className="flex items-center gap-2.5 mt-3.5 px-1 cursor-pointer select-none" id="doctor-only-booked-filter-label">
                <input
                  type="checkbox"
                  checked={showOnlyBooked}
                  onChange={(e) => setShowOnlyBooked(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer accent-blue-600"
                  id="doctor-only-booked-checkbox"
                />
                <span className="text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Only Booked Online ({new Set(appointments.map(a => a.patientId)).size} Patients)
                </span>
              </label>
            </div>

            {/* Patients list box selection */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1" id="doctor-patients-scroll-list">
              {(() => {
                const searchLower = patientSearch.toLowerCase();
                const bookedIds = new Set(appointments.map(a => a.patientId));
                let filteredPatients = patients.filter((p) => 
                  p.fullName.toLowerCase().includes(searchLower) ||
                  p.email.toLowerCase().includes(searchLower) ||
                  (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchLower)) ||
                  p.username.toLowerCase().includes(searchLower)
                );

                if (showOnlyBooked) {
                  filteredPatients = filteredPatients.filter(p => bookedIds.has(p.id));
                }

                if (filteredPatients.length > 0) {
                  return filteredPatients.map((p) => {
                    const isSelected = selectedPatientId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                        id={`doctor-patient-list-item-${p.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                          }`}>
                            {p.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs tracking-tight line-clamp-1">{p.fullName}</h4>
                            <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {p.gender} • {p.bloodGroup || 'O+'} Group
                            </p>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 shrink-0 ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`} />
                      </button>
                    );
                  });
                }

                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center" id="doctor-patients-search-blank">
                    <Users className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No matching patient folders found.</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right: Detailed Dossier sheet values for selected patient */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between text-left" id="doctor-patient-dossier-panel">
            {(() => {
              const activePatient = patients.find(p => p.id === selectedPatientId);

              if (activePatient) {
                // Past appointments tracker list for this patient
                const patientHistory = appointments.filter(a => a.patientId === activePatient.id);

                return (
                  <div className="space-y-6 text-left" id={`patient-dossier-card-${activePatient.id}`}>
                    {/* Top title */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" id="patient-dossier-top">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-indigo-150 dark:from-slate-800 dark:to-slate-950 rounded-2xl flex items-center justify-center text-blue-750 dark:text-blue-400 font-serif text-2xl font-black">
                          {activePatient.fullName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-serif font-black italic text-blue-950 dark:text-blue-100">
                            {activePatient.fullName}
                          </h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            ID-PL-{activePatient.id.toString().padStart(4, '0')} • Patient folder file
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <span id="dossier-gender-badge" className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {activePatient.gender}
                        </span>
                        <span id="dossier-bg-badge" className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                          {activePatient.bloodGroup || 'O+'} Blood
                        </span>
                      </div>
                    </div>

                    {/* Specifications Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="patient-dossier-details-grid">
                      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact phone</span>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-blue-600" />
                          {activePatient.phone}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email address</span>
                        <p className="text-xs font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 break-all max-w-full">
                          <Mail className="h-3.5 w-3.5 text-blue-605" />
                          {activePatient.email}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date of birth</span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          {activePatient.dob}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registration date</span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-blue-604" />
                          {activePatient.createdAt ? new Date(activePatient.createdAt).toLocaleDateString() : 'Initial seed'}
                        </p>
                      </div>
                    </div>

                    {/* History reports block values */}
                    <div className="space-y-4" id="patient-dossier-clinical-notes-section">
                      <div className="p-5 bg-blue-50/30 dark:bg-slate-950/30 border border-blue-100/40 dark:border-slate-800 rounded-3xl" id="dossier-medhistory">
                        <h4 className="text-xs font-extrabold text-blue-950 dark:text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" /> Patient Medical History Records
                        </h4>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                          {activePatient.medicalHistory || 'No medical conditions reported.'}
                        </p>
                      </div>

                      <div className="p-5 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/30 rounded-3xl" id="dossier-allergies">
                        <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-500" /> High-Risk Allergies & Warnings
                        </h4>
                        <p className="text-xs text-amber-850 dark:text-amber-300 leading-relaxed font-semibold">
                          {activePatient.allergies || 'No chemical allergies recorded.'}
                        </p>
                      </div>
                    </div>

                    {/* Consulation Log historical values */}
                    <div className="space-y-3" id="patient-dossier-history-section">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" /> Consultation Chronology History
                      </h4>
                      {patientHistory.length > 0 ? (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1" id="patient-dossier-history-scroll">
                          {patientHistory.map((app) => (
                            <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs space-y-2 text-left hover:border-slate-250 transition-all duration-305" id={`dossier-history-item-${app.id}`}>
                              <div className="flex justify-between items-center" id={`dossier-hist-head-${app.id}`}>
                                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                                  {app.appointmentDate} • Slot {app.appointmentTime}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-slate-500 italic font-medium">
                                <strong className="font-bold underline">Symptom summary:</strong> "{app.reason}"
                              </p>
                              {app.diagnosis && (
                                <div className="pl-3 border-l-2 border-indigo-400 space-y-1 py-0.5 bg-indigo-50/10 rounded-r-lg" id={`dossier-hist-report-${app.id}`}>
                                  <p className="text-slate-750 dark:text-slate-350 font-bold">
                                    <span className="text-indigo-650">Diagnosis:</span> {app.diagnosis}
                                  </p>
                                  {app.prescription && (
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                                      <CornerDownRight className="h-3 w-3 text-emerald-600" />
                                      <span>Rx: {app.prescription}</span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center border border-dashed border-slate-150 rounded-2xl" id="patient-dossier-history-blank">
                          <p className="text-xs text-slate-400 font-semibold">No appointment prescriptions registered to date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-center justify-center py-20 text-center h-full" id="patient-dossier-blank">
                  <User className="h-16 w-16 text-slate-200 mb-4 animate-pulse" />
                  <h4 className="font-serif font-black italic text-xl text-blue-950 dark:text-slate-100">No Patient Folder Selected</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">Click on any patient file on the left row to check client history card logs.</p>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="doctor-layout-grid">
        {/* Left column: Doctor Specialist parameters */}
        <div className="lg:col-span-4 space-y-6" id="doctor-profile-pane">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6" id="doctor-profile-info-card">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5" id="doctor-avatar-head">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">
                DR
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-slate-800">Dr. {doctor.fullName}</h3>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{doctor.specialization}</p>
              </div>
            </div>

            {isEditingPhysician ? (
              <form onSubmit={handleUpdateAvailability} className="space-y-4 text-left" id="doctor-setup-form">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Availability Work-Hours</label>
                  <input
                    type="text"
                    value={availabilityHours}
                    onChange={(e) => setAvailabilityHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Consultation Rate ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    id="doctor-save-setup-btn"
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    id="doctor-cancel-setup-btn"
                    type="button"
                    onClick={() => setIsEditingPhysician(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-left" id="doctor-profile-sheet">
                <div className="space-y-3" id="doctor-physician-specifications">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs" id="physician-years-exp">
                    <span className="text-slate-500 font-medium">Practice Experience</span>
                    <span className="font-extrabold text-slate-800">{doctor.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs" id="physician-fees">
                    <span className="text-slate-500 font-medium">Consultation Fee</span>
                    <span className="font-extrabold text-slate-800">${doctor.consultationFee}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs" id="physician-hours">
                    <span className="text-slate-500 font-medium">Calendar hours</span>
                    <span className="font-extrabold text-slate-800">{doctor.availabilityHours}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs" id="physician-phone">
                    <span className="text-slate-500 font-medium">Roster Phone</span>
                    <span className="font-extrabold text-slate-800">{doctor.phone}</span>
                  </div>
                </div>

                <button
                  id="doctor-edit-spec-btn"
                  onClick={() => setIsEditingPhysician(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="h-4 w-4 text-blue-300" />
                  Configure Roster hours
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Patient Appointments List & Direct report triggers */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between" id="doctor-appointments-console">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-50 pb-5 mb-5" id="doctor-appointments-head">
            <div className="text-left">
              <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" /> Consultations & Roster status
              </h3>
              <p className="text-[11px] text-slate-400">Review symptoms reasons, update conditions records, and sign clinical diagnostics.</p>
            </div>
            
            {/* View Filter tabs */}
            <div className="flex bg-slate-50 p-1 rounded-xl w-fit" id="doctor-view-tabs">
              <button
                id="doctor-tab-pending"
                onClick={() => setActiveTab('Pending')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  activeTab === 'Pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                In-Progress
              </button>
              <button
                id="doctor-tab-all"
                onClick={() => setActiveTab('All')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  activeTab === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Roster History
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-5" id="doctor-appointments-list">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <div key={app.id} className="p-5 bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 text-left transition-colors" id={`doctor-app-card-${app.id}`}>
                  <div className="flex justify-between items-start" id={`doctor-app-header-${app.id}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 bg-blue-105/10 rounded-full flex items-center justify-center text-blue-750 font-black text-xs">
                        {app.patientName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">{app.patientName}</h4>
                        <p className="text-[10px] text-slate-400">Scheduled: {app.appointmentDate} • Slot {app.appointmentTime}</p>
                      </div>
                    </div>
                    {/* Badge dynamics */}
                    <span
                      id={`doctor-app-status-${app.id}`}
                      className={`text-[9px] font-extrabold px-2 rounded-full uppercase leading-relaxed ${
                        app.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-150'
                          : app.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                          : app.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-150'
                          : 'bg-amber-50 text-amber-750 border border-amber-150'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs" id={`doctor-app-reason-${app.id}`}>
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Patient symptom report:</span>
                    <p className="text-slate-700 leading-normal font-semibold">{app.reason}</p>
                  </div>

                  {editingAppointmentId === app.id ? (
                    <form onSubmit={handleSaveReport} className="bg-blue-50/50 p-4 border border-blue-100 rounded-2xl text-left space-y-3" id={`doctor-report-form-${app.id}`}>
                      <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <HeartPulse className="h-4 w-4 text-indigo-650 shrink-0" /> Draft Consultation Prescription File
                      </h5>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Physical Diagnosis (Target symptom)</label>
                        <input
                          id={`input-diagnosis-${app.id}`}
                          type="text"
                          value={diagnosisInput}
                          onChange={(e) => setDiagnosisInput(e.target.value)}
                          placeholder="e.g. Stage 1 Hypertension / Viral Bronchitis"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Prescribed Drug Regiment</label>
                        <input
                          id={`input-prescription-${app.id}`}
                          type="text"
                          value={prescriptionInput}
                          onChange={(e) => setPrescriptionInput(e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg, twice daily for 7 days"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          id={`save-report-submit-btn-${app.id}`}
                          type="submit"
                          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          <Save className="h-3 w-3" /> Save & Finalize Patient Visit
                        </button>
                        <button
                          id={`close-report-draft-btn-${app.id}`}
                          type="button"
                          onClick={() => setEditingAppointmentId(null)}
                          className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Close Draft
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3 pt-1 border-t border-slate-100 justify-between flex-wrap" id={`doctor-app-actions-${app.id}`}>
                      {/* Clinical diagnostics reviews if compiled */}
                      {app.diagnosis ? (
                        <div className="text-xs space-y-1 bg-white border border-emerald-50 rounded-xl p-2.5 w-full flex flex-col" id={`finalized-report-card-${app.id}`}>
                          <p className="text-slate-700 font-medium"><strong>Diagnosis:</strong> {app.diagnosis}</p>
                          <p className="text-slate-700 font-medium"><strong>Prescription:</strong> <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded ml-1 text-[11px]">{app.prescription}</span></p>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full justify-end" id={`doctor-appointment-actions-bar-${app.id}`}>
                          {app.status === 'Pending' && (
                            <button
                              id={`confirm-slot-btn-${app.id}`}
                              onClick={() => handleStatusTransition(app.id, 'Confirmed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Accept Slot Booking
                            </button>
                          )}
                          {(app.status === 'Pending' || app.status === 'Confirmed') && (
                            <>
                              <button
                                id={`diagnostic-report-btn-${app.id}`}
                                onClick={() => handleOpenDraftPrescription(app)}
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                Draft Diagnosis & Prescriptions
                              </button>
                              <button
                                id={`cancel-slot-btn-${app.id}`}
                                onClick={() => handleStatusTransition(app.id, 'Cancelled')}
                                className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer border border-transparent hover:border-rose-200"
                              >
                                Reject Slot
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-dashed border-slate-150 rounded-2xl" id="doctor-appointments-empty-state">
                <HeartPulse className="h-12 w-12 text-slate-350 mb-3" />
                <h4 className="font-bold text-sm text-slate-700">No scheduled appointments active.</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Active bookings from self-registering Life Line patients will trigger dynamically in this clinical feed panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
