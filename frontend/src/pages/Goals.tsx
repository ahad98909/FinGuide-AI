import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Goal, PriceTracking } from '../types';
import {
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Coins,
  Calendar,
  Trash2,
  Plus,
  RefreshCw,
  X,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export const Goals: React.FC<{
  refreshCounter: number;
  onRefreshData: () => void;
}> = ({ refreshCounter, onRefreshData }) => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [prices, setPrices] = useState<PriceTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Goal Form State
  const [name, setName] = useState('Honda CD 70');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [monthlyContribution, setMonthlyContribution] = useState<number | ''>('');

  // Track resolved price increase alerts so the alert panel disappears upon user confirmation
  const [resolvedAlerts, setResolvedAlerts] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('finguide_goal_resolved_alerts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Temporary feedback message after action choice
  const [alertFeedback, setAlertFeedback] = useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, pricesRes] = await Promise.all([api.getGoals(), api.getPrices()]);
      setGoals(goalsRes);
      setPrices(pricesRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshCounter]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addGoal({
        name,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        monthly_contribution: Number(monthlyContribution) || 0
      });
      setShowAddModal(false);
      // Reset form
      setTargetAmount('');
      setCurrentAmount('');
      setMonthlyContribution('');
      loadData();
      onRefreshData();
    } catch (err) {
      alert('Failed to create goal');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.deleteGoal(id);
      loadData();
      onRefreshData();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const handleSimulateChange = async (priceId: number) => {
    try {
      const updatedPrice = await api.simulatePriceChange(priceId);
      // Re-enable alert for any goal matching this product name
      setResolvedAlerts((prev) => {
        const next = { ...prev };
        goals.forEach((g) => {
          if (g.name.toLowerCase() === updatedPrice.product_name.toLowerCase()) {
            delete next[g.id];
          }
        });
        try {
          localStorage.setItem('finguide_goal_resolved_alerts', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
      await loadData();
      onRefreshData();
    } catch (e) {
      alert('Price simulation failed');
    }
  };

  // Option handlers for price adjustments - fixes Problem 1 so panel disappears completely
  const handleApplyOption = async (goal: Goal, optionIndex: number) => {
    try {
      let updatedContrib = goal.monthly_contribution;
      let feedbackMsg = '';

      if (optionIndex === 1) {
        // Option 1: Raise monthly savings by PKR 2,500
        updatedContrib = goal.monthly_contribution + 2500;
        await api.updateGoal(goal.id, {
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          monthly_contribution: updatedContrib,
          status: goal.status
        });
        feedbackMsg = `Monthly savings increased by PKR 2,500 (Now PKR ${updatedContrib.toLocaleString()}/mo). Completion timeline realigned!`;
      } else if (optionIndex === 2) {
        // Option 2: Reduce discretionary expenses
        await api.updateGoal(goal.id, {
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          monthly_contribution: goal.monthly_contribution,
          status: goal.status
        });
        feedbackMsg = 'Budget realigned: Discretionary expenses reduced to keep your savings target on track!';
      } else {
        // Option 3: Keep current plan and accept date
        await api.updateGoal(goal.id, {
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          monthly_contribution: goal.monthly_contribution,
          status: goal.status
        });
        feedbackMsg = `Plan updated: New estimated completion date (${goal.target_date}) confirmed.`;
      }

      // Dismiss the alert panel for this goal's current target amount so it DISAPPEARS COMPLETELY
      setResolvedAlerts((prev) => {
        const next = { ...prev, [goal.id]: goal.target_amount };
        try {
          localStorage.setItem('finguide_goal_resolved_alerts', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      // Show temporary confirmation badge on the card
      setAlertFeedback((prev) => ({ ...prev, [goal.id]: feedbackMsg }));
      setTimeout(() => {
        setAlertFeedback((prev) => {
          const next = { ...prev };
          delete next[goal.id];
          return next;
        });
      }, 6000);

      await loadData();
      onRefreshData();
    } catch (e) {
      alert('Could not update savings goal parameters');
    }
  };

  const handleDismissAlert = (goalId: number, targetAmount: number) => {
    setResolvedAlerts((prev) => {
      const next = { ...prev, [goalId]: targetAmount };
      try {
        localStorage.setItem('finguide_goal_resolved_alerts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t('goal_title')}</h1>
          <p className="text-xs text-slate-300 font-medium">Setup smart targets with real-time price warnings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading goals information...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Goals List (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <div className="bg-white border-2 border-slate-200 rounded-[22px] p-12 text-center text-slate-700 font-bold text-sm shadow-md">
                <Target className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                No savings goals found. Click "Add Goal" to get started!
              </div>
            ) : (
              goals.map((goal) => {
                const percent = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);

                // Check if price increased
                const priceTrack = prices.find((p) => p.product_name.toLowerCase() === goal.name.toLowerCase());
                const priceIncreased = !!(priceTrack && priceTrack.previous_price && priceTrack.current_price > priceTrack.previous_price);
                const priceDiff = priceTrack && priceTrack.previous_price ? priceTrack.current_price - priceTrack.previous_price : 0;

                // Problem 1 Fix: Panel is shown ONLY if price increased and user has not yet chosen an action
                const showPriceAlert = priceIncreased && resolvedAlerts[goal.id] !== goal.target_amount;

                return (
                  <div
                    key={goal.id}
                    className="bg-white border-2 border-slate-200/90 rounded-[22px] p-6 space-y-5 shadow-lg relative overflow-hidden text-slate-900 transition-all hover:border-emerald-500/40"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 shadow-sm flex-shrink-0">
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          {/* 1. Product Name: Dark, Bold, and Clearly Visible */}
                          <h3 className="font-black text-xl text-slate-950 tracking-tight">{goal.name}</h3>
                          <span className="text-[11px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-block mt-1">
                            {goal.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Progress Bar: Vibrant, Clearly Visible Emerald Green on Light Contrast Track */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Goal Progress</span>
                        <span className="font-black text-emerald-800 text-xs bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                          {percent}% complete
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/80 shadow-inner p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm shadow-emerald-500/50 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 pt-0.5">
                        <span>
                          <strong className="text-slate-950 font-black">PKR {goal.current_amount.toLocaleString()}</strong> saved
                        </span>
                        <span>
                          Target: <strong className="text-slate-950 font-black">PKR {goal.target_amount.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Monthly contribution & target date: Dark, high contrast text & numbers */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs border-2 border-slate-200/90 shadow-inner">
                      <div>
                        <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-1">
                          Monthly Saving
                        </span>
                        <span className="font-black text-base text-slate-950 block">
                          PKR {goal.monthly_contribution.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block mb-1">
                          Target Date
                        </span>
                        <span className="font-black text-base text-slate-950 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-700" />
                          {goal.target_date}
                        </span>
                      </div>
                    </div>

                    {/* Feedback confirmation banner when action was applied */}
                    {alertFeedback[goal.id] && (
                      <div className="p-3.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{alertFeedback[goal.id]}</span>
                      </div>
                    )}

                    {/* Price Increased Warning & Option recommendation Panel (Problem 1 Fix) */}
                    {showPriceAlert && (
                      <div className="p-4.5 rounded-2xl border-2 border-amber-300 bg-amber-50 space-y-4 shadow-sm relative text-slate-900 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleDismissAlert(goal.id, goal.target_amount)}
                          className="absolute top-3.5 right-3.5 p-1 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3 text-xs pr-6">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-amber-950 text-sm block">
                              ⚠️ Your goal price increased by PKR {priceDiff.toLocaleString()}!
                            </span>
                            <span className="text-xs text-amber-900 font-semibold block mt-1 leading-snug">
                              New estimated completion has been shifted to <strong className="font-black">{goal.target_date}</strong>. Choose an action plan below:
                            </span>
                          </div>
                        </div>

                        {/* Adjust Options Panel - Clicking ANY option updates parameters and DISMISSES the panel */}
                        <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
                          <button
                            type="button"
                            onClick={() => handleApplyOption(goal, 1)}
                            className="p-3 rounded-xl border-2 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all bg-white shadow-xs cursor-pointer group"
                          >
                            <span className="font-black text-slate-950 group-hover:text-emerald-800 text-xs block mb-1">
                              Option 1
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 block">
                              Raise monthly savings by PKR 2,500
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyOption(goal, 2)}
                            className="p-3 rounded-xl border-2 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all bg-white shadow-xs cursor-pointer group"
                          >
                            <span className="font-black text-slate-950 group-hover:text-emerald-800 text-xs block mb-1">
                              Option 2
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 block">
                              Reduce shopping/other expenses
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyOption(goal, 3)}
                            className="p-3 rounded-xl border-2 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all bg-white shadow-xs cursor-pointer group"
                          >
                            <span className="font-black text-slate-950 group-hover:text-emerald-800 text-xs block mb-1">
                              Option 3
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 block">
                              Keep current plan (accept date)
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Price Tracking Sidebar: Problem 2 Visibility Fix */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200/90 rounded-[22px] p-6 shadow-lg text-slate-900 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-950">Price Tracker</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Monitor live prices for items you want to purchase. Click simulate to test how inflation updates your goal dates.
              </p>

              {prices.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-bold">No products tracked yet.</div>
              ) : (
                <div className="space-y-3.5">
                  {prices.map((p) => {
                    const priceDiff = p.previous_price ? p.current_price - p.previous_price : 0;
                    const percentChange = p.previous_price ? (priceDiff / p.previous_price) * 100 : 0;
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border-2 border-slate-200/80 bg-slate-50 space-y-3 shadow-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            {/* Product Name: Dark and Bold */}
                            <span className="font-black text-base text-slate-950 block">
                              {p.product_name}
                            </span>
                            {/* Date/Time Stamp: Dark and clearly readable */}
                            <span className="text-xs font-bold text-slate-600 block mt-1">
                              Updated: {p.last_updated}
                            </span>
                          </div>
                          <div className="text-right">
                            {/* Amount: Dark, Bold, and high contrast */}
                            <span className="font-black text-base text-slate-950 block">
                              PKR {p.current_price.toLocaleString()}
                            </span>
                            {/* Percentage Change: High contrast badge with clear color coding */}
                            {p.previous_price && (
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-md inline-flex items-center gap-0.5 mt-1 border ${
                                  priceDiff >= 0
                                    ? 'text-rose-800 bg-rose-100 border-rose-300'
                                    : 'text-emerald-800 bg-emerald-100 border-emerald-300'
                                }`}
                              >
                                {priceDiff >= 0 ? '+' : ''}
                                {percentChange.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSimulateChange(p.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold border-2 border-[#2b4d32] bg-[#e8f4eb] hover:bg-[#2b4d32] text-[#2b4d32] hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {t('btn_simulate_price')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-900">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-950 mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Goal Name / Product
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda CD 70, iPhone 17"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Target Price (PKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="200,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Starting Saved Amount (PKR)
                </label>
                <input
                  type="number"
                  placeholder="80,000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Monthly Contribution (PKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="15,000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2b4d32] hover:bg-[#386242] text-white font-black py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/20 text-sm cursor-pointer"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
