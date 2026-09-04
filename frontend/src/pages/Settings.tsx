import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Settings as SettingsIcon, Globe, User, ShieldCheck, DollarSign, ChevronDown, Check } from 'lucide-react';

interface SettingsProps {
  onRefreshData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onRefreshData }) => {
  const { language, setLanguage, t, autoDetect, setAutoDetect } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userTypeDropdownOpen, setUserTypeDropdownOpen] = useState(false);
  
  // Settings Form state
  const [name, setName] = useState('');
  const [profileType, setProfileType] = useState('general');
  const [income, setIncome] = useState<number | ''>('');
  const [savings, setSavings] = useState<number | ''>('');
  const [expenses, setExpenses] = useState<number | ''>('');
  
  const [currency, setCurrency] = useState('PKR');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load active profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const dashboard = await api.getDashboard();
        // Since we don't have separate GET /profile, we query dashboard statistics which returns the profile amounts
        setIncome(dashboard.income);
        setExpenses(dashboard.expenses);
        
        // Find goals or demo savings
        setSavings(dashboard.savings + 45000); // approximate total savings

        // Grab user metadata from localStorage or parse token
        const userObj = sessionStorage.getItem('user');
        if (userObj) {
          const parsed = JSON.parse(userObj);
          setName(parsed.name || 'User');
          setProfileType(parsed.user_type || 'general');
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadProfile();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        name,
        monthly_income: Number(income) || 0,
        current_savings: Number(savings) || 0,
        monthly_expenses: Number(expenses) || 0,
        language,
        user_type: profileType
      };

      await api.onboarding(payload);
      
      // Update local storage user profile copy
      const userObj = sessionStorage.getItem('user');
      if (userObj) {
        const parsed = JSON.parse(userObj);
        parsed.name = name;
        parsed.user_type = profileType;
        parsed.language = language;
        sessionStorage.setItem('user', JSON.stringify(parsed));
      }

      setSuccess(true);
      onRefreshData();
    } catch (err) {
      alert('Failed to save settings');
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings_title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure language, currency, and income profiles.</p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-4 text-xs font-semibold">
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Languages & Preference (glassmorphic card) */}
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
             <Globe className="w-4.5 h-4.5 text-emerald-600" />
            Language Preference
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Active Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="w-full bg-[#e8f4eb] dark:bg-[#112316] text-black dark:text-white font-extrabold border-2 border-[#2b4d32] focus:border-emerald-600 focus:ring-4 focus:ring-[#2b4d32]/15 rounded-xl px-4 py-2.5 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                >
                  <span className="text-inherit font-bold">
                    {languagesList.find((l) => l.code === language)?.label || 'Urdu (اردو)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#2b4d32] dark:text-emerald-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#112316] border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
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
                              : 'text-black dark:text-slate-200 hover:bg-[#e8f4eb] dark:hover:bg-white/5 hover:text-[#2b4d32]'
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

            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-850/20 rounded-xl">
              <div>
                <span className="text-xs font-semibold block">Language Auto-Detect</span>
                <span className="text-[10px] text-slate-500">Enable smart parsing from message texts</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoDetect(!autoDetect)}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  autoDetect ? 'bg-[#2b4d32]' : 'bg-slate-355 dark:bg-slate-800'
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
        </div>

        {/* Financial Profile Settings */}
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
             <User className="w-4.5 h-4.5 text-emerald-600" />
            Financial Profile
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {t('lbl_name')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white text-slate-900 font-bold border-2 border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                User Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserTypeDropdownOpen(!userTypeDropdownOpen)}
                  className="w-full bg-[#e8f4eb] dark:bg-[#112316] text-black dark:text-white font-extrabold border-2 border-[#2b4d32] focus:border-emerald-600 focus:ring-4 focus:ring-[#2b4d32]/15 rounded-xl px-4 py-2.5 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                >
                  <span className="text-inherit font-bold capitalize">
                    {profileType === 'student' ? 'Student' : profileType === 'worker' ? 'Salaried / Worker' : profileType === 'family' ? 'Family / Homemaker' : 'General User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#2b4d32] dark:text-emerald-400 transition-transform duration-200 ${userTypeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#112316] border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { code: 'general', label: 'General User' },
                      { code: 'student', label: 'Student' },
                      { code: 'worker', label: 'Salaried / Worker' },
                      { code: 'family', label: 'Family / Homemaker' }
                    ].map((tItem) => {
                      const isSelected = profileType === tItem.code;
                      return (
                        <button
                          key={tItem.code}
                          type="button"
                          onClick={() => {
                            setProfileType(tItem.code);
                            setUserTypeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#2b4d32] text-white font-extrabold'
                              : 'text-black dark:text-slate-200 hover:bg-[#e8f4eb] dark:hover:bg-white/5 hover:text-[#2b4d32]'
                          }`}
                        >
                          <span className="text-inherit">{tItem.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Monthly Income (PKR)
              </label>
              <input
                type="number"
                required
                value={income}
                onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white text-slate-900 font-bold border-2 border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Estimated Monthly Expenses (PKR)
              </label>
              <input
                type="number"
                required
                value={expenses}
                onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white text-slate-900 font-bold border-2 border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Localization & Visuals */}
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
             <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
            System & Theme Defaults
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="w-full bg-[#e8f4eb] dark:bg-[#112316] text-black dark:text-white font-extrabold border-2 border-[#2b4d32] focus:border-emerald-600 focus:ring-4 focus:ring-[#2b4d32]/15 rounded-xl px-4 py-2.5 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                >
                  <span className="text-inherit font-bold">
                    {currency === 'PKR' ? 'PKR (Rs.)' : currency === 'USD' ? 'USD ($)' : 'EUR (€)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#2b4d32] dark:text-emerald-400 transition-transform duration-200 ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {currencyDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#112316] border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { code: 'PKR', label: 'PKR (Rs.)' },
                      { code: 'USD', label: 'USD ($)' },
                      { code: 'EUR', label: 'EUR (€)' }
                    ].map((curr) => {
                      const isSelected = currency === curr.code;
                      return (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setCurrency(curr.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#2b4d32] text-white font-extrabold'
                              : 'text-black dark:text-slate-200 hover:bg-[#e8f4eb] dark:hover:bg-white/5 hover:text-[#2b4d32]'
                          }`}
                        >
                          <span className="text-inherit">{curr.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-forest-900/10 text-sm"
        >
          {loading ? 'Saving adjustments...' : t('btn_save_settings')}
        </button>
      </form>
    </div>
  );
};
export default Settings;
