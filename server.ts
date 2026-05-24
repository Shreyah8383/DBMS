import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initDB, dbOperations } from './server_db';

const app = express();
const PORT = 3000;

// Initialize file-based persistence DB
initDB();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init AI chatbot using standard Server-side Gemini API key
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('✔ Gemini AI client successfully initialized.');
  } catch (err) {
    console.error('Error initializing GoogleGenAI client:', err);
  }
} else {
  console.log('⚠ GEMINI_API_KEY is not defined. AI chatbot will run in simulation mode.');
}

// Increment platform visit stat
dbOperations.incrementVisitorCount();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// -- HEALTH & LOGISTICS --
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -- LOGIN --
app.post('/api/auth/login', (req, res) => {
  const { username, password, requestedRole } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Simple clean mock credentials login (supports client roles: patient, doctor, admin)
  if (requestedRole === 'admin') {
    const admin = dbOperations.findAdminByUsername(username);
    if (admin && password === 'admin123') {
      return res.json({ success: true, role: 'admin', user: admin });
    }
  } else if (requestedRole === 'doctor') {
    const doctor = dbOperations.findDoctorByUsername(username);
    if (doctor && password === 'doctor123') {
      return res.json({ success: true, role: 'doctor', user: doctor });
    }
  } else {
    // default to patient
    const patient = dbOperations.findPatientByUsername(username);
    if (patient && password === 'patient123') {
      return res.json({ success: true, role: 'patient', user: patient });
    }
  }

  return res.status(401).json({ error: 'Invalid credentials or matched account. Please try again.' });
});

// -- REGISTER PATIENT --
app.post('/api/auth/register', (req, res) => {
  const { username, fullName, email, phone, dob, gender, bloodGroup, medicalHistory, allergies } = req.body;

  if (!username || !fullName || !email || !phone || !dob) {
    return res.status(400).json({ error: 'Required registration fields are missing' });
  }

  if (dbOperations.findPatientByUsername(username)) {
    return res.status(400).json({ error: 'Username is already registered.' });
  }

  if (dbOperations.findPatientByEmail(email)) {
    return res.status(400).json({ error: 'Email address is already in use.' });
  }

  const newPatient = dbOperations.createPatient({
    username,
    fullName,
    email,
    phone,
    dob,
    gender: gender || 'Other',
    bloodGroup: bloodGroup || 'O+',
    medicalHistory: medicalHistory || 'None reported',
    allergies: allergies || 'None reported'
  });

  res.json({ success: true, patient: newPatient });
});

// -- DOCTORS CORE REST --
app.get('/api/doctors', (req, res) => {
  const doctors = dbOperations.getDoctors();
  res.json(doctors);
});

app.post('/api/doctors', (req, res) => {
  const { username, fullName, email, specialization, experienceYears, phone, consultationFee, availabilityHours } = req.body;
  if (!username || !fullName || !specialization) {
    return res.status(400).json({ error: 'Required doctor fields are missing.' });
  }
  const newDoc = dbOperations.createDoctor({
    username,
    fullName,
    email: email || `${username}@lifeline.org`,
    specialization,
    experienceYears: Number(experienceYears) || 5,
    phone: phone || '+1 555-0100',
    consultationFee: Number(consultationFee) || 50,
    availabilityHours: availabilityHours || '09:00 AM - 05:00 PM',
    statusActive: true
  });
  res.json({ success: true, doctor: newDoc });
});

app.put('/api/doctors/:id', (req, res) => {
  const docId = Number(req.params.id);
  const updatedDoc = dbOperations.updateDoctor(docId, req.body);
  if (updatedDoc) {
    res.json({ success: true, doctor: updatedDoc });
  } else {
    res.status(404).json({ error: 'Doctor not found.' });
  }
});

app.delete('/api/doctors/:id', (req, res) => {
  const docId = Number(req.params.id);
  const success = dbOperations.deleteDoctor(docId);
  res.json({ success });
});

// -- PATIENTS PROFILE & MEDICAL RECORDS --
app.get('/api/patients', (req, res) => {
  const patients = dbOperations.getPatients();
  res.json(patients);
});

app.put('/api/patients/:id', (req, res) => {
  const patientId = Number(req.params.id);
  const updated = dbOperations.updatePatient(patientId, req.body);
  if (updated) {
    res.json({ success: true, patient: updated });
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

app.delete('/api/patients/:id', (req, res) => {
  const id = Number(req.params.id);
  const success = dbOperations.deletePatient(id);
  res.json({ success });
});

// -- APPOINTMENTS CORE REST --
app.get('/api/appointments', (req, res) => {
  const { doctorId, patientId } = req.query;
  let list = dbOperations.getAppointments();

  if (doctorId) {
    list = list.filter(a => a.doctorId === Number(doctorId));
  } else if (patientId) {
    list = list.filter(a => a.patientId === Number(patientId));
  }

  res.json(list);
});

app.post('/api/appointments', (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
    return res.status(400).json({ error: 'Required booking parameters are missing.' });
  }

  const newApp = dbOperations.createAppointment({
    patientId: Number(patientId),
    doctorId: Number(doctorId),
    appointmentDate,
    appointmentTime,
    reason,
    prescription: null,
    diagnosis: null,
    status: 'Pending'
  });

  res.json({ success: true, appointment: newApp });
});

app.put('/api/appointments/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const updated = dbOperations.updateAppointmentStatus(id, status);
  if (updated) {
    res.json({ success: true, appointment: updated });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.put('/api/appointments/:id/prescription', (req, res) => {
  const id = Number(req.params.id);
  const { diagnosis, prescription, status } = req.body;
  const updated = dbOperations.updateAppointmentDetails(id, diagnosis, prescription, status);
  if (updated) {
    res.json({ success: true, appointment: updated });
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// -- EMERGENCY SYSTEM API --
app.get('/api/emergency', (req, res) => {
  const requests = dbOperations.getEmergencyRequests();
  res.json(requests);
});

app.post('/api/emergency', (req, res) => {
  const { callerName, callerPhone, locationAddress, emergencyType } = req.body;

  if (!callerName || !callerPhone || !locationAddress || !emergencyType) {
    return res.status(400).json({ error: 'Essential emergency details are missing.' });
  }

  const newReq = dbOperations.createEmergencyRequest({
    callerName,
    callerPhone,
    locationAddress,
    emergencyType,
    status: 'Pending',
    ambulanceId: null,
    assignedHospital: null
  });

  res.json({ success: true, emergencyRequest: newReq });
});

app.put('/api/emergency/:id', (req, res) => {
  const id = Number(req.params.id);
  const updated = dbOperations.updateEmergencyRequest(id, req.body);
  if (updated) {
    res.json({ success: true, emergencyRequest: updated });
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// -- STATS AND DASHBOARD ANALYTICS --
app.get('/api/admin/stats', (req, res) => {
  const stats = dbOperations.getStats();
  res.json(stats);
});

// -- INTERACTIVE RELATIONAL SQL ENGINE --
app.post('/api/admin/sql', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, columns: ['Error'], rows: [['Query parameter is empty']], message: 'Empty query' });
  }
  const result = dbOperations.executeSQL(query);
  res.json(result);
});

// -- ADVANCED AI HEALTH CHAT ADVISOR WITH GEMINI 3.5 FLASH --
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // System Prompt guidance as clinical health advisor assistant
  const systemInstruction = 
    "You are Dr. LifeLine, an virtual medical health assistant on the 'Life Line - A Health Assistance Web App'.\n" +
    "1. Give empathetic, highly structured, clean health advice.\n" +
    "2. In all responses, have a short friendly clinical greeting or acknowledgement.\n" +
    "3. Use bullet points or markdown formatting to make reading wellness points effortless.\n" +
    "4. VERY IMPORTANT: Always add a visible disclaimer/notice at the end (starred: 'Disclaimer: This is general wellness advice for informational purposes. If you are experiencing a severe medical emergency, click \"Emergency Assistance\" immediately or contact your local emergency services (911).').\n" +
    "Keep answers precise, warm, and highly professional under 180 words.";

  // If Gemini client is activated, use actual API call
  if (ai) {
    try {
      // Structure chats content context
      const chatHistoryContext = (history || []).map((h: any) => {
        return `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`;
      }).join('\n');

      const fullPrompt = `System Context: ${systemInstruction}\n\nChat History so far:\n${chatHistoryContext}\n\nUser Question: ${message}\nAssistant Answer (Keep under 180 words, including health tips and final disclaimer):`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
      });

      const replyText = response.text || "I was unable to formulate a complete answer. Please state your query again.";
      return res.json({ reply: replyText });
    } catch (apiError: any) {
      console.error('Gemini API request failed:', apiError);
      // fallback smoothly to intelligent static generator below
    }
  }

  // Pure Local Intelligent Medical Fallback Mock responses for high availability during missing API keys simulation
  const query = message.toLowerCase();
  let responseTip = '';

  if (query.includes('headache') || query.includes('migraine')) {
    responseTip = "For a headache, stay hydrated, rest in a quiet, dark room, and apply a cool compress to your forehead. Keep track of triggers like stress, diet, or lack of sleep. Standard over-the-counter pain relievers can help if appropriate.";
  } else if (query.includes('fever') || query.includes('flu') || query.includes('cold')) {
    responseTip = "Experiencing a cold or fever is common. Rest adequately, consume plenty of fluids (water, warm decaf teas), and monitor your body temperature. Acetaminophen or ibuprofen can help keep temperatures comfortable. Consult your Life Line doctors immediately if fever exceeds 103°F (39.4°C).";
  } else if (query.includes('diet') || query.includes('weight') || query.includes('eat') || query.includes('nutrition')) {
    responseTip = "A balanced plate is essential for wellness. Strive for a bento-style colorful meal: 50% fiber-rich vegetables, 25% lean protein, and 25% whole grains. Limit heavily processed sugars, stay hydrated (2-3 liters/day), and practice eating mindfully!";
  } else if (query.includes('blood pressure') || query.includes('hypertension')) {
    responseTip = "Hypertension requires steady management. Reduce dietary sodium, incorporate 30 minutes of moderate vascular movement daily (brisk walking), limit chronic stress, and record your morning pressure regularly. Book an consultation with Dr. Robert Smith (Cardiology) through patient module.";
  } else {
    responseTip = "That is a great health query. General wellness starts with solid foundation steps: 7-8 hours of continuous sleep, structured hydration (avoiding sugary sodas), daily physical activity, emotional wellness checks, and clean eating. Life Line specialists are available for custom virtual consults.";
  }

  const generatedReply = 
    `Hello! Thanks for reaching out to Life Line health assistance.\n\n` +
    `${responseTip}\n\n` +
    `• **Life Line Tip:** You can also use our **BMI Calculator** below to check your body mass index!\n\n` +
    `***\n*Disclaimer: This is general wellness advice for informational purposes. If you are experiencing a severe medical emergency, click \"Emergency Assistance\" immediately or contact your local emergency services.*`;

  setTimeout(() => {
    res.json({ reply: generatedReply });
  }, 450);
});


// ==========================================
// VITE OR STATIC SERVING IN PRODUCTION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Running Express server in Development Mode with Vite middleware.');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Running Express server in Production static file mode.');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Life Line Server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
