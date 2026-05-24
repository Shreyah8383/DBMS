import React, { useState, useEffect } from 'react';
import { CalendarClock, UserCheck, ShieldAlert, FileHeart, ClipboardList, PlusCircle, RefreshCw, CheckCircle2, AlertTriangle, Trash2, HeartPulse, Sparkles } from 'lucide-react';
import { Patient, Doctor, Appointment } from '../types';

interface PatientDashboardProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

export default function PatientDashboard({ patient, onUpdatePatient }: PatientDashboardProps) {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('09:00 AM');
  const [bookingReason, setBookingReason] = useState<string>('');
  
  // Edit Profile Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(patient.fullName);
  const [phone, setPhone] = useState(patient.phone);
  const [dob, setDob] = useState(patient.dob);
  const [gender, setGender] = useState(patient.gender);
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup);
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory);
  const [allergies, setAllergies] = useState(patient.allergies);

  const [loading, setLoading] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ error: '', info: '' });

  useEffect(() => {
    fetchResources();
  }, [patient.id]);

  const fetchResources = async () => {
    setLoading(true);
    setFormFeedback({ error: '', info: '' });
    try {
      // 1. Fetch live appointments for this patient
      const appointmentsRes = await fetch(`/api/appointments?patientId=${patient.id}`);
      if (appointmentsRes.ok) {
        const apps = await appointmentsRes.json();
        setAppointments(apps);
      }

      // 2. Fetch doctors for the dropdown booking menu
      const doctorsRes = await fetch('/api/doctors');
      if (doctorsRes.ok) {
        const docs = await doctorsRes.json();
        setDoctorsList(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching patient dashboard lists:', err);
      setFormFeedback({ error: 'Gateway issue syncronizing patient data.', info: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ error: '', info: '' });

    if (!fullName || !phone || !dob) {
      setFormFeedback({ error: 'Please populate required profile credentials.', info: '' });
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          phone,
          dob,
          gender,
          bloodGroup,
          medicalHistory,
          allergies
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdatePatient(data.patient);
        setIsEditingProfile(false);
        setFormFeedback({ error: '', info: 'Profile medical record updated successfully.' });
      } else {
        const data = await res.json();
        setFormFeedback({ error: data.error || 'Failed to update user profile record.', info: '' });
      }
    } catch (err) {
      console.error(err);
      setFormFeedback({ error: 'Server communication failed.', info: '' });
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ error: '', info: '' });

    if (!selectedDoctorId || !bookingDate || !bookingTime || !bookingReason) {
      setFormFeedback({ error: 'Please choose doctor, date, timeslot, and symptom reason.', info: '' });
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: Number(selectedDoctorId),
          appointmentDate: bookingDate,
          appointmentTime: bookingTime,
          reason: bookingReason
        })
      });

      if (res.ok) {
        setBookingReason('');
        setBookingDate('');
        setFormFeedback({ error: '', info: 'Your appointment was successfully submitted for confirmation!' });
        fetchResources(); // Refresh list structure
      } else {
        const data = await res.json();
        setFormFeedback({ error: data.error || 'Failed to book slot. Try other timeline intervals.', info: '' });
      }
    } catch (err) {
      console.error(err);
      setFormFeedback({ error: 'Network communication failure.', info: '' });
    }
  };

  const handleCancelBooking = async (appointmentId: number) => {
    const doubleConfirm = window.confirm('Are you sure you want to cancel this scheduled appointment?');
    if (!doubleConfirm) return;

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (res.ok) {
        setFormFeedback({ error: '', info: 'Schedules cancelled successfully.' });
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="id-patient-dashboard" id="patient-dashboard-wrapper">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" id="patient-dashboard-header">
        <div className="text-left">
          <h2 className="text-3xl font-serif font-black italic text-blue-950 dark:text-blue-105">Welcome back, {patient.fullName}!</h2>
          <p className="text-xs text-slate-500 font-medium">Configure medical history logs, coordinate specialist bookings, and view clinical assessments.</p>
        </div>
        <button
          onClick={fetchResources}
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
          id="patient-refresh-btn"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Patient Records
        </button>
      </div>

      {formFeedback.info && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="patient-info-banner">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{formFeedback.info}</span>
        </div>
      )}

      {formFeedback.error && (
        <div className="p-4 bg-rose-50 border border-rose-150 text-rose-800 text-xs font-bold rounded-2xl mb-6 text-left flex items-center gap-2" id="patient-error-banner">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{formFeedback.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="patient-layout-grid">
        {/* Profile Card & Editing Pane */}
        <div className="lg:col-span-5 space-y-6" id="patient-profile-aside">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6" id="patient-profile-card">
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5" id="patient-profile-head">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-750 font-black text-lg">
                  {patient.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">{patient.fullName}</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">Patient Account</span>
                </div>
              </div>
              <button
                id="patient-edit-trigger-btn"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Medical File'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-left" id="patient-edit-profile-form">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      placeholder="e.g. O+"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Medical Record history</label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
                <button
                  id="patient-save-profile-btn"
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  Save Clinic Card Updates
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-left" id="patient-profile-[display]">
                {/* Visual medical status row */}
                <div className="grid grid-cols-2 gap-4" id="patient-spec-blocks">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100" id="patient-dob-cell">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Birth Date</span>
                    <span className="text-xs font-bold text-slate-700">{patient.dob}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100" id="patient-gender-cell">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Gender / Blood</span>
                    <span className="text-xs font-bold text-slate-700">{patient.gender} • {patient.bloodGroup || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-3" id="patient-records-display">
                  <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl" id="patient-details-allergies">
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 font-extrabold mb-1">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      Patient Allergies File
                    </div>
                    <p className="text-xs font-medium text-slate-600 pl-5 leading-relaxed">{patient.allergies || 'No allergies reported.'}</p>
                  </div>

                  <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl" id="patient-details-history">
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-extrabold mb-1">
                      <FileHeart className="h-4 w-4 shrink-0" />
                      Active Medical Conditions
                    </div>
                    <p className="text-xs font-medium text-slate-600 pl-5 leading-relaxed">{patient.medicalHistory || 'No diagnosed chronic conditions reported.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Booking Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 text-left" id="patient-book-card">
            <h3 className="font-extrabold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-blue-600" /> Book Consultation Online
            </h3>
            <p className="text-xs text-slate-400 mb-6">Coordinate consultation schedules. Choose on-call specialist physicians.</p>

            <form onSubmit={handleBookAppointment} className="space-y-4" id="patient-booking-form">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Select Professional Physician</label>
                <select
                  id="booking-doctor-select"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.fullName} ({doc.specialization} • ${doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Calendar Date</label>
                  <input
                    type="date"
                    id="booking-date-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Preferred Time slot</label>
                  <select
                    id="booking-time-select"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Symptom Reason / Medical concerns</label>
                <textarea
                  id="booking-reason-input"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="State details for your specialist visit (e.g. chronic headache, rash, chest checkup...)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                id="booking-submit-btn"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
              >
                Submit Consultation Request
              </button>
            </form>
          </div>
        </div>

        {/* Existing Bookings Tracking Dashboard */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between" id="patient-bookings-panel">
          <div className="text-left mb-6" id="patient-bookings-title">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" /> Assisted Calendars & Status Track
            </h3>
            <p className="text-xs text-slate-400">Review status logs, prescriptions, and physician diagnostic directives.</p>
          </div>

          <div className="flex-1 space-y-4" id="patient-appointments-list">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <div key={app.id} className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 hover:border-slate-200 transition-colors text-left" id={`app-track-card-${app.id}`}>
                  <div className="flex justify-between items-start" id={`app-track-header-${app.id}`}>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                        <HeartPulse className="h-3.5 w-3.5 text-blue-600" />
                        {app.doctorName || 'Assigned Doctor'}
                      </h4>
                      <p className="text-[10px] text-slate-400">{app.doctorSpecialization} • {app.appointmentDate} at {app.appointmentTime}</p>
                    </div>
                    {/* Status badges */}
                    <span
                      id={`app-status-badge-${app.id}`}
                      className={`text-[9px] font-extrabold px-2.5 py-1.5 rounded-full uppercase leading-none ${
                        app.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-150'
                          : app.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                          : app.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-150'
                          : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="pl-5 text-xs border-l-2 border-slate-200 space-y-1 bg-white/70 p-2.5 rounded-r-xl" id={`app-track-reason-block-${app.id}`}>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">Patient Reason:</span>
                    <p className="text-slate-600 font-semibold leading-normal">{app.reason}</p>
                  </div>

                  {app.diagnosis && (
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl" id={`app-directives-block-${app.id}`}>
                      <div className="flex items-center gap-1 bg-white/60 p-2 rounded-lg border border-blue-50 text-xs text-blue-800 font-extrabold mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Clinical Diagnostic Summary:
                      </div>
                      <p className="text-xs text-slate-700 pl-4 leading-normal">
                        <strong>Diagnosis:</strong> {app.diagnosis}
                      </p>
                      {app.prescription && (
                        <p className="text-xs text-slate-700 pl-4 mt-1.5 leading-normal">
                          <strong>Active Prescription:</strong> <span className="bg-white/90 border border-slate-150 px-2 py-0.5 rounded text-slate-800 font-bold ml-1">{app.prescription}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {app.status === 'Pending' && (
                    <div className="flex justify-end pt-1" id={`app-cancel-controls-${app.id}`}>
                      <button
                        onClick={() => handleCancelBooking(app.id)}
                        className="text-[11px] text-rose-600 font-bold hover:bg-rose-50 border border-transparent hover:border-rose-200 px-3 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                        id={`app-cancel-btn-${app.id}`}
                      >
                        <Trash2 className="h-3 w-3" /> Cancel Slot Booking
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-dashed border-slate-150 rounded-2xl" id="appointments-empty-state">
                <CalendarClock className="h-12 w-12 text-slate-350 mb-3" />
                <h4 className="font-bold text-sm text-slate-700">No appointments scheduled active.</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Use the booking panel on the left to schedule consultations with our specialists!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
