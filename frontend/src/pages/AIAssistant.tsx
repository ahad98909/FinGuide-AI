import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  CheckCircle2,
  Square,
  Plus,
  History,
  Trash2,
  MessageSquare,
  X,
  ChevronRight,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  action?: {
    type: string;
    data: any;
    executed?: boolean;
  };
}

interface ChatSessionItem {
  id: number;
  user_id: number;
  title: string;
  language: string;
  created_at?: string;
  updated_at?: string;
}

// Complete Voice & Language Code Mapping for all 8 Languages
const LANGUAGE_VOICE_MAP: Record<string, { code: string; fallbacks: string[] }> = {
  en: { code: 'en-US', fallbacks: ['en-GB', 'en'] },
  ur: { code: 'ur-PK', fallbacks: ['ur-IN', 'ur', 'hi-IN'] },
  roman_urdu: { code: 'ur-PK', fallbacks: ['ur-IN', 'ur', 'hi-IN'] },
  pa: { code: 'pa-IN', fallbacks: ['pa-PK', 'pa', 'ur-PK', 'hi-IN'] },
  sd: { code: 'sd-PK', fallbacks: ['sd', 'ur-PK'] },
  ps: { code: 'ps-PK', fallbacks: ['ps-AF', 'ps', 'ur-PK'] },
  bal: { code: 'bal-PK', fallbacks: ['bal', 'fa-IR', 'ur-PK'] },
  skr: { code: 'skr-PK', fallbacks: ['skr', 'pa-PK', 'ur-PK'] }
};

const GREETINGS: Record<string, string> = {
  en: "Assalam-o-Alaikum! I am FinGuide AI, your financial co-pilot. How can I help you manage your savings and budgets today?",
  ur: "وعلیکم السلام! میں FinGuide AI ہوں، آپ کا مالیاتی معاون۔ آج میں بجٹ اور بچت کے اہداف میں آپ کی کیا مدد کر سکتا ہوں؟",
  roman_urdu: "Assalam-o-Alaikum! Main FinGuide AI hoon, aap ka personal financial co-pilot. Aaj budget aur savings goals me kaise madad kar sakta hoon?",
  pa: "سلام! میں FinGuide AI واں، تہاڈا مالیاتی مددگار۔ اج تہاڈے بجٹ تے بچت دے ہدفاں وچ کی مدد کر سکدا واں؟",
  sd: "اسلام عليڪم! مان FinGuide AI آهيان، توهان جو مالي صلاحڪار. اڄ مان توهان جي بجيٽ ۽ بچت ۾ ڪهڙي مدد ڪري سگهان ٿو؟",
  ps: "سلام! زه FinGuide AI یم، ستاسو مالي مشاور. نن زه ستاسو د بودیجې او سپما د هدفونو په برخه کې څنګه مرسته کولی شم؟",
  bal: "سلام! من FinGuide AI آن، شمی مالیاتی مددگار۔ مروچی بجٹ ءُ بچت ءِ واستہ چے وڑیں مدت لوٹ ات؟",
  skr: "سلام! میں FinGuide AI ہاں، تہاڈا مالیاتی معاون۔ اج تہاڈے بجٹ تے بچت دے ہدفاں وچ کیا مدد کر سڳدا ہاں؟"
};

export const AIAssistant: React.FC<{
  onRefreshData: () => void;
  onNavigateToGoals?: () => void;
  onTabChange?: (tab: string) => void;
}> = ({ onRefreshData, onNavigateToGoals, onTabChange }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Chat Session & History States
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(() => {
    const saved = localStorage.getItem('finguide_chat_session_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Stop any active speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API Support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const voiceConfig = LANGUAGE_VOICE_MAP[language] || LANGUAGE_VOICE_MAP['en'];
      recognition.lang = voiceConfig.code;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputValue(text);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  // Load Session Messages from Backend
  const loadSessionDetails = useCallback(async (sessionId: number) => {
    setLoading(true);
    try {
      const sessionData = await api.getChatSession(sessionId);
      if (sessionData && sessionData.messages && sessionData.messages.length > 0) {
        const loadedMsgs: ChatMessage[] = sessionData.messages.map((m: any) => ({
          id: String(m.id),
          sender: m.role === 'user' ? 'user' : 'ai',
          text: m.content
        }));
        setMessages(loadedMsgs);
      } else {
        // Empty session - set localized initial greeting
        setMessages([
          {
            id: 'greet',
            sender: 'ai',
            text: GREETINGS[sessionData.language || language] || GREETINGS['en']
          }
        ]);
      }
      setCurrentSessionId(sessionId);
      localStorage.setItem('finguide_chat_session_id', String(sessionId));
    } catch (err) {
      console.error('Failed to load session messages:', err);
      // Fallback greeting if session not found
      setMessages([
        {
          id: 'greet',
          sender: 'ai',
          text: GREETINGS[language] || GREETINGS['en']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  // Fetch History Sessions List
  const fetchHistoryList = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const list = await api.getChatHistory();
      setSessions(list || []);
      return list || [];
    } catch (e) {
      console.error('Failed to fetch chat history list:', e);
      return [];
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Initial Load: Fetch history and restore previous active conversation
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      const hist = await fetchHistoryList();
      if (!isMounted) return;

      const savedId = localStorage.getItem('finguide_chat_session_id');
      const parsedSavedId = savedId ? parseInt(savedId, 10) : null;

      if (parsedSavedId && hist.some((s: any) => s.id === parsedSavedId)) {
        // 1. Saved session exists in history -> Restore previous conversation
        await loadSessionDetails(parsedSavedId);
      } else if (hist.length > 0) {
        // 2. Load most recent session
        await loadSessionDetails(hist[0].id);
      } else {
        // 3. Brand new user without sessions -> Show greeting
        setMessages([
          {
            id: 'greet',
            sender: 'ai',
            text: GREETINGS[language] || GREETINGS['en']
          }
        ]);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on component mount

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Start a fresh conversation ("New Chat")
  const handleNewChat = async () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
    }

    try {
      setLoading(true);
      const newSession = await api.newChatSession(language);
      setCurrentSessionId(newSession.id);
      localStorage.setItem('finguide_chat_session_id', String(newSession.id));

      setMessages([
        {
          id: 'greet',
          sender: 'ai',
          text: GREETINGS[language] || GREETINGS['en']
        }
      ]);

      await fetchHistoryList();
      setIsHistoryOpen(false);
    } catch (err) {
      console.error('Failed to start new chat session:', err);
      // Local reset fallback
      setCurrentSessionId(null);
      localStorage.removeItem('finguide_chat_session_id');
      setMessages([
        {
          id: 'greet',
          sender: 'ai',
          text: GREETINGS[language] || GREETINGS['en']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Delete a Chat Session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      await api.deleteChatSession(sessionId);
      const updatedList = await fetchHistoryList();

      if (currentSessionId === sessionId) {
        if (updatedList.length > 0) {
          await loadSessionDetails(updatedList[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete chat session:', err);
      alert('Could not delete chat session. Please try again.');
    }
  };

  // Voice TTS Selection
  const selectVoiceForLanguage = useCallback((utterance: SpeechSynthesisUtterance, lang: string) => {
    const config = LANGUAGE_VOICE_MAP[lang] || LANGUAGE_VOICE_MAP['en'];
    utterance.lang = config.code;

    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const targetCodes = [config.code, ...config.fallbacks];
    let matchedVoice: SpeechSynthesisVoice | undefined;

    for (const code of targetCodes) {
      matchedVoice = voices.find(
        (v) => v.lang.toLowerCase() === code.toLowerCase() ||
               v.lang.toLowerCase().replace('_', '-').startsWith(code.toLowerCase())
      );
      if (matchedVoice) break;
    }

    if (!matchedVoice) {
      for (const code of targetCodes) {
        const prefix = code.split('-')[0].toLowerCase();
        matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
        if (matchedVoice) break;
      }
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }, []);

  // Speaker Button Toggle Handler
  const toggleSpeak = useCallback((text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (playingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    selectVoiceForLanguage(utterance, language);

    utterance.onstart = () => setPlayingMsgId(msgId);
    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);

    window.speechSynthesis.speak(utterance);
  }, [playingMsgId, language, selectVoiceForLanguage]);

  const handleMicToggle = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Submit User Message
  const submitMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Send message with session_id to persist in database
      const res = await api.chat(text, language, currentSessionId || undefined);

      // If a session_id was returned, save it
      if (res.session_id) {
        if (currentSessionId !== res.session_id) {
          setCurrentSessionId(res.session_id);
          localStorage.setItem('finguide_chat_session_id', String(res.session_id));
        }
        // Refresh session list so new title appears in history
        fetchHistoryList();
      }

      const newMsgId = String(Date.now() + 1);
      const aiMsg: ChatMessage = {
        id: newMsgId,
        sender: 'ai',
        text: res.response,
        action: res.action ? { ...res.action, executed: false } : undefined
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled) {
        toggleSpeak(res.response, newMsgId);
      }
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: String(Date.now() + 2),
        sender: 'ai',
        text: language === 'ur'
          ? 'معذرت، سروس سے رابطہ کرنے میں دشواری پیش آ رہی ہے۔ براہ کرم دوبارہ کوشش کریں۔'
          : language === 'roman_urdu'
          ? 'Maaf kijiyega, services se connect karne me masla aa raha hai. Dobara koshish karein.'
          : 'Sorry, I am facing trouble connecting to the services. Please try again.'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateGoal = async (msgId: string, goalData: any) => {
    setActionLoading(msgId);
    try {
      await api.createGoal({
        name: goalData.name,
        target_amount: Number(goalData.target_amount),
        current_amount: Number(goalData.current_amount || 0),
        monthly_contribution: Number(goalData.monthly_contribution || 0)
      });

      // Update message status to executed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.action
            ? { ...m, action: { ...m.action, executed: true } }
            : m
        )
      );

      onRefreshData();
      showToast('success', `Goal "${goalData.name}" created! Redirecting to Goals Tracker...`);

      setTimeout(() => {
        if (onNavigateToGoals) {
          onNavigateToGoals();
        } else if (onTabChange) {
          onTabChange('goals');
        }
      }, 1000);
    } catch (e: any) {
      showToast('error', e.message || 'Could not create goal. Please verify details.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAction = async (msgId: string, action: any) => {
    if (action?.type === 'CREATE_GOAL') {
      await handleCreateGoal(msgId, action.data);
    }
  };

  const quickPrompts = [
    language === 'ur'
      ? "مجھے بائیک کے لیے بچت کرنی ہے"
      : language === 'roman_urdu'
      ? "Mujhe bike ke liye paise save karne hain"
      : language === 'pa'
      ? "مینوں بائیک خریدن واسطے بچت کرنی اے"
      : language === 'sd'
      ? "مون کي بائيڪ وٺڻ لاءِ پئسا بچائڻا آهن"
      : language === 'ps'
      ? "زه غواړم د موټر سایکل لپاره پیسې وسپموم"
      : language === 'bal'
      ? "منا موٹرسائیکل ءِ واستہ بچت کنگ لوٹ ات"
      : language === 'skr'
      ? "میکوں بائیک کیتے پیسے بچاوݨے ہن"
      : "I want to buy a bike",
    language === 'ur' ? "میری تنخواہ کا 50/30/20 بجٹ بنائیں" : "Create a 50/30/20 budget for my salary",
    language === 'ur' ? "ماہانہ اخراجات کیسے کم کروں؟" : "How can I cut my monthly expenses?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] relative max-w-4xl mx-auto">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold transition-all border backdrop-blur-md ${
          toastMessage.type === 'success'
            ? 'bg-emerald-700/95 text-white border-emerald-400/50 shadow-emerald-950/60'
            : 'bg-rose-700/95 text-white border-rose-400/50 shadow-rose-950/60'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          ) : (
            <X className="w-5 h-5 text-rose-200 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner with Controls */}
      <div className="flex items-center justify-between p-4 bg-[#112316]/90 border border-white/10 rounded-2xl mb-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm leading-tight text-white">{t('ai_ask_title')}</h3>
              {currentSessionId && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hidden sm:inline-block">
                  Session #{currentSessionId}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold">
              FinGuide AI Co-Pilot • Language: <span className="uppercase font-extrabold text-white">{language}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1b321f] to-[#2b4d32] hover:from-[#233e27] hover:to-[#386242] border border-emerald-500/40 text-emerald-200 hover:text-white transition-all flex items-center gap-1.5 shadow-md text-xs font-bold cursor-pointer"
            title="Start a fresh conversation"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* History Drawer Toggle Button */}
          <button
            onClick={() => {
              setIsHistoryOpen(!isHistoryOpen);
              if (!isHistoryOpen) fetchHistoryList();
            }}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isHistoryOpen
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-emerald-500/30'
            }`}
            title="View Saved Chat History"
          >
            <History className="w-4 h-4" />
            <span className="text-[11px] font-bold hidden sm:inline">
              History {sessions.length > 0 && `(${sessions.length})`}
            </span>
          </button>

          {/* Voice Auto-TTS Toggle */}
          <button
            onClick={() => {
              if (playingMsgId) {
                window.speechSynthesis.cancel();
                setPlayingMsgId(null);
              }
              setTtsEnabled(!ttsEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              ttsEnabled
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
            title={ttsEnabled ? "Auto-TTS Enabled (Click to disable)" : "Auto-TTS Disabled (Click to enable)"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] font-bold hidden md:inline">
              {ttsEnabled ? "Voice ON" : "Voice OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Slide-over Chat History Panel */}
      {isHistoryOpen && (
        <div className="absolute top-20 right-0 z-30 w-full sm:w-80 max-h-[calc(100%-6rem)] bg-[#0d1c10]/98 border border-emerald-500/40 rounded-2xl shadow-2xl p-4 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Chat History</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                {sessions.length}
              </span>
            </div>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-96">
            {loadingHistory ? (
              <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Loading history...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                <MessageSquare className="w-6 h-6 mx-auto text-slate-500 mb-2" />
                <p>No chat history saved yet.</p>
                <p className="text-[10px] text-slate-500">Your conversations will automatically be saved here.</p>
              </div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => {
                    loadSessionDetails(sess.id);
                    setIsHistoryOpen(false);
                  }}
                  className={`group p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    currentSessionId === sess.id
                      ? 'bg-[#1a3821] border-emerald-400/60 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-500/40 hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <h4 className="font-bold truncate text-xs">{sess.title || 'Conversation'}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="uppercase font-bold text-emerald-400/80">{sess.language}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sess.updated_at ? new Date(sess.updated_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete this conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-white/10">
            <button
              onClick={handleNewChat}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Start New Conversation
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 min-h-0 bg-[#0c180e]/60 rounded-2xl border border-white/10 backdrop-blur-sm custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-md leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-[#1b321f] to-[#2b4d32] text-white border border-emerald-500/30 rounded-br-none font-medium'
                  : 'bg-[#142618]/95 border border-white/15 rounded-bl-none text-slate-100 space-y-3'
              }`}
            >
              {/* Message text */}
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Speaker Toggle Button on every AI Message */}
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => toggleSpeak(msg.text, msg.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      playingMsgId === msg.id
                        ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 ring-2 ring-emerald-500/30 animate-pulse'
                        : 'border-white/15 bg-black/30 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-950/40'
                    }`}
                    title={playingMsgId === msg.id ? "Click to stop audio" : "Click to read response aloud"}
                  >
                    {playingMsgId === msg.id ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Listen ({language.toUpperCase()})</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-400">FinGuide AI</span>
                </div>
              )}

              {/* Action confirmation card */}
              {msg.action && msg.action.type === 'CREATE_GOAL' && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-[#0e1c12] to-[#07120a] border border-emerald-500/40 text-white space-y-3.5 shadow-xl shadow-emerald-950/50">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Automated Goal Roadmap</span>
                    </div>
                    {msg.action.executed && (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Locked in Tracker
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Goal Target</span>
                      <strong className="text-emerald-300 font-bold text-sm block truncate">{msg.action.data.name}</strong>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Target Amount</span>
                      <strong className="text-white font-bold text-sm block">PKR {Number(msg.action.data.target_amount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Monthly Savings</span>
                      <strong className="text-emerald-400 font-bold block">PKR {Number(msg.action.data.monthly_contribution || 0).toLocaleString()}/mo</strong>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400 text-[10px] block">Est. Completion</span>
                      <strong className="text-amber-300 font-bold block">
                        {Math.ceil(Math.max(0, (Number(msg.action.data.target_amount || 0) - Number(msg.action.data.current_amount || 0))) / Math.max(1, Number(msg.action.data.monthly_contribution || 1)))} Months
                      </strong>
                    </div>
                  </div>

                  {!msg.action.executed ? (
                    <button
                      onClick={() => handleCreateGoal(msg.id, msg.action!.data)}
                      disabled={actionLoading === msg.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {actionLoading === msg.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Adding to Goals Tracker...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                          <span>Confirm & Add to Goals Tracker</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Goal saved to database
                      </span>
                      <button
                        onClick={() => {
                          if (onNavigateToGoals) onNavigateToGoals();
                          else if (onTabChange) onTabChange('goals');
                        }}
                        className="text-xs text-white hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-4 cursor-pointer"
                      >
                        View in Goals Tracker <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#142618] border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => submitMessage(prompt)}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-[#112316]/80 hover:bg-[#152a1b] text-xs text-slate-300 hover:text-white transition-all text-left truncate shadow-sm cursor-pointer"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-3 flex items-center gap-2 relative">
        {speechSupported && (
          <button
            onClick={handleMicToggle}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-emerald-500/50 hover:text-emerald-400'
            }`}
            title={isListening ? 'Listening...' : 'Voice Input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitMessage(inputValue)}
          placeholder={t('ai_input_placeholder')}
          className="flex-1 bg-white text-slate-900 font-bold border-2 border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/20 rounded-2xl px-5 py-3.5 text-xs outline-none transition-all placeholder:text-slate-400"
        />

        <button
          onClick={() => submitMessage(inputValue)}
          className="p-3.5 bg-gradient-to-r from-[#1b321f] to-[#2b4d32] hover:from-[#233e27] hover:to-[#386242] text-white rounded-2xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
