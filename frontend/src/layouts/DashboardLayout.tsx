import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Notification } from '../types';
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  DollarSign,
  ShieldAlert,
  Settings,
  Bell,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Camera,
  BarChart3
} from 'lucide-react';

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  refreshCounter: number;
}> = ({ children, currentTab, setCurrentTab, onLogout, userName, refreshCounter }) => {
  const { language, setLanguage, t, dir } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [refreshCounter]);

  // Poll notifications occasionally for price change updates
  useEffect(() => {
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'ai-assistant', name: t('nav_ai_assistant'), icon: MessageSquare },
    { id: 'goals', name: t('nav_goals'), icon: Target },
    { id: 'money-manager', name: t('nav_money_manager'), icon: DollarSign },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'receipt-scanner', name: 'Receipt Scanner', icon: Camera },
    { id: 'scam-detector', name: t('nav_scam_detector'), icon: ShieldAlert },
    { id: 'settings', name: t('nav_settings'), icon: Settings },
  ];

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
    <div 
      dir={dir}
      className="min-h-screen flex bg-[#0c180e] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(12, 24, 14, 0.78), rgba(10, 20, 12, 0.92)), url('/hero_background.jpg')"
      }}
    >
      {/* Sidebar - Desktop */}
      <aside 
        className="hidden md:flex flex-col w-64 border-r border-white/10 h-screen sticky top-0 bg-[#0e1c12]/85 backdrop-blur-2xl z-40"
      >
        {/* Brand Header - Click to navigate to Dashboard */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setCurrentTab('dashboard')}
          className="p-5 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all duration-200 group"
          title="Go to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,19.8C7.54,20 8.5,20.03 9.4,20C17,20 22,12 22,4C22,4 19,4 17,8M9.5,18C8.83,17.9 8.2,17.75 7.62,17.5L12.35,6.58L10.5,5.75L5.75,16.62C5.35,15.7 5.1,14.6 5.05,13.31C4.9,9.64 6.88,5.4 12,3C10,6.5 10.3,11.5 12,15C13.53,18.17 11.2,18.25 9.5,18Z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                FinGuide
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                AI
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/90 block tracking-wider font-semibold">آپ کا مالی ساتھی</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-l-4 border-emerald-400 shadow-md shadow-emerald-950/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}

          {/* Language selector in sidebar */}
          <div className="pt-4 mt-2 border-t border-white/10">
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{languagesList.find((l) => l.code === language)?.label || 'Language'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute left-0 bottom-12 w-48 bg-[#112316] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xl">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors block font-medium ${
                        language === lang.code ? 'text-emerald-400 bg-emerald-500/15 font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Profile Card and Logout */}
        <div className="p-4 border-t border-white/10 space-y-2.5">
          <div 
            onClick={() => setCurrentTab('settings')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-950/40">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-white truncate max-w-[100px]">{userName}</span>
                <span className="block text-[10px] text-emerald-400/80">View Profile</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#0e1c12]/75 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 md:hidden text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden md:inline-block"></span>
              <h2 className="font-bold text-sm text-white tracking-wide uppercase hidden md:block">
                {t(`nav_${currentTab.replace('-', '_')}`)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector Header */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-xs font-semibold text-slate-200"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">
                  {languagesList.find((l) => l.code === language)?.label || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#112316] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors block font-medium ${
                        language === lang.code ? 'text-emerald-400 bg-emerald-500/15 font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 relative text-slate-300 hover:text-white"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#0e1c12]">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#112316] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl">
                  <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-emerald-400 hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 transition-colors ${!notif.read ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">
                                {notif.title}
                              </h4>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-emerald-400/70 mt-1 block">
                                {notif.created_at}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile badge Header */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-950/40">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">{userName}</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 md:hidden animate-in fade-in duration-200">
          <div 
            className="w-72 bg-[#0e1c12] border-r border-white/10 h-full flex flex-col p-5 animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div 
                onClick={() => {
                  setCurrentTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white font-bold">
                  FG
                </div>
                <span className="font-extrabold text-sm text-white">FinGuide AI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-grow space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-4 border-emerald-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div 
                onClick={() => {
                  setCurrentTab('settings');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white text-xs font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white truncate max-w-[120px]">{userName}</span>
                    <span className="block text-[10px] text-emerald-400/80">View Profile</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardLayout;
