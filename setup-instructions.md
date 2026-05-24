# Life Line – A Health Assistance Web App Set-up Guide

Welcome to **Life Line**, a modern, responsive full-stack medical and health assistance platform built using **React with Vite (TypeScript)** on the frontend, and **Node.js with Express** on the backend. This document provides step-by-step instructions to configure, run, and link the relational databases.

---

## 📂 Folders & Files Structure Overview

The application is structured into modular layers adhering to professional React/Node.js best practices:

```text
/
├── .env.example              # Example environment parameters
├── database.json             # Local persistent JSON database (fallback/simulate SQL)
├── index.html                # Vite entry template page
├── metadata.json             # AI Studio app capabilities config
├── package.json              # Package metadata and execution scripts
├── schema.sql                # Complete MySQL DDL tables schema with seed values
├── server.ts                 # Express full-stack API server entry point
├── server_db.ts              # Stateful data persistence controller
├── tsconfig.json             # TypeScript compiler rules
├── vite.config.ts            # Vite compile and watcher parameters
│
└── src/
    ├── App.tsx               # Main React Router & Authentication driver
    ├── index.css             # Tailwinds directives and custom scrollbar styles
    ├── main.tsx              # React mounting entry point
    ├── types.ts              # Global TypeScript interfaces matching SQL DDL
    └── components/
        ├── AIChatAdvisor.tsx # Interactive medical helper chatbot powered by Gemini
        ├── BMICalculator.tsx # Interactive BMI health calculator
        ├── HomeView.tsx      # Public landing page with Ambulance dispatcher 
        ├── PatientDashboard.tsx # Patient booking & history tracking portal
        ├── DoctorDashboard.tsx  # Doctor treatment & prescription desk
        └── AdminDashboard.tsx   # Executive panel for coordinating hospital on-duty rosters
```

---

## 🛠️ Step-by-Step Local Setup

To run this application locally, follow these simple directives.

### Prerequisite Setup

Make sure you have [Node.js (v18+)](https://nodejs.org) installed on your system.

### 1. Install Dependencies
Run the install command inside the directory:
```bash
npm install
```

### 2. Configure Environment Secrets
Create a `.env` file in the root directory mirroring `.env.example`:
```env
GEMINI_API_KEY="your-actual-api-key"
```
*Note: AI Studio automatically feeds the Gemini keys if imported inside the workspace.*

### 3. Spin up local Database (MySQL)
To run a local MySQL database:
1. Log into your command line or administrative client (e.g. phpMyAdmin, Workbench):
   ```bash
   mysql -u root -p
   ```
2. Open and run the DDL schema commands housed inside the [`/schema.sql`](/schema.sql) file:
   ```sql
   SOURCE schema.sql;
   ```
This instantly constructs tables inside a database named `lifeline_db` with index constraints, foreign key cascades, and loads all rich default sample clinical data!

### 4. Run Development Workspace
Start the full-stack development server by running:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** to interact with the responsive interface.

### 5. Build for Production Deployment
To generate finalized, bundled, and compiled assets for web hosting or Docker containers:
```bash
npm run build
```
This commands:
1. Compiles and assets-optimizes the HTML/JS frontend bundle into `dist/`.
2. Bundles the backend Express Node.js codes into a safe, stand-alone file `/dist/server.cjs` via `esbuild`.


---

## 👥 Demo Log-in Credentials
Feel free to test distinct roles using these integrated credentials:

| Portal Role | Username | Password | Actions / Access |
|---|---|---|---|
| **Patient Profile** | `john_doe` | `patient123` | Book slot, edit allergy files, check prescriptions |
| **Specialist Doctor** | `dr_smith` | `doctor123` | Accept appointments, write diagnoses, log prescriptions |
| **System Administrator** | `admin` | `admin123` | Create new doctor cards, manage files, dispatch Ambulance vehicles |
