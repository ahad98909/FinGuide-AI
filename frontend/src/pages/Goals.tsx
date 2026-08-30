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
  Lightbulb
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

  // Selected Option States for Price Adjustments
  const [selectedGoalOption, setSelectedGoalOption] = useState<Record<number, number>>({});

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
      await api.simulatePriceChange(priceId);
      loadData();
      onRefreshData();
    } catch (e) {
      alert('Price simulation failed');
    }
  };

  // Option handlers for price adjustments
  const handleApplyOption = async (goal: Goal, optionIndex: number) => {
    try {
      let updatedContrib = goal.monthly_contribution;
      if (optionIndex === 1) {
        // Increase savings by PKR 2500 on the existing goal
        updatedContrib = goal.monthly_contribution + 2500;
        await api.updateGoal(goal.id, {
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          monthly_contribution: updatedContrib,
          status: goal.status
        });
      } else if (optionIndex === 2) {
        // Reduce spending recommendation
        alert("Applied: Discretionary expenses reduced. Saved to plan!");
      } else {
        // Keep current plan
        alert("Plan updated: Accepting new estimated completion date.");
      }

      setSelectedGoalOption((prev) => ({ ...prev, [goal.id]: optionIndex }));
      loadData();
      onRefreshData();
    } catch (e) {
      alert('Could not update savings goal parameters');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('goal_title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Setup smart targets with real-time price warnings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-forest-900/10"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="w-8 h-8 border-4 border-[#2b4d32] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading goals information...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Goals List (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <div className="glass-card text-center py-12 text-slate-400 text-sm">
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                No savings goals found. Add a goal to get started!
              </div>
            ) : (
              goals.map((goal) => {
                const percent = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
                
                // Check if price increased (if current target price is 200,000 and price tracking matches)
                const priceTrack = prices.find((p) => p.product_name === goal.name);
                const priceIncreased = priceTrack && priceTrack.previous_price && priceTrack.current_price > priceTrack.previous_price;
                const priceDiff = priceTrack && priceTrack.previous_price ? priceTrack.current_price - priceTrack.previous_price : 0;

                return (
                  <div key={goal.id} className="glass-card space-y-5 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest-600/10 border border-forest-500/20 flex items-center justify-center text-emerald-600">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                          <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                            {goal.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500">Progress</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-450">{percent}% complete</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1b321f] to-[#2b4d32] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>PKR {goal.current_amount.toLocaleString()} saved</span>
                        <span>Target: PKR {goal.target_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Monthly contribution & target date */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl text-xs border border-slate-200/40 dark:border-slate-800/40">
                      <div>
                        <span className="text-slate-400 block mb-1">Monthly Saving</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          PKR {goal.monthly_contribution.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Target Date</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {goal.target_date}
                        </span>
                      </div>
                    </div>

                    {/* Price Increased Warning & Option recommendation */}
                    {priceIncreased && (
                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3.5">
                        <div className="flex items-start gap-2.5 text-amber-600 dark:text-amber-400 text-xs">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <span className="font-bold block">⚠️ Your goal price increased by PKR {priceDiff.toLocaleString()}!</span>
                            <span className="text-[11px] block mt-0.5 leading-snug">
                              New estimated completion has been shifted to {goal.target_date}. Choose an action plan below:
                            </span>
                          </div>
                        </div>

                        {/* Adjust Options Panel */}
                        <div className="grid sm:grid-cols-3 gap-2 text-xs">
                          <button
                            onClick={() => handleApplyOption(goal, 1)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              selectedGoalOption[goal.id] === 1
                                ? 'border-[#2b4d32] bg-[#2b4d32]/10 text-[#2b4d32]'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <span className="font-bold block mb-1">Option 1</span>
                            <span className="text-[10px] text-slate-500">Raise monthly savings by PKR 2,500</span>
                          </button>

                          <button
                            onClick={() => handleApplyOption(goal, 2)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              selectedGoalOption[goal.id] === 2
                                ? 'border-[#2b4d32] bg-[#2b4d32]/10 text-[#2b4d32]'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <span className="font-bold block mb-1">Option 2</span>
                            <span className="text-[10px] text-slate-500">Reduce shopping/other expenses</span>
                          </button>

                          <button
                            onClick={() => handleApplyOption(goal, 3)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              selectedGoalOption[goal.id] === 3
                                ? 'border-[#2b4d32] bg-[#2b4d32]/10 text-[#2b4d32]'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <span className="font-bold block mb-1">Option 3</span>
                            <span className="text-[10px] text-slate-500">Keep current plan (accept date)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Price Tracking Sidebar */}
          <div className="space-y-6">
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Price Tracker</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Monitor the prices of things you want to buy. Simulate a market price change to verify savings calculations.
              </p>

              {prices.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No products tracked yet.</div>
              ) : (
                <div className="space-y-4">
                  {prices.map((p) => {
                    const priceDiff = p.previous_price ? p.current_price - p.previous_price : 0;
                    const percentChange = p.previous_price ? (priceDiff / p.previous_price) * 100 : 0;
                    return (
                      <div key={p.id} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm block text-slate-800 dark:text-slate-100">
                              {p.product_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Updated: {p.last_updated}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm block">PKR {p.current_price.toLocaleString()}</span>
                            {p.previous_price && (
                              <span className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                                priceDiff >= 0 ? 'text-rose-500' : 'text-emerald-500'
                              }`}>
                                {priceDiff >= 0 ? '+' : ''}
                                {percentChange.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSimulateChange(p.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-[#2b4d32]/5 text-[#2b4d32] dark:text-emerald-400 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Goal Name / Product</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#2b4d32]/50 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Price (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder="200,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#2b4d32]/50 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Starting Saved Amount (PKR)</label>
                <input
                  type="number"
                  placeholder="80,000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#2b4d32]/50 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Monthly Contribution (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder="15,000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#2b4d32]/50 focus:ring-[#2b4d32]/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold py-3 rounded-xl transition-all"
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
