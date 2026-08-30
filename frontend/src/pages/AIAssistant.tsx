import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Goal } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  CheckCircle2
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

export const AIAssistant: React.FC<{
  onRefreshData: () => void;
}> = ({ onRefreshData }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Support
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
          setInputValue(text);
        }
      };
      recognitionRef.current = recognition;
    }

    // Set greeting message
    setMessages([
      {
        id: 'greet',
        sender: 'ai',
        text: 'Assalam-o-Alaikum! I am FinGuide AI, your financial co-pilot. How can I help you manage your savings and budgets today?'
      }
    ]);
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop active speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const submitMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await api.chat(text);
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: res.response,
        action: res.action ? { ...res.action, executed: false } : undefined
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(res.response);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: String(Date.now() + 2),
        sender: 'ai',
        text: 'Sorry, I am facing trouble connecting to the services. Can you try again?'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, action: any) => {
    try {
      if (action.type === 'CREATE_GOAL') {
        await api.addGoal({
          name: action.data.name,
          target_amount: action.data.target_amount,
          current_amount: action.data.current_amount || 0,
          monthly_contribution: action.data.monthly_contribution || 0
        });

        // Mark executed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId && m.action
              ? { ...m, text: m.text + '\n\n✅ Goal created successfully!', action: { ...m.action, executed: true } }
              : m
          )
        );
        onRefreshData();
      }
    } catch (e) {
      alert('Could not execute goal creation. Please verify details.');
    }
  };

  const quickPrompts = [
    t('ai_input_placeholder').includes('Urdu') 
      ? "Mujhe bike ke liye paise save karne hain."
      : "I want to buy a bike.",
    "Can I afford a new phone?",
    "Explain compound interest.",
    "Why am I spending too much?",
    "What if my expenses increase by 10%?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] relative max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 bg-[#112316]/90 border border-white/10 rounded-2xl mb-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">{t('ai_ask_title')}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold">FinGuide AI Intelligent Co-Pilot</p>
          </div>
        </div>

        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2.5 rounded-xl border transition-all ${
            ttsEnabled
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
              : 'border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Text-To-Speech response"
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 min-h-0 bg-[#0c180e]/60 rounded-2xl border border-white/10 backdrop-blur-sm custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-md leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-[#1b321f] to-[#2b4d32] text-white border border-emerald-500/30 rounded-br-none font-medium'
                  : 'bg-[#142618]/95 border border-white/15 rounded-bl-none text-slate-100'
              }`}
            >
              {/* Message text */}
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Action confirmation box */}
              {msg.action && msg.action.type === 'CREATE_GOAL' && !msg.action.executed && (
                <div className="mt-4 p-4 rounded-xl bg-[#0e1c12] border border-emerald-500/30 text-white space-y-3.5 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Target className="w-4 h-4" />
                    <span>Automated Goal Roadmap</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-200">
                    <p><strong className="text-emerald-300">Goal Target:</strong> {msg.action.data.name}</p>
                    <p><strong className="text-emerald-300">Total Price:</strong> PKR {msg.action.data.target_amount.toLocaleString()}</p>
                    <p><strong className="text-emerald-300">Starting Savings:</strong> PKR {msg.action.data.current_amount.toLocaleString()}</p>
                    <p><strong className="text-emerald-300">Monthly Contribution:</strong> PKR {msg.action.data.monthly_contribution.toLocaleString()}/month</p>
                  </div>
                  <button
                    onClick={() => handleConfirmAction(msg.id, msg.action)}
                    className="w-full bg-[#2b4d32] hover:bg-[#386242] text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Add to Goals Tracker
                  </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => submitMessage(prompt)}
              className="text-left p-3 rounded-xl border border-white/10 bg-[#112316]/70 hover:border-emerald-500/40 hover:bg-[#18311e] text-xs text-slate-300 hover:text-white font-medium transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-3 flex items-center gap-2.5">
        {speechSupported && (
          <button
            onClick={handleMicToggle}
            className={`p-3.5 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                : 'border-white/10 bg-[#112316] hover:bg-[#18311e] text-emerald-400'
            }`}
            title={isListening ? 'Listening... Click to stop' : t('voice_speak')}
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
          className="flex-1 bg-[#112316] text-white font-bold border-2 border-[#2b4d32] focus:border-emerald-500 focus:ring-4 focus:ring-[#2b4d32]/20 rounded-2xl px-5 py-3.5 text-xs outline-none transition-all placeholder-slate-400"
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
