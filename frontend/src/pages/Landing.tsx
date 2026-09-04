import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Globe, 
  Check
} from 'lucide-react';

interface LandingProps {
  onStartRegistration: () => void;
  onTryDemo: () => void;
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartRegistration, onTryDemo, onLoginClick }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const handleLanguageClick = (langCode: Language) => {
    setLanguage(langCode);
  };

  const languagesList: Array<{ code: Language; name: string; native: string; sub: string }> = [
    { code: 'en', name: 'English', native: 'English', sub: 'English' },
    { code: 'ur', name: 'Urdu', native: 'اردو', sub: 'Urdu' },
    { code: 'roman_urdu', name: 'Roman Urdu', native: 'Roman Urdu', sub: 'Roman Urdu' },
    { code: 'pa', name: 'Punjabi', native: 'پنجابی', sub: 'Punjabi' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي', sub: 'Sindhi' },
    { code: 'ps', name: 'Pashto', native: 'پښتو', sub: 'Pashto' },
    { code: 'bal', name: 'Balochi', native: 'بلوچی', sub: 'Balochi' },
    { code: 'skr', name: 'Saraiki', native: 'سرائیکی', sub: 'Saraiki' },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-[#112014] text-white flex flex-col justify-between selection:bg-forest-500/30 overflow-x-hidden font-sans bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(to bottom, rgba(17, 32, 20, 0.7), rgba(17, 32, 20, 0.85)), url('/hero_background.jpg')" }}>
      {/* Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 bg-[#112014]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Leaf Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-900/20 flex-shrink-0">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,19.8C7.54,20 8.5,20.03 9.4,20C17,20 22,12 22,4C22,4 19,4 17,8M9.5,18C8.83,17.9 8.2,17.75 7.62,17.5L12.35,6.58L10.5,5.75L5.75,16.62C5.35,15.7 5.1,14.6 5.05,13.31C4.9,9.64 6.88,5.4 12,3C10,6.5 10.3,11.5 12,15C13.53,18.17 11.2,18.25 9.5,18Z"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-tight text-emerald-50">
              FinGuide <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded ml-1 text-white font-semibold align-middle">AI</span>
            </span>
            <span className="text-[10px] text-emerald-400 block tracking-wider font-semibold">{t('tagline')}</span>
          </div>
        </div>

        {/* Center menu links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#home" className="hover:text-emerald-400 transition-colors text-emerald-400">{t('home')}</a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">{t('features')}</a>
          <a href="#about" className="hover:text-emerald-400 transition-colors">{t('about')}</a>
          
          {/* Language Selector Dropdown - Shows ALL 8 Languages */}
          <div className="relative py-2">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors bg-transparent border-none outline-none font-medium cursor-pointer text-sm text-slate-300"
            >
              {t('language')} <Globe className="w-4 h-4" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#112014] border border-white/10 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="px-3 py-1 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider border-b border-white/5">
                  {t('select_language')} ({languagesList.length})
                </div>
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageClick(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors flex items-center justify-between ${
                      language === lang.code ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-200'
                    }`}
                  >
                    <span>{lang.name} ({lang.native})</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
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
            onTouchStart={(e) => {
              e.preventDefault();
              onLoginClick();
            }}
            className="flex items-center gap-2 border border-emerald-800 hover:bg-white/5 text-emerald-350 text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            {t('login')}
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
            {t('hero_title')}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-355 text-base sm:text-lg max-w-xl leading-relaxed">
            {t('hero_subtitle')}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md">
            <button
              onClick={onStartRegistration}
              onTouchStart={(e) => {
                e.preventDefault();
                onStartRegistration();
              }}
              className="w-full sm:w-auto bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              {t('get_started')} <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onTryDemo}
              onTouchStart={(e) => {
                e.preventDefault();
                onTryDemo();
              }}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
            >
              {t('explore_features')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-4 gap-2 pt-6">
            {[
              { id: 'budget', label: t('budget_tracking'), icon: '📋' },
              { id: 'ai', label: t('ai_assistant'), icon: '🤖' },
              { id: 'multilingual', label: t('multilingual_support'), icon: '🌐' },
              { id: 'scam', label: t('scam_awareness'), icon: '🛡️' }
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

          {/* Language Selector Circles - ALL 8 Languages */}
          <div className="space-y-3.5 pt-4">
            <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase">
              {t('select_language')}
            </span>
            <div className="flex flex-wrap gap-3">
              {languagesList.map((circle) => (
                <button
                  key={circle.code}
                  onClick={() => handleLanguageClick(circle.code)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border transition-all ${
                    language === circle.code
                      ? 'bg-[#2b4d32] border-emerald-400 scale-110 shadow-lg ring-2 ring-emerald-400/40'
                      : 'bg-white/5 border-white/10 hover:border-emerald-700/50'
                  }`}
                >
                  <span className="text-xs font-bold block">{circle.native}</span>
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
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{t('monthly_overview')}</span>
                  <button className="text-[9px] text-[#2b4d32] font-extrabold hover:underline">{t('view_all')}</button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-450 block">{t('total_income')}</span>
                      <span className="font-extrabold text-sm text-emerald-700">PKR 50,000</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block">{t('total_expenses')}</span>
                      <span className="font-extrabold text-sm text-rose-600">PKR 32,000</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block">{t('remaining_balance')}</span>
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
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{t('recent_transactions')}</span>
                  <button className="text-[9px] text-[#2b4d32] font-extrabold hover:underline">{t('view_all')}</button>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                  {[
                    { cat: 'Salary', date: '24 May 2026', amount: '+50,000 PKR', isIncome: true, icon: '💼' },
                    { cat: 'Groceries', date: '23 May 2026', amount: '-2,200 PKR', isIncome: false, icon: '🛒' },
                    { cat: 'Transport', date: '22 May 2026', amount: '-500 PKR', isIncome: false, icon: '🚗' },
                    { cat: 'Electricity Bill', date: '21 May 2026', amount: '-3,500 PKR', isIncome: false, icon: '⚡' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 first:pt-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block text-slate-800">{item.cat}</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">{item.date}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold ${item.isIncome ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="border-t border-slate-200 pt-2 pb-1 flex items-center justify-between text-slate-400">
                <div className="flex flex-col items-center gap-0.5 cursor-pointer text-[#2b4d32]">
                  <span className="text-xs">🏠</span>
                  <span className="text-[8px] font-bold">{t('home')}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>📊</span>
                  <span className="text-[8px]">{t('budget_tracking')}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2b4d32] text-white flex items-center justify-center shadow-lg -translate-y-2.5 cursor-pointer font-bold text-lg">
                  +
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>🤖</span>
                  <span className="text-[8px]">{t('ai_assistant')}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                  <span>👤</span>
                  <span className="text-[8px]">{t('nav_settings')}</span>
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
            {t('landing_features_title')}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t('landing_features_desc')}
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
              <h3 className="font-extrabold text-base text-white mb-2">{t('ai_assistant')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('ai_assistant_desc')}
              </p>
            </div>
          </div>

          {/* 2. Budget Tracking */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                📊
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('budget_tracking')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('budget_tracking_desc')}
              </p>
            </div>
          </div>

          {/* 3. Smart Expense Management */}
          <div className="bg-white/[0.06] border-2 border-emerald-500/50 hover:border-emerald-400 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between shadow-lg shadow-emerald-950/30">
            <div>
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                💰
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('expense_management')}</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {t('expense_management_desc')}
              </p>
            </div>
          </div>

          {/* 4. Savings Goals */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🎯
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('savings_goals')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('savings_goals_desc')}
              </p>
            </div>
          </div>

          {/* 5. Financial Education */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                📚
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('financial_education')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('financial_education_desc')}
              </p>
            </div>
          </div>

          {/* 6. Scam Awareness */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('scam_awareness')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('scam_awareness_desc')}
              </p>
            </div>
          </div>

          {/* 7. Multilingual Support */}
          <div className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 p-6 rounded-3xl transition-all duration-300 backdrop-blur-md group hover:-translate-y-1 flex flex-col justify-between sm:col-span-2 lg:col-span-2">
            <div>
              <div className="w-12 h-12 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold shadow-sm">
                🌐
              </div>
              <h3 className="font-extrabold text-base text-white mb-2">{t('multilingual_support')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('multilingual_support_desc')}
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('our_mission')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{t('mission_title')}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t('mission_description')}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">{t('simple_local_languages')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">{t('secure_private')}</span>
              </div>
            </div>
          </div>

          {/* Right graphics cards */}
          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-emerald-400 block mb-1">{t('empowering')}</span>
              <p className="text-[11px] text-slate-400">{t('empowering_desc')}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-amber-400 block mb-1">{t('friendly_ai')}</span>
              <p className="text-[11px] text-slate-400">{t('friendly_ai_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#0f1d12] border-t border-white/5 py-6">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl font-extrabold block text-amber-400">50K+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('happy_users')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-emerald-400">8</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('languages_supported')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-cyan-400">24/7</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('ai_support')}</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold block text-indigo-400">100%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{t('secure')}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a140c]/90 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t('all_rights_reserved')}</p>
          <div className="flex items-center gap-6">
            <span>{t('financial_goals')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
