import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './services/api';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { AIAssistant } from './pages/AIAssistant';
import { Goals } from './pages/Goals';
import { MoneyManager } from './pages/MoneyManager';
import { Simulator } from './pages/Simulator';
import { ScamDetector } from './pages/ScamDetector';
import { Academy } from './pages/Academy';
import { Settings } from './pages/Settings';
import { ReceiptScanner } from './pages/ReceiptScanner';
import { Reports } from './pages/Reports';
import { 
  Sparkles, 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  Calendar
} from 'lucide-react';

const languagesList = [
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'en', label: 'English' },
  { code: 'roman_urdu', label: 'Roman Urdu' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sd', label: 'Sindhi (سنڌي)' },
  { code: 'ps', label: 'Pashto (پښتو)' },
  { code: 'bal', label: 'Balochi (بلوچی)' },
  { code: 'skr', label: 'Saraiki (سرائیکی)' }
];

export const FinGuideApp: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Auth Screen state
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState(() => localStorage.getItem('finguide_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLang, setPreferredLang] = useState('ur');
  const [registerLangDropdownOpen, setRegisterLangDropdownOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('finguide_remember_me') === 'true');
  const [showAutofillPopup, setShowAutofillPopup] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<Array<{ email: string; password?: string }>>([]);

  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab routing
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Load saved accounts from localStorage on view switch
  useEffect(() => {
    try {
      const raw = localStorage.getItem('finguide_saved_accounts');
      if (raw) {
        setSavedAccounts(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, [authView]);

  // Check current session on start (checking both localStorage for Remember Me and sessionStorage)
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setLanguage(parsedUser.language || 'en');
      setIsAuthenticated(true);
      
      const onboardState = localStorage.getItem('onboarding_complete') || sessionStorage.getItem('onboarding_complete');
      setIsOnboardingComplete(onboardState === 'true');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('onboarding_complete');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_complete');
    
    const wasRemembered = localStorage.getItem('finguide_remember_me') === 'true';
    if (!wasRemembered) {
      setEmail('');
    }
    setPassword('');
    setUser(null);
    setIsAuthenticated(false);
    setIsOnboardingComplete(false);
    setAuthView('landing');
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await api.demo();
      if (rememberMe) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboarding_complete', 'true');
      } else {
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('onboarding_complete', 'true');
      }
      
      setUser(data.user);
      setLanguage(data.user.language || 'en');
      setIsOnboardingComplete(true);
      setIsAuthenticated(true);
    } catch (e: any) {
      setAuthError(e.message || 'Demo initialization failed. Make sure backend is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim() || name || 'User';
      const data = await api.register({
        name: fullName,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        email,
        password,
        language: preferredLang,
        user_type: 'general'
      });
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('onboarding_complete', 'false');
      
      setUser(data.user);
      setLanguage(preferredLang as any);
      setIsOnboardingComplete(false);
      setIsAuthenticated(true);
    } catch (e: any) {
      setAuthError(e.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await api.login({ email, password });
      
      if (rememberMe) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboarding_complete', 'true');
        localStorage.setItem('finguide_remember_me', 'true');
        localStorage.setItem('finguide_remembered_email', email);

        // Save to remembered accounts list for instant one-click autofill
        try {
          const raw = localStorage.getItem('finguide_saved_accounts') || '[]';
          let list: any[] = JSON.parse(raw);
          list = list.filter((acc) => acc.email.toLowerCase() !== email.toLowerCase());
          list.unshift({ email, password, lastUsed: Date.now() });
          const trimmed = list.slice(0, 5);
          localStorage.setItem('finguide_saved_accounts', JSON.stringify(trimmed));
          setSavedAccounts(trimmed);
        } catch (err) {
          console.error(err);
        }
      } else {
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('onboarding_complete', 'true');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('onboarding_complete');
        localStorage.removeItem('finguide_remember_me');
        localStorage.removeItem('finguide_remembered_email');
      }
      
      setUser(data.user);
      setLanguage(data.user.language || 'en');
      setIsOnboardingComplete(true);
      setIsAuthenticated(true);
    } catch (e: any) {
      setAuthError(e.message || 'Invalid email or password');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    sessionStorage.setItem('onboarding_complete', 'true');
    setIsOnboardingComplete(true);
    setRefreshCounter((prev) => prev + 1);
  };

  const handleRefreshData = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const leafLogo = (
    <svg className="w-8 h-8 fill-current text-[#2b4d32]" viewBox="0 0 24 24">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,19.8C7.54,20 8.5,20.03 9.4,20C17,20 22,12 22,4C22,4 19,4 17,8M9.5,18C8.83,17.9 8.2,17.75 7.62,17.5L12.35,6.58L10.5,5.75L5.75,16.62C5.35,15.7 5.1,14.6 5.05,13.31C4.9,9.64 6.88,5.4 12,3C10,6.5 10.3,11.5 12,15C13.53,18.17 11.2,18.25 9.5,18Z"/>
    </svg>
  );

  // If not authenticated, render Landing, Login, or Register views
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <Landing
          onStartRegistration={() => setAuthView('register')}
          onTryDemo={handleDemoLogin}
          onLoginClick={() => setAuthView('login')}
        />
      );
    }

    // Login View
    if (authView === 'login') {
      return (
        <div className="min-h-screen bg-[#f4f3ed] text-slate-800 flex items-center justify-center p-6 selection:bg-[#2b4d32]/10 font-sans">
          {/* Back to landing button */}
          <button 
            onClick={() => setAuthView('landing')}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2b4d32] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="max-w-4xl w-full bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 grid md:grid-cols-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Left Panel: Aesthetic archway background */}
            <div className="hidden md:flex flex-col justify-between p-8 relative bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: "url('/login_sidebar.jpg')" }}>
              <div className="absolute inset-0 bg-[#f4f3ed]/10 pointer-events-none"></div>
              <div></div>
              
              {/* Beautiful message bubble overlay */}
              <div className="flex-grow flex items-center justify-center z-10">
                <div className="bg-[#faf9f5]/95 backdrop-blur-sm border border-cream-300 p-6 rounded-2xl shadow-lg max-w-[240px] w-full text-center">
                  <h3 className="font-serif text-lg text-slate-800 leading-relaxed font-bold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    خوش آمدید 🌿
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Apne account mein login karein aur smart financial planning shuru karein.
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 z-10">
                <span className="text-xs font-bold text-[#2b4d32] bg-[#f4f3ed]/80 px-3 py-1 rounded-full backdrop-blur-sm">آپ کا ذاتی مالی معاون</span>
              </div>
            </div>

            {/* Mobile Top Banner: Plant Backdrop */}
            <div className="md:hidden h-36 relative bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 overflow-hidden" style={{ backgroundImage: "url('/login_sidebar.jpg')" }}>
              <div className="absolute inset-0 bg-[#f4f3ed]/20 pointer-events-none"></div>
              <div className="bg-[#faf9f5]/90 backdrop-blur-sm border border-cream-300 px-4 py-2 rounded-xl text-center z-10 shadow-sm">
                <h3 className="font-serif text-xs text-slate-800 font-bold">خوش آمدید 🌿</h3>
                <span className="text-[8px] text-[#2b4d32] font-bold block">آپ کا ذاتی مالی معاون</span>
              </div>
            </div>

            {/* Right Panel: Login form */}
            <div className="p-8 flex flex-col justify-center">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2">
                  {leafLogo}
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    FinGuide <span className="text-[10px] bg-[#2b4d32] text-white px-1.5 py-0.5 rounded align-middle font-bold">AI</span>
                  </span>
                </div>
                <span className="text-[9px] text-[#2b4d32] font-bold tracking-widest mt-0.5 uppercase">آپ کا مالی ساتھی</span>
              </div>

              {/* Titles */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                  {t('login_welcome')}
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t('login_welcome_sub')}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs mb-5 font-semibold text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="on">
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                    <input
                      id="login-email"
                      name="username"
                      type="email"
                      autoComplete="username"
                      required
                      placeholder={t('lbl_email')}
                      value={email}
                      onFocus={() => {
                        if (savedAccounts.length > 0) setShowAutofillPopup(true);
                      }}
                      onClick={() => {
                        if (savedAccounts.length > 0) setShowAutofillPopup(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowAutofillPopup(false), 250);
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (savedAccounts.length > 0) setShowAutofillPopup(true);
                      }}
                      className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                    />

                    {/* Remembered Accounts Autofill Popup Matching User Screenshot */}
                    {showAutofillPopup && savedAccounts.length > 0 && (
                      <div className="absolute left-6 top-full mt-2.5 bg-[#1a232a] text-white border border-[#2d3748] rounded-2xl shadow-2xl z-50 py-1.5 min-w-[280px] animate-in fade-in zoom-in-95 duration-150">
                        {/* Triangular Pointer Arrow */}
                        <div className="absolute -top-1.5 left-7 w-3 h-3 bg-[#1a232a] border-t border-l border-[#2d3748] transform rotate-45" />

                        <div className="px-3.5 py-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Saved Account
                        </div>

                        {savedAccounts.map((acc) => (
                          <button
                            key={acc.email}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEmail(acc.email);
                              if (acc.password) setPassword(acc.password);
                              setRememberMe(true);
                              setShowAutofillPopup(false);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#283542] text-left transition-colors cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 flex-shrink-0">
                              <Mail className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate flex-1">
                              <span className="text-xs font-bold text-white tracking-wide block truncate">
                                {acc.email}
                              </span>
                              <span className="text-[9px] text-emerald-400 block font-medium">Click to autofill password</span>
                            </div>
                          </button>
                        ))}

                        <div className="border-t border-slate-700/60 mt-1 pt-1.5 px-3.5 pb-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            Auto-login ready
                          </span>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              localStorage.removeItem('finguide_saved_accounts');
                              setSavedAccounts([]);
                              setShowAutofillPopup(false);
                            }}
                            className="hover:text-red-400 font-bold transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10 pointer-events-none" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder={t('lbl_password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-11 py-3 text-xs outline-none transition-all placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-[#2b4d32] transition-colors z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                  <button type="button" className="hover:text-[#2b4d32] transition-colors">Forgot Password?</button>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#2b4d32] focus:ring-[#2b4d32]/20 border-slate-300 w-3.5 h-3.5 cursor-pointer accent-[#2b4d32]"
                    />
                    <span className="font-semibold text-slate-600">Remember Me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#2b4d32] hover:bg-[#386242] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-900/10 text-xs flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? 'Signing in...' : t('btn_login')} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="relative flex py-4 items-center mt-3">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-400 uppercase font-bold">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google continue */}
              <button
                onClick={handleDemoLogin}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>

              {/* Footer link */}
              <div className="mt-6 text-center text-xs">
                <p className="text-slate-500 font-medium">
                  {t('login_no_account')}{' '}
                  <button onClick={() => setAuthView('register')} className="text-[#2b4d32] font-black hover:underline">
                    {t('login_create_account')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Register View
    if (authView === 'register') {
      return (
        <div className="min-h-screen bg-[#f4f3ed] text-slate-850 flex items-center justify-center p-6 selection:bg-[#2b4d32]/10 font-sans">
          {/* Back to landing button */}
          <button 
            onClick={() => setAuthView('landing')}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2b4d32] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="max-w-4xl w-full bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 grid md:grid-cols-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Left Panel: Aesthetic illustration & Urdu text */}
            <div className="hidden md:flex flex-col justify-between p-8 relative bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: "url('/register_sidebar.jpg')" }}>
              {/* Overlay shadow to give it more depth and make the calligraphy frame pop */}
              <div className="absolute inset-0 bg-[#1b321f]/15 pointer-events-none"></div>
              
              {/* Spacer */}
              <div></div>

              {/* Framed calligraphy overlaying the background image */}
              <div className="flex-grow flex items-center justify-center z-10">
                <div className="bg-[#fcfbf9]/95 backdrop-blur-sm border-[10px] border-[#c0baa6] p-6 rounded-xl shadow-lg max-w-[200px] w-full text-center select-none transform rotate-1 hover:rotate-0 transition-transform">
                  <h3 className="font-serif text-2xl text-slate-800 leading-relaxed font-bold select-text" style={{ fontFamily: 'Georgia, serif' }}>
                    بچت آج،<br />
                    آسان کل
                  </h3>
                  <span className="text-[9px] text-[#2b4d32] font-bold block mt-2 tracking-wide uppercase">Bachat Aaj, Aasan Kal</span>
                </div>
              </div>

              {/* Tagline footer */}
              <div className="text-center pt-4 z-10">
                <span className="text-xs font-bold text-white bg-[#1b321f]/85 px-4 py-1.5 rounded-full backdrop-blur-sm">FinGuide AI کے ساتھ اپنے مالی سفر کا آغاز کریں</span>
              </div>
            </div>

            {/* Mobile Top Banner: Plant Backdrop */}
            <div className="md:hidden h-36 relative bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 overflow-hidden" style={{ backgroundImage: "url('/register_sidebar.jpg')" }}>
              <div className="absolute inset-0 bg-[#1b321f]/20 pointer-events-none"></div>
              <div className="bg-[#fcfbf9]/95 backdrop-blur-sm border-4 border-[#c0baa6] px-4 py-2 rounded-xl text-center z-10 shadow-sm">
                <h3 className="font-serif text-xs text-slate-800 font-bold">بچت آج، آسان کل</h3>
                <span className="text-[8px] text-[#2b4d32] font-bold block uppercase">Bachat Aaj, Aasan Kal</span>
              </div>
            </div>

            {/* Right Panel: Form inputs */}
            <div className="p-8 flex flex-col justify-center">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2">
                  {leafLogo}
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    FinGuide <span className="text-[10px] bg-[#2b4d32] text-white px-1.5 py-0.5 rounded align-middle font-bold">AI</span>
                  </span>
                </div>
                <span className="text-[9px] text-[#2b4d32] font-bold tracking-widest mt-0.5 uppercase">آپ کا مالی ساتھی</span>
              </div>

              {/* Titles */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {t('register_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t('register_sub')}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs mb-5 font-semibold text-center animate-shake">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Name split into three parts: First, Middle, Last */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#2b4d32] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="First Name *"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-8 pr-2.5 py-2.5 text-xs outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Middle Name"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-8 pr-2.5 py-2.5 text-xs outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Last Name *"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-8 pr-2.5 py-2.5 text-xs outline-none transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder={t('lbl_email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Date of Birth (Added after email) */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#2b4d32] uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none transition-all text-slate-700 font-medium cursor-pointer"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder={t('lbl_password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Language custom dropdown */}
                <div className="relative">
                  <label className="block text-[10px] font-extrabold text-[#2b4d32] uppercase tracking-wider mb-1.5">
                    {t('lbl_language')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRegisterLangDropdownOpen(!registerLangDropdownOpen)}
                      className="w-full bg-[#e8f4eb] text-black font-extrabold border-2 border-[#2b4d32] focus:border-emerald-600 focus:ring-4 focus:ring-[#2b4d32]/15 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                    >
                      <Globe className="w-4 h-4 text-[#2b4d32] absolute left-4 top-3.5 pointer-events-none" />
                      <span className="text-black font-extrabold">
                        {languagesList.find((l) => l.code === preferredLang)?.label || 'Urdu (اردو)'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#2b4d32] transition-transform duration-200 ${registerLangDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {registerLangDropdownOpen && (
                      <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-[#2b4d32] uppercase tracking-wider">
                          Select Language ({languagesList.length})
                        </div>
                        {languagesList.map((lang) => {
                          const isSelected = preferredLang === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setPreferredLang(lang.code);
                                setRegisterLangDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#2b4d32] text-white font-extrabold'
                                  : 'text-black hover:bg-[#e8f4eb] hover:text-[#2b4d32]'
                              }`}
                            >
                              <span className="text-inherit">{lang.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#2b4d32] hover:bg-[#386242] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-900/10 text-xs flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? 'Creating...' : t('btn_register')} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Already registered */}
              <div className="mt-6 text-center text-xs">
                <p className="text-slate-500 font-medium">
                  {t('register_has_account')}{' '}
                  <button onClick={() => setAuthView('login')} className="text-[#2b4d32] font-black hover:underline">
                    {t('register_login_link')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // If Onboarding flow is not completed
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} initialName={user?.name || ''} />;
  }

  // If Authenticated and Onboarded
  return (
    <DashboardLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      onLogout={handleLogout}
      userName={user?.name || 'User'}
      refreshCounter={refreshCounter}
    >
      {currentTab === 'dashboard' && <Dashboard userName={user?.name || 'Ahad Ali'} onTabChange={setCurrentTab} refreshCounter={refreshCounter} />}
      {currentTab === 'ai-assistant' && <AIAssistant onRefreshData={handleRefreshData} />}
      {currentTab === 'goals' && <Goals refreshCounter={refreshCounter} onRefreshData={handleRefreshData} />}
      {currentTab === 'money-manager' && <MoneyManager refreshCounter={refreshCounter} onRefreshData={handleRefreshData} />}
      {currentTab === 'reports' && <Reports refreshCounter={refreshCounter} />}
      {currentTab === 'receipt-scanner' && (
        <ReceiptScanner
          onRefreshData={handleRefreshData}
          onNavigateToMoneyManager={() => setCurrentTab('money-manager')}
        />
      )}
      {currentTab === 'simulator' && <Simulator />}
      {currentTab === 'scam-detector' && <ScamDetector />}
      {currentTab === 'academy' && <Academy onTabChange={setCurrentTab} />}
      {currentTab === 'settings' && <Settings onRefreshData={handleRefreshData} />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <FinGuideApp />
    </LanguageProvider>
  );
}
