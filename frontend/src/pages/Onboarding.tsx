import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { User, Wallet, ShieldCheck, HelpCircle, Globe, ChevronDown, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  initialName?: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName }) => {
  const { language, setLanguage, t, autoDetect, setAutoDetect } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName || '');
  const [profileType, setProfileType] = useState('general'); // student, worker, family, general
  const [income, setIncome] = useState<number | ''>('');
  const [savings, setSavings] = useState<number | ''>('');
  const [expenses, setExpenses] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name,
      monthly_income: Number(income) || 0.0,
      current_savings: Number(savings) || 0.0,
      monthly_expenses: Number(expenses) || 0.0,
      language,
      user_type: profileType
    };

    try {
      await api.onboarding(payload);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'Urdu (اردو)' },
    { code: 'roman_urdu', label: 'Roman Urdu' },
    { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'sd', label: 'Sindhi (سنڌي)' },
    { code: 'ps', label: 'Pashto (پښتو)' },
    { code: 'bal', label: 'Balochi (بلوچی)' },
    { code: 'skr', label: 'Saraiki (سرائیکی)' }
  ];

  const leafLogo = (
    <svg className="w-8 h-8 fill-current text-[#2b4d32]" viewBox="0 0 24 24">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,19.8C7.54,20 8.5,20.03 9.4,20C17,20 22,12 22,4C22,4 19,4 17,8M9.5,18C8.83,17.9 8.2,17.75 7.62,17.5L12.35,6.58L10.5,5.75L5.75,16.62C5.35,15.7 5.1,14.6 5.05,13.31C4.9,9.64 6.88,5.4 12,3C10,6.5 10.3,11.5 12,15C13.53,18.17 11.2,18.25 9.5,18Z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f4f3ed] flex items-center justify-center p-6 text-slate-800 selection:bg-[#2b4d32]/10 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 relative">
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

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
            Step {step} of 3
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-[#2b4d32] w-10' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1">
          {t('onboarding_title')}
        </h1>
        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
          {step === 1 && 'Let’s start with your profile setup.'}
          {step === 2 && 'Give us some rough numbers to build your health score.'}
          {step === 3 && 'Choose how you want to interact with FinGuide AI.'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs mb-6 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-4">
          {/* Step 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t('lbl_profile_type')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'student', title: 'Student', desc: 'Focus on allowance & study costs' },
                    { id: 'worker', title: 'Worker', desc: 'Focus on salaries & bills' },
                    { id: 'family', title: 'Family', desc: 'Focus on shared households' },
                    { id: 'general', title: 'General', desc: 'Simple financial co-pilot' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfileType(p.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        profileType === p.id
                          ? 'border-[#2b4d32] bg-[#2b4d32]/5 text-[#2b4d32]'
                          : 'border-slate-200 hover:border-slate-350 bg-white text-slate-800'
                      }`}
                    >
                      <span className="font-extrabold text-xs block mb-1">{p.title}</span>
                      <span className="text-[10px] text-slate-500 leading-snug font-medium block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Stats */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  {t('lbl_income')} (PKR / month)
                </label>
                <input
                  type="number"
                  required
                  placeholder="100,000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  {t('lbl_savings')} (PKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="80,000"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">
                  {t('lbl_expenses')} (PKR / month)
                </label>
                <input
                  type="number"
                  required
                  placeholder="65,000"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-[#2b4d32]/60 focus:ring-4 focus:ring-[#2b4d32]/5 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Step 3: Languages & Locks */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-extrabold text-[#2b4d32] uppercase tracking-wider mb-1.5">
                  {t('lbl_language')}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="w-full bg-[#e8f4eb] text-black font-extrabold border-2 border-[#2b4d32] focus:border-emerald-600 focus:ring-4 focus:ring-[#2b4d32]/15 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                  >
                    <Globe className="w-4 h-4 text-[#2b4d32] absolute left-4 top-3.5 pointer-events-none" />
                    <span className="text-black font-extrabold">
                      {languagesList.find((l) => l.code === language)?.label || 'Urdu (اردو)'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#2b4d32] transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {langDropdownOpen && (
                    <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-[#2b4d32] uppercase tracking-wider">
                        Select Language ({languagesList.length})
                      </div>
                      {languagesList.map((lang) => {
                        const isSelected = language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setLanguage(lang.code as any);
                              setLangDropdownOpen(false);
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

              {/* Language Auto Detect Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold block">Language Auto-Detect</span>
                  <span className="text-[10px] text-slate-500">Enable smart parsing from message texts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDetect(!autoDetect)}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    autoDetect ? 'bg-[#2b4d32]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      autoDetect ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-3 rounded-xl transition-all border border-slate-200 text-xs"
              >
                {t('btn_back')}
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-grow bg-[#2b4d32] hover:bg-[#386242] text-white font-bold px-4 py-3.5 rounded-xl transition-all text-xs"
              >
                {t('btn_next')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-[#2b4d32] hover:bg-[#386242] text-white font-bold px-4 py-3.5 rounded-xl transition-all text-xs"
              >
                {loading ? 'Completing...' : t('btn_complete')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Onboarding;
