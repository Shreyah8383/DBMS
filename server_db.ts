import fs from 'fs';
import path from 'path';
import { Patient, Doctor, Appointment, EmergencyRequest, Admin } from './src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');

// Memory tables synced to disk
interface DatabaseSchema {
  admins: Admin[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  emergency_requests: EmergencyRequest[];
  statistics: {
    totalVisitorCount: number;
  };
}

// Default Seed Data matching schema.sql
const DEFAULT_DB: DatabaseSchema = {
  admins: [
    { id: 1, username: 'admin', fullName: 'System Administrator', email: 'admin@lifeline.org' },
    { id: 2, username: 'shreya', fullName: 'Dr. Shreya Hari', email: 'shreyah8383@gmail.com' }
  ],
  doctors: [
    {
      id: 1,
      username: 'dr_smith',
      fullName: 'Dr. Robert Smith',
      email: 'robert.smith@lifeline.org',
      specialization: 'Cardiology',
      experienceYears: 15,
      phone: '+1 555-0199',
      consultationFee: 150.00,
      availabilityHours: '09:00 AM - 03:00 PM',
      statusActive: true
    },
    {
      id: 2,
      username: 'dr_patel',
      fullName: 'Dr. Aisha Patel',
      email: 'aisha.patel@lifeline.org',
      specialization: 'Pediatrics',
      experienceYears: 10,
      phone: '+1 555-0188',
      consultationFee: 120.00,
      availabilityHours: '10:00 AM - 04:00 PM',
      statusActive: true
    },
    {
      id: 3,
      username: 'dr_garcia',
      fullName: 'Dr. Carlos Garcia',
      email: 'carlos.garcia@lifeline.org',
      specialization: 'Neurology',
      experienceYears: 18,
      phone: '+1 555-0177',
      consultationFee: 180.00,
      availabilityHours: '01:00 PM - 06:00 PM',
      statusActive: true
    },
    {
      id: 4,
      username: 'dr_lee',
      fullName: 'Dr. Sarah Lee',
      email: 'sarah.lee@lifeline.org',
      specialization: 'Dermatology',
      experienceYears: 8,
      phone: '+1 555-0166',
      consultationFee: 100.00,
      availabilityHours: '09:00 AM - 01:00 PM',
      statusActive: true
    },
    {
      id: 5,
      username: 'dr_taylor',
      fullName: 'Dr. James Taylor',
      email: 'james.taylor@lifeline.org',
      specialization: 'General Medicine',
      experienceYears: 12,
      phone: '+1 555-0155',
      consultationFee: 80.00,
      availabilityHours: '08:00 AM - 04:00 PM',
      statusActive: true
    }
  ],
  patients: [
    {
      id: 1,
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 555-0111',
      dob: '1985-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      medicalHistory: 'Mild hypertension diagnosed in 2021',
      allergies: 'Penicillin'
    },
    {
      id: 2,
      username: 'jane_watson',
      fullName: 'Jane Watson',
      email: 'jane.watson@yahoo.com',
      phone: '+1 555-0122',
      dob: '1992-09-21',
      gender: 'Female',
      bloodGroup: 'A-',
      medicalHistory: 'None',
      allergies: 'Peanuts, Pollen'
    },
    {
      id: 3,
      username: 'mike_ross',
      fullName: 'Michael Ross',
      email: 'mross@pearson.com',
      phone: '+1 555-0133',
      dob: '1988-11-03',
      gender: 'Male',
      bloodGroup: 'B+',
      medicalHistory: 'Slight chronic back pain',
      allergies: 'Dust Mites'
    }
  ],
  appointments: [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentDate: '2026-05-25',
      appointmentTime: '10:00 AM',
      reason: 'Routine cardiology checkup and blood pressure monitoring.',
      prescription: 'Lisinopril 10mg daily',
      diagnosis: 'Stage 1 Hypertension',
      status: 'Confirmed'
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 4,
      appointmentDate: '2026-05-26',
      appointmentTime: '11:00 AM',
      reason: 'Skin rash on forearms.',
      prescription: null,
      diagnosis: null,
      status: 'Pending'
    },
    {
      id: 3,
      patientId: 3,
      doctorId: 5,
      appointmentDate: '2026-05-24',
      appointmentTime: '09:00 AM',
      reason: 'Severe seasonal allergies and sore throat.',
      prescription: 'Cetirizine 10mg, Saltwater gargles',
      diagnosis: 'Allergic Pharyngitis',
      status: 'Completed'
    }
  ],
  emergency_requests: [
    {
      id: 1,
      callerName: 'Eleanor Vance',
      callerPhone: '+1 555-9001',
      locationAddress: '742 Evergreen Terrace, Springfield',
      emergencyType: 'Shortness of Breath',
      status: 'Dispatched',
      ambulanceId: 'AMB-04',
      assignedHospital: 'St. Mary Community Hospital'
    },
    {
      id: 2,
      callerName: 'Arthur Dent',
      callerPhone: '+1 555-9002',
      locationAddress: '108 Finchley Road, Westside',
      emergencyType: 'Accidental Fall / Head Injury',
      status: 'Assigned',
      ambulanceId: 'AMB-09',
      assignedHospital: 'City General Hospital'
    },
    {
      id: 3,
      callerName: 'Sarah Connor',
      callerPhone: '+1 555-9003',
      locationAddress: '1401 Sector 9 Industrial Ave',
      emergencyType: 'Deep laceration on right thigh',
      status: 'Pending',
      ambulanceId: null,
      assignedHospital: null
    }
  ],
  statistics: {
    totalVisitorCount: 42
  }
};

let db: DatabaseSchema = { ...DEFAULT_DB };

// Initialize Database (Load or Seed)
export function initDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
      console.log('✔ Database loaded from file:', DB_FILE);
    } else {
      saveDB();
      console.log('✔ Database initialized and seeded with default data:', DB_FILE);
    }
  } catch (err) {
    console.error('Error loading database, resetting to default seed:', err);
    db = { ...DEFAULT_DB };
    saveDB();
  }
}

// Persists the current state to disk
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database to disk:', err);
  }
}

// --- DATABASE QUERIES & OPERATIONS IN INTERMEDIATE JS ---

export const dbOperations = {
  // --- PATIENTS ---
  getPatients: () => db.patients,
  
  getPatientById: (id: number) => db.patients.find(p => p.id === id),
  
  findPatientByUsername: (username: string) => db.patients.find(p => p.username === username),
  
  findPatientByEmail: (email: string) => db.patients.find(p => p.email === email),
  
  createPatient: (patientData: Omit<Patient, 'id'>) => {
    const newId = db.patients.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
    const newPatient: Patient = {
      id: newId,
      ...patientData,
      createdAt: new Date().toISOString()
    };
    db.patients.push(newPatient);
    saveDB();
    return newPatient;
  },
  
  updatePatient: (id: number, patientData: Partial<Patient>) => {
    const idx = db.patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.patients[idx] = { ...db.patients[idx], ...patientData };
      saveDB();
      return db.patients[idx];
    }
    return null;
  },

  deletePatient: (id: number) => {
    // Relational cleanup: cancel all appointments for this patient
    db.appointments = db.appointments.filter(a => a.patientId !== id);
    db.patients = db.patients.filter(p => p.id !== id);
    saveDB();
    return true;
  },

  // --- DOCTORS ---
  getDoctors: () => db.doctors,
  
  getDoctorById: (id: number) => db.doctors.find(d => d.id === id),
  
  findDoctorByUsername: (username: string) => db.doctors.find(d => d.username === username),
  
  createDoctor: (doctorData: Omit<Doctor, 'id'>) => {
    const newId = db.doctors.reduce((max, d) => d.id > max ? d.id : max, 0) + 1;
    const newDoctor: Doctor = {
      id: newId,
      ...doctorData,
      createdAt: new Date().toISOString()
    };
    db.doctors.push(newDoctor);
    saveDB();
    return newDoctor;
  },

  updateDoctor: (id: number, doctorData: Partial<Doctor>) => {
    const idx = db.doctors.findIndex(d => d.id === id);
    if (idx !== -1) {
      db.doctors[idx] = { ...db.doctors[idx], ...doctorData };
      saveDB();
      return db.doctors[idx];
    }
    return null;
  },

  deleteDoctor: (id: number) => {
    // Relational cleanup: cancel all appointments for this doctor
    db.appointments = db.appointments.filter(a => a.doctorId !== id);
    db.doctors = db.doctors.filter(d => d.id !== id);
    saveDB();
    return true;
  },

  // --- APPOINTMENTS ---
  getAppointments: () => {
    // Simulates an SQL JOIN:
    // SELECT a.*, p.full_name AS patientName, d.full_name AS doctorName, d.specialization AS doctorSpecialization
    // FROM appointments a
    // JOIN patients p ON a.patient_id = p.id
    // JOIN doctors d ON a.doctor_id = d.id
    return db.appointments.map(app => {
      const patient = db.patients.find(p => p.id === app.patientId);
      const doctor = db.doctors.find(d => d.id === app.doctorId);
      return {
        ...app,
        patientName: patient ? patient.fullName : 'Unknown Patient',
        doctorName: doctor ? doctor.fullName : 'Unknown Doctor',
        doctorSpecialization: doctor ? doctor.specialization : 'Unknown Focus'
      };
    });
  },

  getAppointmentsByPatient: (patientId: number) => {
    return dbOperations.getAppointments().filter(a => a.patientId === patientId);
  },

  getAppointmentsByDoctor: (doctorId: number) => {
    return dbOperations.getAppointments().filter(a => a.doctorId === doctorId);
  },

  createAppointment: (appointmentData: Omit<Appointment, 'id'>) => {
    const newId = db.appointments.reduce((max, a) => a.id > max ? a.id : max, 0) + 1;
    const newAppointment: Appointment = {
      id: newId,
      ...appointmentData,
      createdAt: new Date().toISOString()
    };
    db.appointments.push(newAppointment);
    saveDB();
    return newAppointment;
  },

  updateAppointmentStatus: (id: number, status: Appointment['status']) => {
    const idx = db.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.appointments[idx].status = status;
      saveDB();
      return db.appointments[idx];
    }
    return null;
  },

  updateAppointmentDetails: (id: number, diagnosis: string | null, prescription: string | null, status?: Appointment['status']) => {
    const idx = db.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.appointments[idx].diagnosis = diagnosis;
      db.appointments[idx].prescription = prescription;
      if (status) {
        db.appointments[idx].status = status;
      }
      saveDB();
      return db.appointments[idx];
    }
    return null;
  },

  // --- EMERGENCY REQUESTS ---
  getEmergencyRequests: () => db.emergency_requests,
  
  createEmergencyRequest: (reqData: Omit<EmergencyRequest, 'id'>) => {
    const newId = db.emergency_requests.reduce((max, r) => r.id > max ? r.id : max, 0) + 1;
    const newReq: EmergencyRequest = {
      id: newId,
      ...reqData,
      createdAt: new Date().toISOString()
    };
    db.emergency_requests.push(newReq);
    saveDB();
    return newReq;
  },

  updateEmergencyRequest: (id: number, updateData: Partial<EmergencyRequest>) => {
    const idx = db.emergency_requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.emergency_requests[idx] = { ...db.emergency_requests[idx], ...updateData };
      saveDB();
      return db.emergency_requests[idx];
    }
    return null;
  },

  // --- ADMINS ---
  getAdmins: () => db.admins,
  
  findAdminByUsername: (username: string) => db.admins.find(a => a.username === username),

  // --- STATS ---
  getStats: () => {
    const totalPatients = db.patients.length;
    const totalDoctors = db.doctors.length;
    const totalAppointments = db.appointments.length;
    const activeEmergencies = db.emergency_requests.filter(r => r.status !== 'Resolved').length;
    
    // Appointment dynamic aggregations (by status)
    const pendingAppointments = db.appointments.filter(a => a.status === 'Pending').length;
    const completedAppointments = db.appointments.filter(a => a.status === 'Completed').length;
    
    // Active specializations count
    const uniqueSpecs = Array.from(new Set(db.doctors.map(d => d.specialization))).length;

    // Unique count of users who booked online appointments
    const bookedPatientsCount = Array.from(new Set(db.appointments.map(a => a.patientId))).length;

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      activeEmergencies,
      pendingAppointments,
      completedAppointments,
      uniqueSpecializations: uniqueSpecs,
      visitorCount: db.statistics.totalVisitorCount,
      bookedPatientsCount
    };
  },

  incrementVisitorCount: () => {
    db.statistics.totalVisitorCount++;
    saveDB();
    return db.statistics.totalVisitorCount;
  },

  executeSQL: (query: string): { success: boolean; columns: string[]; rows: any[]; message?: string } => {
    const camelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const snakeCase = (str: string) => {
      if (str === 'id') return 'id';
      return str.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);
    };

    try {
      const sql = query.trim().replace(/;+$/, '');
      
      // Parse SELECT
      const selectMatch = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?$/i);
      if (selectMatch) {
         let [, colsStr, tableName, whereStr] = selectMatch;
         tableName = tableName.toLowerCase();
         
         const tableKeys: Record<string, string> = {
           admins: 'admins',
           doctors: 'doctors',
           patients: 'patients',
           appointments: 'appointments',
           emergency_requests: 'emergency_requests'
         };
         
         const mappedTable = tableKeys[tableName];
         if (!mappedTable) {
           return { success: false, columns: ['Error'], rows: [[`Table '${tableName}' not found in database registry. Try: patients, doctors, appointments, emergency_requests, admins.`]] };
         }
         
         let items = [...(db[mappedTable as keyof DatabaseSchema] as any[])];
         
         if (whereStr) {
           whereStr = whereStr.trim();
           const equalsMatch = whereStr.match(/^(\w+)\s*=\s*(['"]?)(.+?)\2$/i);
           const likeMatch = whereStr.match(/^(\w+)\s+LIKE\s+(['"]?)%?(.+?)%?\2$/i);
           
           if (equalsMatch) {
             const [, col, , val] = equalsMatch;
             items = items.filter(item => {
               const itemVal = item[col] !== undefined ? item[col] : item[camelCase(col)];
               return String(itemVal).toLowerCase() === String(val).toLowerCase();
             });
           } else if (likeMatch) {
             const [, col, , val] = likeMatch;
             items = items.filter(item => {
               const itemVal = item[col] !== undefined ? item[col] : item[camelCase(col)];
               return String(itemVal).toLowerCase().includes(String(val).toLowerCase());
             });
           }
         }
         
         if (items.length === 0) {
           const columns = colsStr === '*' ? ['id'] : colsStr.split(',').map(c => c.trim());
           return { success: true, columns, rows: [], message: '0 rows returned' };
         }
         
         let cols: string[] = [];
         if (colsStr === '*') {
           cols = Object.keys(items[0]).map(k => snakeCase(k));
         } else {
           cols = colsStr.split(',').map(c => c.trim().toLowerCase());
         }
         
         const rows = items.map(item => {
           return cols.map(col => {
             const val = item[col] !== undefined ? item[col] : item[camelCase(col)];
             if (val === null || val === undefined) return 'NULL';
             if (typeof val === 'object') return JSON.stringify(val);
             return val;
           });
         });
         
         return {
           success: true,
           columns: cols.map(c => c.toUpperCase()),
           rows,
           message: `${rows.length} row(s) returned successfully`
         };
      }
      
      // Parse INSERT
      const insertMatch = sql.match(/^INSERT\s+INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)$/i);
      if (insertMatch) {
         let [, tableName, colsStr, valsStr] = insertMatch;
         tableName = tableName.toLowerCase();
         
         const tableKeys: Record<string, string> = {
           admins: 'admins',
           doctors: 'doctors',
           patients: 'patients',
           appointments: 'appointments',
           emergency_requests: 'emergency_requests'
         };
         
         const mappedTable = tableKeys[tableName];
         if (!mappedTable) {
           return { success: false, columns: ['Error'], rows: [[`Table '${tableName}' not found.`]] };
         }
         
         const cols = colsStr.split(',').map(c => c.trim().toLowerCase());
         const rawVals = valsStr.split(',').map(v => v.trim());
         const vals = rawVals.map(v => v.replace(/^['"]|['"]$/g, ''));
         
         if (cols.length !== vals.length) {
           return { success: false, columns: ['Error'], rows: [[`Column count (${cols.length}) does not match value value count (${vals.length})`]] };
         }
         
         const targetList = db[mappedTable as keyof DatabaseSchema] as any[];
         const newId = targetList.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
         
         const newObj: any = { id: newId };
         cols.forEach((col, idx) => {
           const jsKey = camelCase(col);
           const val = vals[idx];
           if (!isNaN(Number(val)) && val.trim() !== '') {
             newObj[jsKey] = Number(val);
           } else if (val.toLowerCase() === 'true') {
             newObj[jsKey] = true;
           } else if (val.toLowerCase() === 'false') {
             newObj[jsKey] = false;
           } else if (val.toLowerCase() === 'null') {
             newObj[jsKey] = null;
           } else {
             newObj[jsKey] = val;
           }
         });
         
         targetList.push(newObj);
         saveDB();
         
         return {
           success: true,
           columns: ['STATUS', 'MESSAGE', 'INSERTED_ID'],
           rows: [['SUCCESS', `Successfully inserted 1 row into table '${tableName}'`, newId]],
           message: `1 row inserted. ID assigned: ${newId}`
         };
      }
      
      // Parse DELETE
      const deleteMatch = sql.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?$/i);
      if (deleteMatch) {
         let [, tableName, whereStr] = deleteMatch;
         tableName = tableName.toLowerCase();
         
         const tableKeys: Record<string, string> = {
           admins: 'admins',
           doctors: 'doctors',
           patients: 'patients',
           appointments: 'appointments',
           emergency_requests: 'emergency_requests'
         };
         
         const mappedTable = tableKeys[tableName];
         if (!mappedTable) {
           return { success: false, columns: ['Error'], rows: [[`Table '${tableName}' not found.`]] };
         }
         
         let items = db[mappedTable as keyof DatabaseSchema] as any[];
         const originalLength = items.length;
         
         if (whereStr) {
           whereStr = whereStr.trim();
           const equalsMatch = whereStr.match(/^(\w+)\s*=\s*(['"]?)(.+?)\2$/i);
           if (equalsMatch) {
             const [, col, , val] = equalsMatch;
             const jsKey = camelCase(col);
             
             db[mappedTable as keyof DatabaseSchema] = items.filter(item => {
               const itemVal = item[col] !== undefined ? item[col] : item[jsKey];
               return String(itemVal).toLowerCase() !== String(val).toLowerCase();
             }) as any;
             saveDB();
           } else {
             return { success: false, columns: ['Error'], rows: [[`Unsupported DELETE WHERE condition. Only simple 'col = val' queries supported.`]] };
           }
         } else {
           db[mappedTable as keyof DatabaseSchema] = [] as any;
           saveDB();
         }
         
         const deletedCount = originalLength - (db[mappedTable as keyof DatabaseSchema] as any[]).length;
         return {
           success: true,
           columns: ['STATUS', 'MESSAGE', 'COMMAND'],
           rows: [['SUCCESS', `Successfully deleted ${deletedCount} row(s) from '${tableName}'`, `DELETE ${deletedCount}`]],
           message: `Query OK, ${deletedCount} rows affected`
         };
      }
      
      return {
        success: false,
        columns: ['Error'],
        rows: [[`Unsupported SQL query. Supported: SELECT, INSERT, DELETE tables: patients, doctors, appointments, emergency_requests, admins.`]],
        message: 'Unsupported command'
      };
      
    } catch (e: any) {
      return {
        success: false,
        columns: ['Exception'],
        rows: [[e.message || 'Unknown database query parser exception']],
        message: 'Error'
      };
    }
  }
};
