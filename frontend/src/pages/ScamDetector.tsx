import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, ShieldCheck, X } from 'lucide-react';

export const ScamDetector: React.FC = () => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    risk_level: string;
    risk_score: number;
    reasons: string[];
    actions: string[];
    disclaimer: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.scamDetection(text);
      setResult(res);
    } catch (err) {
      alert('Could not run scam verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  // Helper color tags
  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'text-rose-600 border-rose-500 bg-rose-500/10';
      case 'MEDIUM':
        return 'text-amber-600 border-amber-500 bg-amber-500/10';
      default:
        return 'text-emerald-600 border-emerald-500 bg-emerald-500/10';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('scam_title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Paste SMS, WhatsApp claims, or emails to audit risk levels.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Input area (3 cols) */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <div className="glass-card space-y-4 relative">
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Suspicious Message text
            </label>
            <textarea
              required
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('scam_placeholder')}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#2b4d32]/50 focus:ring-[#2b4d32]/20 rounded-xl p-4 text-xs outline-none transition-all placeholder-slate-455 dark:placeholder-slate-600 resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-forest-900/10 text-sm flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing suspicious patterns...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Check message
                </>
              )}
            </button>
          </div>

          {/* Static disclaimers */}
          <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10 text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span>
              Disclaimer: FinGuide AI is an educational safety tool to identify common fraud patterns. It does not replace professional legal verification. Never share OTP or PIN details under any circumstances.
            </span>
          </div>
        </form>

        {/* Results area (2 cols) */}
        <div className="md:col-span-2">
          {result ? (
            <div className="glass-card space-y-6 h-full flex flex-col justify-between animate-in zoom-in-95 duration-150">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Audit results
                  </h3>

                  {/* Risk Badge & score */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('scam_risk')}:
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(result.risk_level)}`}>
                      {result.risk_level} RISK
                    </span>
                  </div>

                  {/* Score meter bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-450 uppercase">
                      <span>Risk Index</span>
                      <span className="text-emerald-700 dark:text-emerald-450">{result.risk_score} / 100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.risk_score >= 70 ? 'bg-rose-500' : result.risk_score >= 35 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${result.risk_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reasons why */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Suspicious Indicators
                  </span>
                  <ul className="space-y-2 text-xs">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Immediate Action Steps
                  </span>
                  <ul className="space-y-2 text-xs">
                    {result.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 leading-snug">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal pt-4 border-t border-slate-200/40 dark:border-slate-800/40 mt-6">
                🛡️ Verified by local fraud database heuristics.
              </div>
            </div>
          ) : (
            <div className="glass-card border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-16 text-center text-slate-400 h-full">
              <ShieldCheck className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-slate-600 dark:text-slate-400 mb-1">Awaiting Message</h3>
              <p className="text-xs max-w-[200px] mx-auto leading-relaxed text-slate-400">
                Pasted strings will render security scores and mitigation steps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ScamDetector;
