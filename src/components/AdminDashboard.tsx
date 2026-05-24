import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, ClipboardList, Ambulance, ShieldCheck, 
  Trash2, Plus, Search, Filter, RefreshCw, CheckCircle2, 
  AlertTriangle, Save, Heart, ShieldAlert, Database, Terminal, 
  Play, TableProperties
} from 'lucide-react';
import { Patient, Doctor, Appointment, EmergencyRequest } from '../types';

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeEmergencies: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    uniqueSpecializations: 0,
    visitorCount: 0,
    bookedPatientsCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ error: '', info: '' });

  // Core search / filter queries
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');

  // New Doctor creation parameters
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDocUsername, setNewDocUsername] = useState('');
  const [newDocFullName, setNewDocFullName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocSpecialization, setNewDocSpecialization] = useState('Cardiology');
  const [newDocExperience, setNewDocExperience] = useState('5');
  const [newDocPhone, setNewDocPhone] = useState('');
  const [newDocFee, setNewDocFee] = useState('80');
  const [newDocHours, setNewDocHours] = useState('09:00 AM - 05:00 PM');

  // Emergency dispatch updater parameters
  const [dispatchRequestId, setDispatchRequestId] = useState<number | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<'Pending' | 'Assigned' | 'Dispatched' | 'Resolved'>('Assigned');
  const [dispatchAmbulanceId, setDispatchAmbulanceId] = useState('AMB-04');
  const [dispatchHospital, setDispatchHospital] = useState("St. Mary General Hospital");

  // DBMS & SQL Active States
  const [activeTab, setActiveTab] = useState<'overview' | 'dbms'>('overview');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM patients;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[][]; message?: string; success?: boolean } | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [dbmsSelectedTable, setDbmsSelectedTable] = useState('patients');

  const handleExecuteSQL = async (queryText?: string) => {
    const queryToRun = queryText !== undefined ? queryText : sqlQuery;
    if (!queryToRun.trim()) return;

    setSqlLoading(true);
    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun })
      });
      const data = await res.json();
      setSqlResult(data);
    } catch (err) {
      console.error(err);
      setSqlResult({
        success: false,
        columns: ['EXCEPTION'],
        rows: [['HTTP Request error. Could not reach relational DBMS server endpoint.']],
        message: 'Error'
      });
    } finally {
      setSqlLoading(false);
    }
  };

  useEffect(() => {
    fetchComprehensiveData();
  }, []);

  const fetchComprehensiveData = async () => {
    setLoading(true);
    setFormFeedback({ error: '', info: '' });

    try {
      // 1. Fetch Patients
      const patientsRes = await fetch('/api/patients');
      const patientsData = await patientsRes.json();
      setPatients(patientsData);

      // 2. Fetch Doctors
      const doctorsRes = await fetch('/api/doctors');
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData);

      // 3. Fetch Appointments
      const appsRes = await fetch('/api/appointments');
      const appsData = await appsRes.json();
      setAppointments(appsData);

      // 4. Fetch Emergency ambulance requests
      const emergencyRes = await fetch('/api/emergency');
      const emergencyData = await emergencyRes.json();
      setEmergencyRequests(emergencyData);

      // 5. Fetch Aggregate statistics
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

    } catch (err) {
      console.error(err);
      setFormFeedback({ error: 'Gateway issue syncronizing admin data files.', info: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ error: '', info: '' });

    if (!newDocUsername || !newDocFullName || !newDocSpecialization) {
      setFormFeedback({ error: 'Please populate required doctor registration fields.', info: '' });
      return;
    }

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newDocUsername,
          fullName: newDocFullName,
          email: newDocEmail,
          specialization: newDocSpecialization,
          experienceYears: Number(newDocExperience),
          phone: newDocPhone || '+1 555-0100',
          consultationFee: Number(newDocFee),
          availabilityHours: newDocHours
        })
      });

      if (res.ok) {
        setNewDocUsername('');
        setNewDocFullName('');
        setNewDocEmail('');
        setNewDocPhone('');
        setIsAddingDoctor(false);
        setFormFeedback({ error: '', info: 'New Specialist physician registered successfully on Life Line roster!' });
        fetchComprehensiveData();
      } else {
        setFormFeedback({ error: 'Username already in use on platform.', info: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this Doctor from platform rosters?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFormFeedback({ error: '', info: 'Doctor profile permanently deleted from roster.' });
        fetchComprehensiveData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePatient = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this patient from database registers?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFormFeedback({ error: '', info: 'Patient folder deleted from system database registers.' });
        fetchComprehensiveData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEmergencyStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchRequestId === null) return;

    try {
      const res = await fetch(`/api/emergency/${dispatchRequestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: dispatchStatus,
          ambulanceId: dispatchAmbulanceId,
          assignedHospital: dispatchHospital
        })
      });

      if (res.ok) {
        setFormFeedback({ error: '', info: 'Emergency status registry and rescue vehicle updated successfully.' });
        setDispatchRequestId(null);
        fetchComprehensiveData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // List Search & filtering rules
  const filteredAppointments = appointments.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (app.patientName?.toLowerCase().includes(term) || false) ||
      (app.doctorName?.toLowerCase().includes(term) || false) ||
      (app.reason?.toLowerCase().includes(term) || false);
      
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="id-admin-dashboard" id="admin-dashboard-wrapper">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" id="admin-dashboard-header">
        <div className="text-left">
          <h2 className="text-3xl font-serif font-black italic text-brand-950 dark:text-brand-100">Hospital Administration Executive</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Life Line clinical resource registries, ambulance dispatches, and diagnostics statistics cards.</p>
        </div>
        
        <button
          onClick={fetchComprehensiveData}
          className="bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-brand-700 dark:text-brand-400 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
          id="admin-refresh-btn"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Global Registries
        </button>
      </div>

      {/* DBMS & Administration Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-1" id="admin-view-tab-bar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-700 dark:text-brand-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="admin-tab-overview"
        >
          <Users className="h-4 w-4" />
          Administrative Overview
        </button>
        <button
          onClick={() => {
            setActiveTab('dbms');
            handleExecuteSQL('SELECT * FROM patients;');
          }}
          className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeTab === 'dbms'
              ? 'border-brand-600 text-brand-700 dark:text-brand-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="admin-tab-dbms"
        >
          <Database className="h-4 w-4 text-brand-600" />
          Relational DBMS SQL Console
          <span className="bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">MySQL Mode</span>
        </button>
      </div>

      {formFeedback.info && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="admin-info-banner">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{formFeedback.info}</span>
        </div>
      )}

      {formFeedback.error && (
        <div className="p-4 bg-rose-50 border border-rose-150 text-rose-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="admin-error-banner">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{formFeedback.error}</span>
        </div>
      )}

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8" id="admin-stats-bento">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-shadow animate-fade-in" id="admin-stat-patients">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Patients Registered</span>
            <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-650 dark:text-blue-400 rounded-lg"><Users className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl md:text-3xl font-black text-blue-950 dark:text-blue-100 block" id="admin-stat-patients-val">{stats.totalPatients}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Stored folders in system DB</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-shadow animate-fade-in" id="admin-stat-booked-patients">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Users Booked Online</span>
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 rounded-lg"><ClipboardList className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl md:text-3xl font-black text-indigo-950 dark:text-indigo-100 block" id="admin-stat-booked-patients-val">{stats.bookedPatientsCount}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Has online appointments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-shadow animate-fade-in" id="admin-stat-doctors">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Active Doctors</span>
            <div className="p-2 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg"><Stethoscope className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 block" id="admin-stat-doctors-val">{stats.totalDoctors}</span>
          <p className="text-[10px] text-indigo-550 dark:text-indigo-450 mt-1">{stats.uniqueSpecializations} Specialization keys</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-shadow animate-fade-in" id="admin-stat-appointments">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Calendars Booked</span>
            <div className="p-2 bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-450 rounded-lg"><ClipboardList className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 block" id="admin-stat-appointments-val">{stats.totalAppointments}</span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{stats.pendingAppointments} Pending slots confirmation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-shadow animate-fade-in" id="admin-stat-emergencies">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Responders Dispatches</span>
            <div className="p-2 bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-450 rounded-lg animate-pulse"><Ambulance className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400 block" id="admin-stat-emergencies-val">{stats.activeEmergencies}</span>
          <p className="text-[10px] text-rose-450 mt-1">Active distress alerts unresolved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8" id="admin-layout-grid-top">
        {/* Doctors Roster Creation Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg p-6 flex flex-col justify-between" id="admin-doctors-pane">
          <div className="text-left mb-5" id="admin-doctors-head">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-blue-600 animate-pulse" /> Specialist Physicians Roster
              </h3>
              <button
                id="admin-add-doc-trigger-btn"
                onClick={() => setIsAddingDoctor(!isAddingDoctor)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full cursor-pointer transition-colors"
                title="Add New Doctor to Roster"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Review specialists profile directories, practice availability, or add doctors.</p>
          </div>

          {isAddingDoctor ? (
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-left border bg-slate-50/50 p-4 rounded-xl border-slate-100 mb-5" id="admin-add-doc-form">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Roster Username</label>
                  <input
                    type="text"
                    value={newDocUsername}
                    onChange={(e) => setNewDocUsername(e.target.value)}
                    placeholder="e.g. dr_taylor"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Full Doctor Name</label>
                  <input
                    type="text"
                    value={newDocFullName}
                    onChange={(e) => setNewDocFullName(e.target.value)}
                    placeholder="e.g. Dr. James Taylor"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Specialization</label>
                  <select
                    value={newDocSpecialization}
                    onChange={(e) => setNewDocSpecialization(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newDocExperience}
                    onChange={(e) => setNewDocExperience(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Fee Amount ($)</label>
                  <input
                    type="number"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Phone Contact</label>
                  <input
                    type="tel"
                    value={newDocPhone}
                    onChange={(e) => setNewDocPhone(e.target.value)}
                    placeholder="e.g. +1 555-0155"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Availability intervals</label>
                <input
                  type="text"
                  value={newDocHours}
                  onChange={(e) => setNewDocHours(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <button
                id="admin-submit-doc-btn"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
              >
                Register Specialist Physician
              </button>
            </form>
          ) : null}

          {/* Doctors scroll list details */}
          <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto" id="admin-doctors-list">
            {doctors.map((doc) => (
              <div key={doc.id} className="p-3 bg-slate-50/70 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between text-xs text-left transition-colors" id={`admin-doc-card-${doc.id}`}>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-10/10 flex items-center justify-center font-bold text-[11px] text-blue-750">
                    DR
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800">{doc.fullName}</h4>
                    <p className="text-[10px] text-slate-400">{doc.specialization} • Exp {doc.experienceYears}y • Fee ${doc.consultationFee}</p>
                  </div>
                </div>

                <button
                  id={`admin-delete-doc-btn-${doc.id}`}
                  onClick={() => handleDeleteDoctor(doc.id)}
                  className="text-slate-350 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Remove Specialist physician"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Emergency requests Dispatch Board */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg p-6 flex flex-col justify-between" id="admin-rescue-pane">
          <div className="text-left mb-6" id="admin-rescue-head">
            <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
              <Ambulance className="h-5 w-5 text-rose-500 animate-pulse" /> Emergency distress and Ambulance Desk
            </h3>
            <p className="text-xs text-slate-400">Incoming responder requests submitted from ambulance request layouts. Confirm dispatcher actions below.</p>
          </div>

          {dispatchRequestId !== null ? (
            <form onSubmit={handleUpdateEmergencyStatus} className="bg-rose-50/50 p-4 border border-rose-100 rounded-2xl text-left space-y-3 mb-4 text-xs text-slate-800" id="admin-dispatch-update-form">
              <h5 className="font-extrabold text-rose-800 flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> Dispatch Responder Controls (Request ID: {dispatchRequestId})
              </h5>
              
              <div className="grid grid-cols-2 gap-3" id="dispatch-form-fields-row">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Dispatch Status</label>
                  <select
                    value={dispatchStatus}
                    onChange={(e) => setDispatchStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Assigned Ambulance ID</label>
                  <input
                    type="text"
                    value={dispatchAmbulanceId}
                    onChange={(e) => setDispatchAmbulanceId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Target Facility Hospital</label>
                <input
                  type="text"
                  value={dispatchHospital}
                  onChange={(e) => setDispatchHospital(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  id="admin-save-dispatch-btn"
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer"
                >
                  <Save className="h-3 w-3" /> Save Dispatcher Assignment
                </button>
                <button
                  id="admin-cancel-dispatch-btn"
                  type="button"
                  onClick={() => setDispatchRequestId(null)}
                  className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Close controls
                </button>
              </div>
            </form>
          ) : null}

          {/* Emergency requests scroll lists */}
          <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto" id="admin-emergency-list">
            {emergencyRequests.map((req) => (
              <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2 text-xs text-left" id={`admin-emergency-card-${req.id}`}>
                <div className="flex justify-between items-start" id={`admin-emergency-head-${req.id}`}>
                  <div>
                    <h5 className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Ambulance className="h-3.5 w-3.5 text-rose-500" />
                      {req.callerName} ({req.callerPhone})
                    </h5>
                    <p className="text-[10px] text-slate-400">Location: {req.locationAddress}</p>
                  </div>
                  {/* Status pills dynamics */}
                  <span
                    id={`admin-emergency-status-badge-${req.id}`}
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        : req.status === 'Dispatched'
                        ? 'bg-rose-50 text-rose-700 border border-rose-150'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-100 space-y-1" id={`admin-emergency-description-${req.id}`}>
                  <p className="font-medium text-[10px] text-slate-400 uppercase">Emergency Incident:</p>
                  <p className="font-semibold text-slate-850 leading-relaxed">{req.emergencyType}</p>
                </div>

                {req.assignedHospital && (
                  <div className="p-2 bg-blue-50/60 border border-blue-50 rounded-lg text-[10px] text-blue-800 font-bold flex justify-between" id={`admin-emergency-details-line-${req.id}`}>
                    <span>Ambulance: {req.ambulanceId || 'Unassigned'}</span>
                    <span>Hospital: {req.assignedHospital}</span>
                  </div>
                )}

                {req.status !== 'Resolved' && (
                  <div className="flex justify-end pt-1" id={`admin-emergency-controls-${req.id}`}>
                    <button
                      id={`dispatch-controls-trigger-btn-${req.id}`}
                      onClick={() => {
                        setDispatchRequestId(req.id);
                        setDispatchStatus(req.status === 'Pending' ? 'Assigned' : req.status);
                        setDispatchAmbulanceId(req.ambulanceId || 'AMB-04');
                        setDispatchHospital(req.assignedHospital || 'St. Mary General Hospital');
                      }}
                      className="bg-slate-850 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg cursor-pointer"
                    >
                      Update Dispatch status
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster of Registered Patients & Global Scheduled Appointments filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-layout-grid-bottom">
        {/* Patient Folders List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg p-6 flex flex-col justify-between" id="admin-patients-pane">
          <div className="text-left mb-6" id="admin-patients-head">
            <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> Patient Folders Registry
            </h3>
            <p className="text-xs text-slate-400">Comprehensive logs of self-registered citizens, showing age details and medical folder IDs.</p>
          </div>

          {/* scroll panel list */}
          <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto" id="admin-patients-list">
            {patients.map((pat) => (
              <div key={pat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 text-xs text-left flex items-center justify-between transition-colors" id={`admin-pat-card-${pat.id}`}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-blue-105/5 rounded-full flex items-center justify-center font-bold text-[11px] text-blue-750">
                    PT
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800">{pat.fullName}</h4>
                    <p className="text-[10px] text-slate-400">DOB: {pat.dob} • Phone: {pat.phone}</p>
                    {pat.allergies && <p className="text-[9px] text-rose-500 font-extrabold uppercase mt-0.5">Allergies: {pat.allergies}</p>}
                  </div>
                </div>

                <button
                  id={`admin-delete-patient-btn-${pat.id}`}
                  onClick={() => handleDeletePatient(pat.id)}
                  className="text-slate-350 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-150 transition-colors"
                  title="Delete Patient folder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global appointments registries search filters */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-lg p-6" id="admin-appointments-pane">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-5 mb-5" id="admin-appointments-head">
            <div className="text-left">
              <h3 className="font-extrabold text-sm text-slate-850 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" /> Active Appointment Calendars Registry
              </h3>
              <p className="text-[11px] text-slate-400">Multi-parameter search and status tags filter controls.</p>
            </div>
          </div>

          {/* Search Inputs & Dropdowns filter layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5" id="admin-search-filters-bar">
            <div className="relative text-left" id="admin-search-wrapper">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="admin-search-input"
                type="text"
                placeholder="Search patient, doctor, or symptom reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-left" id="admin-status-dropdown-wrapper">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                id="admin-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* appointment rows display card */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto" id="admin-appointments-list">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <div key={app.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2 text-xs text-left" id={`admin-app-row-${app.id}`}>
                  <div className="flex justify-between items-start" id={`admin-app-row-head-${app.id}`}>
                    <div>
                      <h4 className="font-extrabold text-slate-800">Patient: {app.patientName} &rarr; Dr. {app.doctorName}</h4>
                      <p className="text-[10px] text-slate-400">Spec: {app.doctorSpecialization} • Date: {app.appointmentDate} at {app.appointmentTime}</p>
                    </div>
                    {/* pill */}
                    <span
                      id={`admin-app-row-status-${app.id}`}
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        app.status === 'Completed'
                          ? 'bg-emerald-55/10 text-emerald-800 font-extrabold'
                          : app.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px] leading-relaxed pl-3 border-l-2 border-slate-350" id={`admin-app-row-reason-${app.id}`}>
                    Reason: {app.reason}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl" id="admin-app-empty-state">
                <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold">No appointments match search credentials.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100" id="dbms-console-tab-container">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Sidebar with Table Schema List */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <TableProperties className="h-5 w-5 text-brand-650 dark:text-brand-400" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">Relational DBMS Schemas</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Live MySQL schema definitions & properties</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'patients', count: patients.length, desc: 'Stores self-registered citizen healthcare records', cols: ['id INT AI PK', 'username VARCHAR', 'full_name VARCHAR', 'dob DATE', 'blood_group VARCHAR', 'allergies TEXT'] },
                { name: 'doctors', count: doctors.length, desc: 'Specialist roster directory & fees', cols: ['id INT AI PK', 'username VARCHAR', 'full_name VARCHAR', 'specialization VARCHAR', 'consultation_fee DEC'] },
                { name: 'appointments', count: appointments.length, desc: 'Linked booking logs with status key', cols: ['id INT AI PK', 'patient_id INT FK', 'doctor_id INT FK', 'appointment_date DATE', 'status ENUM'] },
                { name: 'emergency_requests', count: emergencyRequests.length, desc: 'Distress logs & paramedic dispatch', cols: ['id INT AI PK', 'caller_name VARCHAR', 'location_address TEXT', 'status ENUM'] },
                { name: 'admins', count: doctors.length > 0 ? 2 : 1, desc: 'Administrative staff executive registry', cols: ['id INT AI PK', 'username VARCHAR', 'full_name VARCHAR', 'email VARCHAR'] }
              ].map((table) => (
                <div 
                  key={table.name}
                  id={`dbms-table-item-${table.name}`}
                  onClick={() => {
                    setDbmsSelectedTable(table.name);
                    setSqlQuery(`SELECT * FROM ${table.name};`);
                    handleExecuteSQL(`SELECT * FROM ${table.name};`);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                    dbmsSelectedTable === table.name
                      ? 'bg-brand-50/50 dark:bg-slate-800 border-brand-200 dark:border-slate-700'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850 hover:bg-slate-100/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-400">{table.name.toUpperCase()}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{table.count} row(s)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{table.desc}</p>
                  
                  {dbmsSelectedTable === table.name && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Table Schema Attributes:</p>
                      <div className="flex flex-wrap gap-1">
                        {table.cols.map((colStr) => (
                          <span key={colStr} className="text-[9px] font-mono bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{colStr}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sample SQL Templates to Click-to-Run */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 text-left shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <Terminal className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick-Run DBMS SQL templates</h4>
            </div>
            <div className="space-y-1.5 text-xs text-slate-750">
              {[
                { label: 'View All Patients', sql: 'SELECT * FROM patients;' },
                { label: 'Select Active Cardiology Doctors', sql: "SELECT id, full_name, specialization, experience_years FROM doctors WHERE specialization = 'Cardiology';" },
                { label: 'Check Pending Appointments', sql: "SELECT * FROM appointments WHERE status = 'Pending';" },
                { label: 'Check Emergency Incidents', sql: "SELECT * FROM emergency_requests WHERE status = 'Pending';" },
                { label: 'Emergency rescue vehicles assigned', sql: "SELECT caller_name, status, ambulance_id FROM emergency_requests WHERE status = 'Dispatched';" }
              ].map((temp, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSqlQuery(temp.sql);
                    handleExecuteSQL(temp.sql);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-850 cursor-pointer block transition-all hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <div className="font-sans font-bold text-slate-700 dark:text-slate-350 mb-0.5">{temp.label}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{temp.sql}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SQL Terminal Console & Results Grid */}
        <div className="xl:col-span-8 space-y-6 text-left">
          {/* Terminal query panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Interactive SQL Terminal</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 font-black animate-pulse">DBMS CLIENT ONLINE</span>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-mono">Input standard SELECT / INSERT / DELETE queries to inspect our database: </p>
              <div className="relative font-mono">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-24 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-700 font-medium"
                  placeholder="SELECT * FROM patients WHERE blood_group = 'O+';"
                />
                <button
                  onClick={() => handleExecuteSQL()}
                  className="absolute right-3.5 bottom-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer select-none transition-transform active:scale-95 shadow-lg shadow-emerald-950/20 whitespace-nowrap"
                >
                  <Play className="h-3 w-3 fill-white" /> Run Command
                </button>
              </div>
            </div>
          </div>

          {/* Query Results grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[250px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Relational Rows Return Dataset</h4>
                {sqlResult?.message && (
                  <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    {sqlResult.message}
                  </span>
                )}
              </div>

              {sqlLoading ? (
                <div className="p-12 text-center text-slate-400" id="dbms-terminal-loading">
                  <RefreshCw className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold animate-pulse">Running SQL queries on DBMS backend engine...</p>
                </div>
              ) : sqlResult ? (
                <div className="space-y-3">
                  {sqlResult.success ? (
                    <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden max-h-[380px] overflow-auto">
                      <table className="w-full text-xs font-mono text-left select-text">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 border-b border-slate-150 dark:border-slate-800">
                          <tr>
                            {sqlResult.columns.map((colName) => (
                              <th key={colName} className="px-3.5 py-2.5 font-bold uppercase tracking-wider border-r border-slate-100 dark:border-slate-850 last:border-0">{colName}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-855 font-normal">
                          {sqlResult.rows && sqlResult.rows.length > 0 ? (
                            sqlResult.rows.map((rowArr, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-950/80 transition-colors">
                                {rowArr.map((cellVal: any, cellIdx: number) => (
                                  <td key={cellIdx} className="px-3.5 py-2 whitespace-nowrap border-r border-slate-100 dark:border-slate-850 dark:text-slate-300 last:border-0">
                                    {cellVal === true ? 'TRUE' : cellVal === false ? 'FALSE' : String(cellVal)}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={sqlResult.columns.length} className="px-4 py-12 text-center text-slate-400 font-bold">
                                Query executed successfully, but returned 0 relational records.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 flex flex-col gap-2 rounded-2xl font-mono text-xs text-left" id="query-compile-fail-pane">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                        <span>SQL Compilation/Analysis Error Exception:</span>
                      </div>
                      <p className="pl-7 text-xs select-text leading-relaxed">{sqlResult.rows ? sqlResult.rows[0][0] : 'Query syntax parser check rejected parameters.'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl" id="sql-results-not-run">
                  <Terminal className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold">Execute an SQL query or select a table schema to load its live registers.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-105 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2" id="dbms-meta-footer">
              <span>SQLite & System API interface live persistence synchronization</span>
              <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 animate-pulse">SYSTEM: MySQL Native Connector (simulated) V1.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
}
