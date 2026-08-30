import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  Smartphone, 
  ShieldAlert, 
  GraduationCap, 
  DollarSign, 
  ArrowRight, 
  User, 
  Globe, 
  TrendingUp, 
  Heart,
  Briefcase,
  AlertTriangle,
  BookOpen,
  Check
} from 'lucide-react';

interface LandingProps {
  onStartRegistration: () => void;
  onTryDemo: () => void;
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartRegistration, onTryDemo, onLoginClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const handleLanguageClick = (langCode: string) => {
    setLanguage(langCode as any);
  };

  const languageCircles = [
    { code: 'ur', label: 'اردو', sub: 'Urdu' },
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
    { code: 'sd', label: 'سنڌي', sub: 'Sindhi' },
    { code: 'ps', label: 'پښتو', sub: 'Pashto' },
    { code: 'bal', label: 'بلوچی', sub: 'Balochi' },
    { code: 'skr', label: 'سرائیکی', sub: 'Saraiki' }
  ];

  return (
    <div className="min-h-screen bg-[#112014] text-white flex flex-col justify-between selection:bg-forest-500/30 overflow-x-hidden font-sans bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(to bottom, rgba(17, 32, 20, 0.7), rgba(17, 32, 20, 0.85)), url('/hero_background.jpg')" }}>
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 bg-[#112014]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Leaf Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-900/20">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,19.8C7.54,20 8.5,20.03 9.4,20C17,20 22,12 22,4C22,4 19,4 17,8M9.5,18C8.83,17.9 8.2,17.75 7.62,17.5L12.35,6.58L10.5,5.75L5.75,16.62C5.35,15.7 5.1,14.6 5.05,13.31C4.9,9.64 6.88,5.4 12,3C10,6.5 10.3,11.5 12,15C13.53,18.17 11.2,18.25 9.5,18Z"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-tight text-emerald-50">
              FinGuide <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded ml-1 text-white font-semibold align-middle">AI</span>
            </span>
            <span className="text-[10px] text-emerald-400 block tracking-wider font-semibold">آپ کا مالی ساتھی</span>
          </div>
        </div>

        {/* Center menu links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#home" className="hover:text-emerald-400 transition-colors text-emerald-400">{t('nav_home')}</a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">{t('nav_features')}</a>
          <a href="#about" className="hover:text-emerald-400 transition-colors">{t('nav_about')}</a>
          <div className="relative py-2">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors bg-transparent border-none outline-none font-medium cursor-pointer text-sm text-slate-300"
            >
              {t('nav_language')} <Globe className="w-4 h-4" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#112014] border border-white/10 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ur', label: 'اردو' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors block text-white font-medium ${
                      language === lang.code ? 'text-emerald-400 font-bold' : ''
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 border border-emerald-800 hover:bg-white/5 text-emerald-350 text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            <User className="w-4 h-4" />
            {t('nav_login')}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="home" className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center relative">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Content (7 columns) */}
        <div className="md:col-span-7 space-y-8 text-left z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-emerald-300 animate-pulse">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
            <span>{t('landing_title')}</span>
          </div>

          {/* Core Tagline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
            {language === 'ur' ? (
              <>بہتر فیصلے،<br />بہتر <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">مستقبل۔</span></>
            ) : (
              <>Better Decisions,<br />Better <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">Future.</span></>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-355 text-base sm:text-lg max-w-xl leading-relaxed">
            {t('landing_hero_desc')}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md">
            <button
              onClick={onStartRegistration}
              className="w-full sm:w-auto bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              {t('landing_get_started_btn')} <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 backdrop-blur-md"
            >
              {t('landing_explore_features_btn')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-4 gap-2 pt-6">
            {[
              { id: 'budget', label: t('landing_quick_budget'), icon: '📋' },
              { id: 'ai', label: t('landing_quick_ai'), icon: '🤖' },
              { id: 'multilingual', label: t('landing_quick_multilingual'), icon: '🌐' },
              { id: 'scam', label: t('landing_quick_scam'), icon: '🛡️' }
            ].map((feature) => (
              <div
                key={feature.id}
                className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center flex flex-col items-center gap-2 backdrop-blur-sm"
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-[10px] text-slate-300 font-bold block leading-snug">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Language Selector Circles */}
          <div className="space-y-3.5 pt-4">
            <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase">अपनी ज़بان منتخب کریں (Select Language)</span>
            <div className="flex flex-wrap gap-3">
              {languageCircles.map((circle) => (
                <button
                  key={circle.code}
                  onClick={() => handleLanguageClick(circle.code)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border transition-all ${
                    language === circle.code
                      ? 'bg-[#2b4d32] border-emerald-400 scale-110 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-emerald-700/50'
                  }`}
                >
                  <span className="text-xs font-bold block">{circle.label}</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">{circle.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Beautiful phone mockup (5 columns) */}
        <div className="md:col-span-5 flex justify-center z-10">
          <div className="relative w-[300px] h-[610px] bg-[#070e0a] rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-12 ring-slate-900/10">
            {/* Phone Screen Container */}
            <div className="w-full h-full bg-[#f4f3ed] rounded-[38px] overflow-hidden flex flex-col justify-between text-slate-900 font-sans p-4 relative shadow-inner">
              {/* Speaker & camera bar notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
              </div>

              {/* Mobile Header */}
              <div className="pt-6 pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Assalamualaikam,</h4>
                  <span className="font-extrabold text-sm text-slate-900">Ahad Ali 👋</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2b4d32] flex items-center justify-center text-white text-[10px] font-bold">
                  AA
                </div>
              </div>

              {/* Monthly Overview Card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3.5 my-3 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Monthly Overview</span>
                  <button className="text-[9px] text-[#2b4d32] font-extrabold hover:underline">View All</button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-450 block">Total Income</span>
                      <span className="font-extrabold text-sm text-emerald-700">PKR 50,000</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block">Total Expenses</span>
                      <span className="font-extrabold text-sm text-rose-600">PKR 32,000</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block">Remaining Balance</span>
                      <span className="font-extrabold text-sm text-slate-800">PKR 18,000</span>
                    </div>
                  </div>

                  {/* Circular Gauge */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                      <circle cx="32" cy="32" r="26" stroke="#2b4d32" strokeWidth="5" fill="transparent" strokeDasharray={163.3} strokeDashoffset={163.3 - (163.3 * 80) / 100} />
                    </svg>
                    <span className="absolute text-[10px] font-bold">80%</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="flex-1 overflow-hidden space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Recent Transactions</span>
                  <button className="text-[9px] text-[#2b4d32] font-extrabold hover:underline">View All</button>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                  {[
                    { cat: 'Salary', date: '24 May 2026', amount: '+50,000 PKR', isIncome: true, icon: '💼' },
                    { cat: 'Groceries', date: '23 May 2026', amount: '-2,200 PKR', isIncome: false, icon: '🛒' },
                    { cat: 'Transport', date: '22 May 2026', amount: '-500 PKR', isIncome: false, icon: '🚗' },
                    { cat: 'Electricity Bill', date: '21 May 2026', amount: '-3,500 PKR', isIncome: false, icon: '⚡' }
                  ].map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 first:pt-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          {t.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block text-slate-800">{t.cat}</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">{t.date}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold ${t.isIncome ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="border-t border-slate-200 pt-2 pb-1 flex items-center justify-between text-slate-400">
                <div className="flex flex-col items-center gap-0.5 cursor-pointer text-[#2b4d32]">
                  <span className="text-xs">🏠</span>
                  <span className="text-[8px] font-bold">Home</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>📊</span>
                  <span className="text-[8px]">Budget</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2b4d32] text-white flex items-center justify-center shadow-lg -translate-y-2.5 cursor-pointer font-bold text-lg">
                  +
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>🤖</span>
                  <span className="text-[8px]">AI Assistant</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>👤</span>
                  <span className="text-[8px]">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section - Everything you need to manage your money */}
      <section id="features" className="max-w-7xl w-full mx-auto px-6 py-20 border-t border-white/5 relative">
        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to manage your money
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Simple tools designed for everyone, from students to small business owners.
          </p>
        </div>

        {/* 7 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. AI Financial Assistant */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                💬
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">AI Financial Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ask anything about your finances in Urdu, English, Punjabi, or any local language. Get personalized guidance instantly.
              </p>
            </div>
          </div>

          {/* 2. Budget Tracking */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                📊
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Budget Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Set monthly budgets by category and track your spending in real-time. Get alerts when you're approaching limits.
              </p>
            </div>
          </div>

          {/* 3. Smart Expense Management (Highlighted) */}
          <div className="bg-white/[0.06] border-2 border-emerald-500/50 hover:border-emerald-400 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between shadow-lg shadow-emerald-950/30">
            <div>
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                💰
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Smart Expense Management</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Log expenses quickly — even by just telling the AI. "Spent 850 on biryani" and it categorizes automatically.
              </p>
            </div>
          </div>

          {/* 4. Savings Goals */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🎯
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Savings Goals</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Set goals like "Laptop — PKR 150,000" and track your progress. Get AI-powered saving plans to reach them faster.
              </p>
            </div>
          </div>

          {/* 5. Financial Education */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                📚
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Financial Education</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Learn about budgeting, banking, digital payments, loans, and more — in simple language you understand.
              </p>
            </div>
          </div>

          {/* 6. Scam Awareness */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Scam Awareness</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste suspicious SMS or WhatsApp messages and get instant risk assessments. Stay protected from financial fraud.
              </p>
            </div>
          </div>

          {/* 7. Multilingual Support */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between sm:col-span-2 lg:col-span-2">
            <div>
              <div className="w-12 h-12 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🌐
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">Multilingual Support</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use the app in English, Urdu, Punjabi, Sindhi, Pashto, Balochi, or Saraiki. Even Roman Urdu works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl w-full mx-auto px-6 py-20 border-t border-white/5 relative">
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left info box */}
          <div className="md:col-span-6 space-y-6 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('landing_about_mission')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{t('landing_about_title')}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t('landing_about_desc')}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">{t('landing_about_check_urdu')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">{t('landing_about_check_secure')}</span>
              </div>
            </div>
          </div>

          {/* Right graphics cards */}
          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-emerald-400 block mb-1">{t('landing_about_stat_empower')}</span>
              <p className="text-[11px] text-slate-400">{t('landing_about_stat_empower_desc')}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-amber-400 block mb-1">{t('landing_about_stat_simple')}</span>
              <p className="text-[11px] text-slate-400">{t('landing_about_stat_simple_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#0f1d12] border-t border-white/5 py-6">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl font-extrabold block text-amber-400">50K+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('landing_stats_users')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-emerald-400">7</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('landing_stats_languages')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-cyan-400">24/7</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('landing_stats_ai_support')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-indigo-400">100%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('landing_stats_secure')}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a140c]/90 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FinGuide AI. Build for financial inclusion.</p>
          <div className="flex items-center gap-6">
            <span>FinGuide AI ke sath apne financial goals hasil karein</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
