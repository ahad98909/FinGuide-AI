import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { DashboardData, Transaction, Goal } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Send,
  MessageSquare,
  Sparkles,
  DollarSign,
  Mic,
  MicOff,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  userName: string;
  refreshCounter: number;
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userName, refreshCounter, onTabChange }) => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [whyOpen, setWhyOpen] = useState(false);

  // Mini-Chatbot State inside Dashboard
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: language === 'ur' 
        ? 'السلام علیکم! میں آپ کا FinGuide AI ساتھی ہوں۔ میں آپ کے بجٹ اور مالی اہداف میں کیسے مدد کر سکتا ہوں؟'
        : language === 'roman_urdu'
        ? 'Assalamualaikam! Main aap ka FinGuide AI co-pilot hoon. Budget ya saving goal me kaise madad kar sakta hoon?'
        : 'Hello! I am your FinGuide AI co-pilot. How can I help you optimize your budget or savings today?'
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dashboard voice input recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setChatInput(text);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const handleMicToggle = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboard();
        setData(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [refreshCounter]);

  // Scroll chatbot to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await api.chat(userMsg, language);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: response.response }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Maaf kijiyega, server se rabta nahi ho saka.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-500/20" />
        <span className="text-sm font-semibold text-emerald-400/90 tracking-wide">
          Loading your co-pilot dashboard...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card border-rose-500/30 text-rose-300 p-8 max-w-lg mx-auto text-center mt-12 backdrop-blur-xl">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-400" />
        <h3 className="font-extrabold text-xl mb-2 text-white">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-300 mb-6">{error || 'Could not verify backend connection.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/40"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Format Recharts data
  const chartData = Object.entries(data.expense_by_category)
    .map(([key, value]) => ({ name: key, value: value as number }))
    .filter((item) => item.value > 0);

  // High-contrast vibrant colors for donut chart
  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#a855f7', '#f43f5e', '#3b82f6', '#14b8a6', '#64748b'];

  const budgetLimit = 40000;
  const budgetUsagePercent = budgetLimit > 0 ? Math.min(Math.round((data.expenses / budgetLimit) * 100), 100) : 0;
  const shortName = userName.split(' ')[0] || 'Ahad';

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Assalamualaikam, {shortName}! 👋
            </h1>
          </div>
          <p className="text-xs text-emerald-400/90 font-medium mt-1">
            Aaj apne finances ka overview dekhain aur smart savings plan karein.
          </p>
        </div>

        {/* Health Score trigger */}
        <div className="glass-card !py-2.5 !px-4 flex items-center gap-3 bg-gradient-to-r from-emerald-500/15 via-[#152a1b]/65 to-emerald-900/20 border-emerald-500/30">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
            {data.financial_health_score}
          </div>
          <div className="text-left">
            <span className="text-[10px] text-emerald-400/80 uppercase block tracking-wider font-extrabold">Financial Health</span>
            <span className="text-xs font-black text-white">{data.financial_health_score} / 100</span>
          </div>
          <button
            onClick={() => setWhyOpen(!whyOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors ml-1"
            title="Toggle insights"
          >
            {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Why explain alert */}
      {whyOpen && (
        <div className="glass-card animate-in slide-in-from-top-2 duration-200 grid md:grid-cols-2 gap-4 text-xs border-emerald-500/30 bg-[#112316]/90">
          <div className="p-2">
            <h4 className="font-extrabold text-emerald-400 mb-2.5 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </span>
              Optimized Metrics
            </h4>
            <ul className="space-y-2">
              {data.financial_health_reasons.map((r: string, i: number) => (
                <li key={i} className="text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-4">
            <h4 className="font-extrabold text-amber-400 mb-2.5 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
              Recommendations
            </h4>
            <ul className="space-y-2">
              {data.financial_health_improvements.map((imp: string, i: number) => (
                <li key={i} className="text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Metric Cards Row (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income */}
        <div className="glass-card glass-card-glow flex flex-col justify-between group hover:border-emerald-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400/90 uppercase tracking-wider block">
                Total Income
              </span>
              <span className="text-2xl font-black text-white block mt-2 tracking-tight">
                PKR {data.income.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 8% pichlay mahine se
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card flex flex-col justify-between group hover:border-rose-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-rose-400/90 uppercase tracking-wider block">
                Total Expenses
              </span>
              <span className="text-2xl font-black text-white block mt-2 tracking-tight">
                PKR {data.expenses.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-rose-300 font-bold bg-rose-500/15 border border-rose-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 12% pichlay mahine se
            </span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="glass-card flex flex-col justify-between group hover:border-cyan-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-cyan-400/90 uppercase tracking-wider block">
                Remaining Balance
              </span>
              <span className="text-2xl font-black text-white block mt-2 tracking-tight">
                PKR {data.savings.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/40 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 5% pichlay mahine se
            </span>
          </div>
        </div>

        {/* Budget Usage */}
        <div className="glass-card flex flex-col justify-between group hover:border-amber-500/40">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-wider block">
                Budget Usage
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Limit: 40,000</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">{budgetUsagePercent}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Monthly target</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsagePercent > 85 ? 'bg-rose-500' : budgetUsagePercent > 60 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-forest-400'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-300 font-medium leading-tight">
              40,000 PKR mein se <span className="text-white font-bold">{data.expenses.toLocaleString()} PKR</span> kharch
            </p>
          </div>
        </div>
      </div>

      {/* Second Row: Donut Chart, Transactions, Inline Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Donut Chart (Monthly Overview) - 4 cols */}
        <div className="glass-card lg:col-span-4 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Monthly Overview
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Expenses breakdown</span>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center my-2">
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-xs text-slate-400 text-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500">
                    0 PKR
                  </div>
                  <span>Log expenses in Money Manager to view chart</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()} PKR`, 'Expense']}
                      contentStyle={{ backgroundColor: '#112316', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {chartData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-black text-white">
                    {data.expenses.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">PKR Total</span>
                </div>
              )}
            </div>
          </div>

          {/* Donut legend categories layout */}
          {chartData.length > 0 ? (
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {chartData.slice(0, 4).map((item: any, idx: number) => {
                const percent = data.expenses > 0 ? Math.round(((item.value as number) / data.expenses) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-white font-semibold truncate max-w-[110px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-bold">{percent}%</span>
                      <span className="font-bold text-white text-right">{(item.value as number).toLocaleString()} PKR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pt-2 text-center">
              <button 
                onClick={() => onTabChange('money-manager')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
              >
                Add first transaction +
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions List - 4 cols */}
        <div className="glass-card lg:col-span-4 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Recent Transactions
              </h3>
              <button 
                onClick={() => onTabChange('money-manager')}
                className="text-[11px] text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {data.recent_transactions.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-12 flex flex-col items-center gap-2">
                  <span className="text-slate-500">No transactions recorded yet.</span>
                  <button 
                    onClick={() => onTabChange('money-manager')}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    + Record your first entry
                  </button>
                </div>
              ) : (
                data.recent_transactions.slice(0, 5).map((tx: Transaction) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block capitalize truncate max-w-[110px]">{tx.description || tx.category}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{tx.date}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                      tx.type === 'income' 
                        ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25' 
                        : 'text-rose-300 bg-rose-500/15 border border-rose-500/25'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} PKR
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Financial Assistant Inline Chatbot Widget - 4 cols */}
        <div className="glass-card lg:col-span-4 flex flex-col justify-between min-h-[380px] !p-5 border-emerald-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  FinGuide AI Co-Pilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <span className="text-[9px] text-emerald-400/80 block font-semibold">✨ Multilingual Advisor</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Active
            </span>
          </div>

          {/* Bubbles scroll container */}
          <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 text-xs leading-relaxed max-h-[210px]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`p-3 rounded-2xl max-w-[88%] text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600/40 to-forest-600/40 border border-emerald-500/40 text-emerald-50 rounded-tr-sm'
                      : 'bg-[#112316]/90 border border-white/15 text-slate-100 rounded-tl-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-[#112316]/90 border border-white/15 text-emerald-400 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat submit bar */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-white/10 items-center">
            {speechSupported && (
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              </button>
            )}
            <input
              type="text"
              required
              disabled={chatLoading}
              placeholder="Yahan likhiye (e.g. Save for Honda 70)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-grow bg-white border border-slate-300 focus:border-[#2b4d32] rounded-xl px-3 py-2 text-xs outline-none text-slate-900 placeholder:text-slate-400 font-semibold transition-all"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-forest-500 hover:from-emerald-500 hover:to-forest-400 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-emerald-950/40 active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Third Row: Savings Goals, Spending Insight, Scam Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Savings Goals */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Savings Goals
              </h3>
              <button 
                onClick={() => onTabChange('goals')}
                className="text-[11px] text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {data.active_goals.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                  <span>No active goals found.</span>
                  <button 
                    onClick={() => onTabChange('goals')}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    + Create a goal (e.g. Honda CD 70)
                  </button>
                </div>
              ) : (
                data.active_goals.slice(0, 2).map((goal: Goal) => {
                  const pct = goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0;
                  return (
                    <div key={goal.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-white">
                        <span>{goal.name}</span>
                        <span className="text-emerald-400 font-extrabold">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-forest-400 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                        <span>{goal.current_amount.toLocaleString()} PKR saved</span>
                        <span>Target: {goal.target_amount.toLocaleString()} PKR</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Spending Insight */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-amber-400/90 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Spending Insight
              </h3>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-950/30">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  Aapka food aur dining par kharch normal se 15% zyada hai.
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                  Bachat barhane ke liye, shopping list aur non-essential items ko optimize karein.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange('money-manager')}
            className="w-full bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-4 shadow-lg shadow-emerald-950/40"
          >
            Detail me dekhein
          </button>
        </div>

        {/* Scam Alert */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold text-rose-400/90 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Security & Scam Alert
              </h3>
              <button 
                onClick={() => onTabChange('scam-detector')}
                className="text-[11px] text-rose-400 font-bold hover:text-rose-300 flex items-center gap-1"
              >
                Detector <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-950/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  Fake Prize SMS & BISP Scams Alert
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                  Inaam ya government aid ke naam par aane wale anjaan links ya OTP kisi ke sath share na karein.
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onTabChange('scam-detector')}
            className="w-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-4 flex items-center justify-center gap-1.5"
          >
            Scam Detector Kholein <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
