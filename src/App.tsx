import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, User, LogOut, Sun, Moon, Palette,
  Menu, X, Sparkles, Calculator, HelpCircle 
} from 'lucide-react';

import HomeView from './components/HomeView';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import BMICalculator from './components/BMICalculator';
import AIChatAdvisor from './components/AIChatAdvisor';

import { Patient, Doctor, Admin } from './types';

export default function App() {
  // Navigation: 'home' | 'patient' | 'doctor' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'patient' | 'doctor' | 'admin'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('lifeline-luminance') as 'light' | 'dark') || 'light';
  });
  const [colorTheme, setColorTheme] = useState<'blue' | 'teal' | 'purple' | 'rose' | 'obsidian'>(() => {
    return (localStorage.getItem('lifeline-color-theme') as 'blue' | 'teal' | 'purple' | 'rose' | 'obsidian') || 'blue';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'admin' | null>(null);
  const [patientUser, setPatientUser] = useState<Patient | null>(null);
  const [doctorUser, setDoctorUser] = useState<Doctor | null>(null);
  const [adminUser, setAdminUser] = useState<Admin | null>(null);

  // Auth Dialog state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<'patient' | 'doctor' | 'admin'>('patient');

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regBlood, setRegBlood] = useState('O+');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Responsive sidebar mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync index.css root classes on theme toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lifeline-luminance', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-blue', 'theme-teal', 'theme-purple', 'theme-rose', 'theme-obsidian');
    root.classList.add(`theme-${colorTheme}`);
    localStorage.setItem('lifeline-color-theme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleOpenAuth = (role: 'patient' | 'doctor' | 'admin' = 'patient') => {
    setLoginRole(role);
    setAuthMode('login');
    setUsername(role === 'patient' ? 'john_doe' : role === 'doctor' ? 'dr_smith' : 'admin');
    setPassword(role === 'patient' ? 'patient123' : role === 'doctor' ? 'doctor123' : 'admin123');
    setAuthError('');
    setAuthSuccess('');
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setPatientUser(null);
    setDoctorUser(null);
    setAdminUser(null);
    setCurrentView('home');
    setIsMobileMenuOpen(false);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          requestedRole: loginRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUserRole(data.role);
        
        if (data.role === 'patient') {
          setPatientUser(data.user);
          setCurrentView('patient');
        } else if (data.role === 'doctor') {
          setDoctorUser(data.user);
          setCurrentView('doctor');
        } else if (data.role === 'admin') {
          setAdminUser(data.user);
          setCurrentView('admin');
        }

        setIsAuthOpen(false);
      } else {
        setAuthError(data.error || 'Authentication credentials mismatch.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection failed. Please retry.');
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!username || !regFullName || !regEmail || !regPhone || !regDob) {
      setAuthError('Please fill in essential verification elements.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          fullName: regFullName,
          email: regEmail,
          phone: regPhone,
          dob: regDob,
          gender: regGender,
          bloodGroup: regBlood,
          medicalHistory: 'None reported yet',
          allergies: 'None reported yet'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthSuccess('Registration completed! Please log in now using password: patient123');
        setAuthMode('login');
        setPassword('patient123');
      } else {
        setAuthError(data.error || 'Registration failed due to credential overlap.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="master-framework-layout" className={`min-h-screen font-sans antialiased text-slate-700 bg-slate-50 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-150`}>
      
      {/* Navigation Headers */}
      <nav id="navbar-primary" className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-brand-50 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Branding elements */}
            <div id="navbar-brand-section" className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setCurrentView('home')}>
              <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-accent-600 text-white rounded-xl shadow-md" id="brand-launcher-icon">
                <HeartPulse className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <h1 className="font-extrabold text-base tracking-tight text-slate-805 dark:text-white">Life Line</h1>
                <p className="text-[10px] text-brand-600 dark:text-brand-500 font-extrabold uppercase tracking-widest leading-none">Health Assistant</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-black uppercase text-slate-500 dark:text-slate-400" id="desktop-nav-links">
              <button 
                id="link-nav-home"
                onClick={() => setCurrentView('home')} 
                className={`py-1 cursor-pointer transition-colors hover:text-brand-600 ${currentView === 'home' ? 'text-brand-600 border-b-2 border-brand-600 font-bold' : ''}`}
              >
                Home Clinic
              </button>
              
              <button 
                id="link-nav-bmi"
                onClick={() => {
                  const el = document.getElementById('bmi-calculator-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="py-1 cursor-pointer transition-colors hover:text-brand-600 flex items-center gap-1"
              >
                <Calculator className="h-4 w-4" /> BMI Metrics
              </button>

              <button 
                id="link-nav-advisor"
                onClick={() => {
                  const el = document.getElementById('ai-chat-advisor-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="py-1 cursor-pointer transition-colors hover:text-brand-600 flex items-center gap-1"
              >
                <Sparkles className="h-4 w-4 text-amber-500" /> Dr. Wellness AI
              </button>

              {/* Dynamic portal routing */}
              {isAuthenticated && userRole && (
                <button
                  id="link-nav-dashboard"
                  onClick={() => setCurrentView(userRole)}
                  className={`py-1 cursor-pointer text-brand-700 dark:text-brand-405 transition-colors hover:text-brand-600 font-extrabold border-b border-dashed border-brand-200 ${
                    currentView === userRole ? 'text-brand-600 border-b-2 border-brand-600' : ''
                  }`}
                >
                  My Dashboard ({userRole})
                </button>
              )}
            </div>

            {/* Header Right controllers */}
            <div className="hidden md:flex items-center gap-3 relative" id="desktop-nav-right">
              
              {/* Theme Settings Dropdown Button */}
              <div className="relative" id="color-theme-picker-container">
                <button
                  id="color-theme-dropdown-btn"
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  title="Choose Care Theme Preset"
                  className="p-2 flex items-center gap-1.5 text-slate-500 hover:text-brand-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-705"
                >
                  <Palette className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider hidden lg:block">Theme</span>
                </button>

                {themeMenuOpen && (
                  <div 
                    id="color-theme-dropdown-menu" 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-left space-y-2 text-slate-800 dark:text-white animate-fade-in"
                  >
                    <div className="px-2 pb-1.5 border-b border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block animate-pulse">Select Clinic Theme</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { label: 'Medical Blue', value: 'blue', colorClass: 'bg-blue-600', desc: 'Primary core care style' },
                        { label: 'Clinical Emerald', value: 'teal', colorClass: 'bg-emerald-600', desc: 'Soothing nature therapy' },
                        { label: 'Royal Orchid', value: 'purple', colorClass: 'bg-purple-650', desc: 'Trustworthy & gentle' },
                        { label: 'Sunset Rose', value: 'rose', colorClass: 'bg-rose-600', desc: 'Warm active responsive' },
                        { label: 'Obsidian Modern', value: 'obsidian', colorClass: 'bg-slate-650', desc: 'Sleek premium silver' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          id={`color-theme-item-${item.value}`}
                          onClick={() => {
                            setColorTheme(item.value as any);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            colorTheme === item.value 
                              ? 'bg-brand-50/70 dark:bg-slate-800 text-brand-700 dark:text-brand-400 font-bold' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-3 w-3 rounded-full shrink-0 ${item.colorClass}`} />
                            <div>
                              <p className="text-xs font-semibold leading-none">{item.label}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          {colorTheme === item.value && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark mode trigger */}
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                title="Toggle visual style theme"
                className="p-2 text-slate-500 hover:text-brand-605 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                {theme === 'light' ? (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Moon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider hidden lg:block">Dark</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-500 animate-pulse">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider hidden lg:block text-amber-500">Light</span>
                  </div>
                )}
              </button>

              {/* Auth Button loops */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3" id="authed-profile-tray">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-750 text-xs text-slate-650" id="current-user-badge">
                    <User className="h-4 w-4 text-brand-600" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{patientUser?.fullName || doctorUser?.fullName || adminUser?.fullName || 'Credentialed'}</span>
                  </div>
                  <button
                    id="action-logout-btn"
                    onClick={handleLogout}
                    className="bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-brand-700 dark:text-brand-400 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Logout
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2" id="visitor-auth-actions">
                  <button
                    id="nav-login-patient"
                    onClick={() => handleOpenAuth('patient')}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-brand-500/10 active:scale-95 transition-all animate-fade-in"
                  >
                    Patient Login
                  </button>
                  <button
                    id="nav-login-rxtab"
                    onClick={() => handleOpenAuth('doctor')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-705 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-250 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Doctor Portal
                  </button>
                  <button
                    id="nav-login-admin"
                    onClick={() => handleOpenAuth('admin')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs p-2 rounded-xl cursor-pointer text-xs"
                    title="Administrative access"
                  >
                    Admin
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <div className="flex md:hidden items-center gap-2" id="mobile-nav-toggle-block">
              <button
                id="mobile-theme-toggle"
                onClick={toggleTheme}
                className="p-2 text-slate-400"
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5 text-slate-500" /> : <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />}
              </button>
              <button
                id="mobile-menu-trigger"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-350 cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xl text-left" id="mobile-nav-menu-panel">
            <button
              onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}
              className="w-full text-left py-2 font-bold text-sm text-slate-600 dark:text-slate-350 block"
              id="mobile-link-home"
            >
              Home Clinic
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById('bmi-calculator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 font-bold text-sm text-slate-600 dark:text-slate-350 block"
              id="mobile-link-bmi"
            >
              BMI Metrics Calculator
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById('ai-chat-advisor-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 font-bold text-sm text-slate-600 dark:text-slate-350 block animate-pulse"
              id="mobile-link-advisor"
            >
              Dr. Wellness AI Chatbot
            </button>

            {isAuthenticated && userRole && (
              <button
                onClick={() => { setCurrentView(userRole); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2 font-black text-sm text-indigo-600 block"
                id="mobile-link-dash"
              >
                Go to Dashboard ({userRole})
              </button>
            )}

            {/* Mobile Swipe Themes Preset List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800" id="mobile-theme-swatches-block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold block mb-2 px-1">Choose Care Theme:</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1 px-1">
                {[
                  { label: 'Blue', value: 'blue', colorClass: 'bg-blue-600' },
                  { label: 'Emerald', value: 'teal', colorClass: 'bg-emerald-600' },
                  { label: 'Royal', value: 'purple', colorClass: 'bg-purple-600' },
                  { label: 'Sunset', value: 'rose', colorClass: 'bg-rose-600' },
                  { label: 'Obsidian', value: 'obsidian', colorClass: 'bg-slate-500' }
                ].map((item) => (
                  <button
                    key={item.value}
                    id={`mobile-theme-swatch-${item.value}`}
                    onClick={() => setColorTheme(item.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      colorTheme === item.value
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-150 dark:text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-705 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.colorClass}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2" id="mobile-auth-controls">
              {isAuthenticated ? (
                <button
                  id="mobile-logout-btn"
                  onClick={handleLogout}
                  className="w-full bg-rose-50 text-rose-700 py-2 rounded-xl text-center font-bold text-xs"
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2 flex flex-col">
                  <button
                    id="mobile-login-patient"
                    onClick={() => handleOpenAuth('patient')}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs"
                  >
                    Patient Access
                  </button>
                  <button
                    id="mobile-login-doctor"
                    onClick={() => handleOpenAuth('doctor')}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Doctor Access
                  </button>
                  <button
                    id="mobile-login-admin"
                    onClick={() => handleOpenAuth('admin')}
                    className="w-full text-slate-400 py-2 text-center text-xs"
                  >
                    System Administrator
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Core View Swap */}
      <main id="core-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {currentView === 'home' ? (
          <div className="space-y-16" id="home-view-bundle">
            <HomeView 
              onNavigate={setCurrentView}
              onOpenLogin={handleOpenAuth}
            />

            {/* BMI Calculator Widget Anchor Section */}
            <section id="bmi-calculator-section" className="scroll-mt-20">
              <BMICalculator />
            </section>

            {/* AI Advisor Chatbot Anchor Section */}
            <section id="ai-chat-advisor-section" className="scroll-mt-20 max-w-3xl mx-auto">
              <div className="text-center space-y-2 mb-6 font-sans" id="ai-advisor-text-anchor-header">
                <span className="text-xs uppercase font-black text-blue-600 dark:text-blue-400 tracking-widest block">Expert Virtual Counselor</span>
                <h3 className="text-3xl font-serif font-black italic text-blue-950 dark:text-white">Assisted AI Wellness Advisor</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Interact with Dr. LifeLine to review clinical terms, draft nutrition lists, or gain self-care insights.</p>
              </div>
              <AIChatAdvisor />
            </section>
          </div>
        ) : (
          <div className="space-y-10" id="portal-view-bundle">
            
            {/* Context breadcrumb banner to go home */}
            <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl items-center justify-between text-xs" id="portal-navigation-context">
              <span className="text-slate-500 font-semibold" id="nav-context-text">
                Currently Inside: <strong className="text-blue-600 font-extrabold uppercase">{currentView} Module Workspace</strong>
              </span>
              <button
                id="portal-context-home-btn"
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer"
              >
                &larr; Return to Home Landing
              </button>
            </div>

            {/* Active module render maps */}
            {currentView === 'patient' && patientUser && (
              <PatientDashboard
                patient={patientUser}
                onUpdatePatient={(newPatient) => setPatientUser(newPatient)}
              />
            )}

            {currentView === 'doctor' && doctorUser && (
              <DoctorDashboard
                doctor={doctorUser}
                onUpdateDoctor={(newDoc) => setDoctorUser(newDoc)}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard />
            )}
          </div>
        )}
      </main>

      {/* Primary Footer Section with address, copyright, and emergency disclaimers */}
      <footer id="primary-system-footer" className="bg-slate-900 text-slate-400 border-t border-slate-850 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 text-left">
          
          <div className="md:col-span-5 space-y-4" id="footer-branding-column">
            <div className="flex items-center gap-2" id="footer-logo">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-white text-base">Life Line Portal</span>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
              Life Line is an integrated, full-stack hospital assistance web platform designed to facilitate secure clinical calendars coordination and dispatch emergency assistance units.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3" id="footer-address-column">
            <h4 className="font-extrabold text-slate-300 text-xs uppercase tracking-wider">Clinical Facility Desk</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Medical Tower East, Floor 4A <br />
              1400 Sector 9 Industrial Ave <br />
              Direct Operative: +1 800-555-0199 <br />
              Clinics Support: consult@lifeline.org
            </p>
          </div>

          <div className="md:col-span-3 space-y-3" id="footer-hours-column">
            <h4 className="font-extrabold text-slate-300 text-xs uppercase tracking-wider">Emergency Desk Hours</h4>
            <p className="text-xs text-slate-400">
              • Trauma & ER Unit: <span className="text-rose-400 font-bold">24 Hours / 7 Days</span> <br />
              • Outdoor Consultant Clinics: 09:00 AM - 06:00 PM <br />
              • Medical Chat Support Desk: 24/7 Virtual AI
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-850 text-center text-xs space-y-4" id="footer-lower-panel">
          <p className="text-[10px] text-slate-650 tracking-wider">
            Disclaimer: Virtual health assessments or advice generated from our clinical Wellness Chatbots are for general health coaching and educational purposes. In any severe physical strain, cardiac pain, dial 911 immediately.
          </p>
          <p className="text-slate-600" id="footer-copyright-note">
            &copy; {new Date().getFullYear()} Life Line Healthcare Inc. All rights reserved. Dr. Shreya Hari Roster desk controls.
          </p>
        </div>
      </footer>

      {/* Authentic Auth Modals overlay panels */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="auth-overlay-backdrop">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl p-6 md:p-8 relative" id="auth-dialog-modal">
            
            <button
              id="auth-close-btn"
              onClick={() => setIsAuthOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Module selects layout */}
            {authMode === 'login' ? (
              <div className="space-y-6" id="auth-login-view">
                <div className="text-left" id="login-header">
                  <h3 className="font-black text-2xl text-slate-800">Life Line Portal Login</h3>
                  <p className="text-xs text-slate-400">Enter credential coordinates to enter your medical workspace.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl" id="login-role-tabs">
                  <button
                    id="role-tab-patient"
                    onClick={() => {
                      setLoginRole('patient');
                      setUsername('john_doe');
                      setPassword('patient123');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      loginRole === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    id="role-tab-doctor"
                    onClick={() => {
                      setLoginRole('doctor');
                      setUsername('dr_smith');
                      setPassword('doctor123');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      loginRole === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Doctor
                  </button>
                  <button
                    id="role-tab-admin"
                    onClick={() => {
                      setLoginRole('admin');
                      setUsername('admin');
                      setPassword('admin123');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      loginRole === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl text-left" id="login-success-banner">
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-extrabold rounded-xl text-left animate-shake" id="login-error-banner">
                    {authError}
                  </div>
                )}

                <form onSubmit={submitLogin} className="space-y-4" id="login-form">
                  <div className="text-left" id="login-field-username-block">
                    <label className="text-xs font-extrabold text-slate-500 block mb-1.5">Username</label>
                    <input
                      id="login-username-input"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. john_doe"
                      required
                    />
                  </div>

                  <div className="text-left" id="login-field-password-block">
                    <label className="text-xs font-extrabold text-slate-500 block mb-1.5">Password</label>
                    <input
                      id="login-password-input"
                      type="password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all uppercase tracking-wide text-xs shadow-md shadow-blue-500/10"
                  >
                    Enter Workspace &rarr;
                  </button>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-400 text-left space-y-1" id="login-pre-credentials">
                    <p className="font-extrabold text-slate-500 uppercase">Demo Quick logins:</p>
                    {loginRole === 'patient' && <p>• John Doe (Patient): <strong>john_doe</strong> / <strong>patient123</strong></p>}
                    {loginRole === 'doctor' && <p>• Dr. Robert Smith: <strong>dr_smith</strong> / <strong>doctor123</strong></p>}
                    {loginRole === 'admin' && <p>• System Admin: <strong>admin</strong> / <strong>admin123</strong></p>}
                  </div>
                </form>

                {loginRole === 'patient' && (
                  <p className="text-xs mt-4" id="login-register-switch">
                    Don't have a registered clinical folder?{' '}
                    <button
                      onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Register New Patient
                    </button>
                  </p>
                )}
              </div>
            ) : (
              // Patient directory registration view
              <div className="space-y-6 max-h-[550px] overflow-y-auto" id="auth-register-view">
                <div className="text-left" id="register-header">
                  <h3 className="font-black text-2xl text-slate-800 animate-fade-in">Create Clinic Folder</h3>
                  <p className="text-xs text-slate-400">Register as a Life Line patient to book appointments and track medical files.</p>
                </div>

                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl text-left" id="register-success-banner">
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-extrabold rounded-xl text-left" id="register-error-banner">
                    {authError}
                  </div>
                )}

                <form onSubmit={submitRegister} className="space-y-3" id="register-form">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Clinic Username</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. helena_v"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Full Citizen Name</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Helen Vance"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">E-mail Address</label>
                      <input
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. helen@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +1 555-0100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-705 focus:outline-none"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Blood Group</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="e.g. A-"
                        value={regBlood}
                        onChange={(e) => setRegBlood(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Gender</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button
                    id="register-submit-btn"
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer text-xs uppercase"
                  >
                    Confirm Registration
                  </button>
                </form>

                <p className="text-xs mt-4" id="register-login-switch">
                  Already registered?{' '}
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
