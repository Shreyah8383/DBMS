/**
 * Global TypeScript definitions for Life Line Healthcare App
 */

export interface Admin {
  id: number;
  username: string;
  passwordHash?: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export interface Doctor {
  id: number;
  username: string;
  passwordHash?: string;
  fullName: string;
  email: string;
  specialization: string;
  experienceYears: number;
  phone: string;
  consultationFee: number;
  availabilityHours: string;
  statusActive: boolean;
  createdAt?: string;
}

export interface Patient {
  id: number;
  username: string;
  passwordHash?: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  medicalHistory: string;
  allergies: string;
  createdAt?: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  prescription: string | null;
  diagnosis: string | null;
  status: AppointmentStatus;
  createdAt?: string;
  
  // Joins parsed for UI convenience
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

export type EmergencyStatus = 'Pending' | 'Assigned' | 'Dispatched' | 'Resolved';

export interface EmergencyRequest {
  id: number;
  callerName: string;
  callerPhone: string;
  locationAddress: string;
  emergencyType: string;
  status: EmergencyStatus;
  ambulanceId: string | null;
  assignedHospital: string | null;
  createdAt?: string;
}

export interface HealthTip {
  id: number;
  title: string;
  category: 'Wellness' | 'Nutrition' | 'Exercise' | 'Mental Health' | 'Emergency Prep';
  content: string;
  author: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
