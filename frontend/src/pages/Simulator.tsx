import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Sliders, HelpCircle, AlertCircle, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export const Simulator: React.FC = () => {
  const { t } = useLanguage();
  const [monthlySavings, setMonthlySavings] = useState(15000);
  const [goalPrice, setGoalPrice] = useState(185000);
  
  // Scenarios
  const [expenseHike, setExpenseHike] = useState(false);
  const [incomeHike, setIncomeHike] = useState(false);

  // Result state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    original_timeline_months: number;
    new_timeline_months: number;
    difference_months: number;
    recommendation: string;
  } | null>(null);

  const calculateSimulation = async () => {
    setLoading(true);
    try {
      // Calculate adjusted income/expenses if checkboxes are ticked
      let adjustedIncome: number | undefined = undefined;
      let adjustedExpenses: number | undefined = undefined;

      // Base demo values: income 100,000, expenses 65,000
      if (incomeHike) {
        adjustedIncome = 115000; // +15%
      }
      if (expenseHike) {
        adjustedExpenses = 71500; // +10%
      }

      const res = await api.whatIf({
        monthly_savings: monthlySavings,
        goal_price: goalPrice,
        monthly_income: adjustedIncome,
        monthly_expenses: adjustedExpenses
      });
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    calculateSimulation();
  }, [monthlySavings, goalPrice, expenseHike, incomeHike]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('sim_title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Play with numbers in real-time to see how they impact your goals.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left Side: Sliders Input (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Simulation Inputs
            </h3>

            {/* Monthly Savings Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Simulated Monthly Savings</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">PKR {monthlySavings.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2b4d32] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 flex justify-between">
                <span>Min: PKR 5,000</span>
                <span>Max: PKR 50,000</span>
              </span>
            </div>

            {/* Goal Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Simulated Goal Price</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">PKR {goalPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="300000"
                step="5000"
                value={goalPrice}
                onChange={(e) => setGoalPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2b4d32] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 flex justify-between">
                <span>Min: PKR 100,000</span>
                <span>Max: PKR 300,000</span>
              </span>
            </div>

            {/* Quick Scenario Checkboxes */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quick Scenarios</span>
              
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={expenseHike}
                  onChange={(e) => setExpenseHike(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 border-slate-300 bg-transparent cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold block">What if my expenses increase by 10%?</span>
                  <span className="text-[10px] text-slate-450">Simulates inflation or emergency costs (PKR 65,000 → PKR 71,500)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={incomeHike}
                  onChange={(e) => setIncomeHike(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 border-slate-300 bg-transparent cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold block">What if my income increases by 15%?</span>
                  <span className="text-[10px] text-slate-450">Simulates a salary raise or bonus (PKR 100,000 → PKR 115,000)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Output Results (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card bg-[#2b4d32]/5 border border-[#2b4d32]/15 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                {t('sim_result')}
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-6 h-6 border-2 border-[#2b4d32] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Recalculating...</span>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Timeline change indicators */}
                  <div className="flex items-center gap-6">
                    <div className="text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 flex-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Original</span>
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                        {results.original_timeline_months} mos
                      </span>
                    </div>

                    <div className="text-center p-3 rounded-2xl bg-[#2b4d32] text-white flex-1 shadow-md shadow-[#2b4d32]/10">
                      <span className="text-[10px] text-emerald-250 uppercase tracking-wider block font-bold">Simulated</span>
                      <span className="text-lg font-extrabold mt-1 block">
                        {results.new_timeline_months} mos
                      </span>
                    </div>
                  </div>

                  {/* Summary alert */}
                  <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex gap-2.5 items-start text-xs">
                      {results.difference_months > 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-slate-100">
                          {results.difference_months > 0
                            ? t('sim_diff_earlier', { months: results.difference_months.toFixed(1) })
                            : results.difference_months < 0
                            ? t('sim_diff_later', { months: Math.abs(results.difference_months).toFixed(1) })
                            : 'No timeline difference.'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                          Calculated based on PKR {goalPrice.toLocaleString()} target and PKR 80,000 current savings.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Copilot Advice */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Copilot recommendation
                    </span>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {results.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">Could not calculate timeline parameters.</div>
              )}
            </div>

            <div className="text-[10px] text-slate-450 dark:text-slate-500 leading-snug pt-4 border-t border-slate-200/40 dark:border-slate-800/40 mt-6">
              ℹ️ Calculations use a basic remaining target deficit division algorithm. Actual timeline shifts will depend on real monthly ledger balances.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Simulator;
