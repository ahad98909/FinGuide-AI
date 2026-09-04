import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Transaction, TransactionSummary } from '../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  Clock,
  X,
  Lightbulb,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ChevronDown,
  Check
} from 'lucide-react';

export const MoneyManager: React.FC<{
  refreshCounter: number;
  onRefreshData: () => void;
}> = ({ refreshCounter, onRefreshData }) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    income_count: 0,
    expense_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Form State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Spending Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions();
      
      const txList: Transaction[] = Array.isArray(res)
        ? res
        : (res?.transactions || []);

      const calcIncome = txList
        .filter((t) => t.type?.toLowerCase() === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const calcExpenses = txList
        .filter((t) => t.type?.toLowerCase() === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const incomeCount = txList.filter((t) => t.type?.toLowerCase() === 'income').length;
      const expenseCount = txList.filter((t) => t.type?.toLowerCase() === 'expense').length;

      const summaryData: TransactionSummary = res?.summary ? {
        total_income: Number(res.summary.total_income ?? calcIncome),
        total_expenses: Number(res.summary.total_expenses ?? calcExpenses),
        balance: Number(res.summary.balance ?? (calcIncome - calcExpenses)),
        income_count: Number(res.summary.income_count ?? incomeCount),
        expense_count: Number(res.summary.expense_count ?? expenseCount),
      } : {
        total_income: calcIncome,
        total_expenses: calcExpenses,
        balance: calcIncome - calcExpenses,
        income_count: incomeCount,
        expense_count: expenseCount,
      };

      setTransactions(txList);
      setSummary(summaryData);
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [refreshCounter]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    try {
      await api.addTransaction({
        type,
        category,
        amount: Number(amount),
        description,
        date
      });
      setShowAddModal(false);
      // Reset form
      setAmount('');
      setDescription('');
      await loadTransactions();
      onRefreshData();
    } catch (e) {
      alert('Failed to log transaction');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.deleteTransaction(id);
      await loadTransactions();
      onRefreshData();
    } catch (e) {
      alert('Failed to delete transaction');
    }
  };

  const handleAnalyzeSpending = async () => {
    setAnalysisLoading(true);
    setAiAnalysis('');
    try {
      const res = await api.analyzeSpending();
      setAiAnalysis(res.analysis);
    } catch (e) {
      setAiAnalysis('Could not perform analysis. Make sure some transactions are logged.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Education', 'Healthcare', 'Entertainment', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header and top tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{t('money_manager_title')}</h1>
          <p className="text-xs text-emerald-400/90 font-medium mt-1">Track and analyze cash flows with AI insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyzeSpending}
            className="flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-black/20"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {t('btn_analyze_spending')}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-tr from-emerald-600 to-forest-500 hover:from-emerald-500 hover:to-forest-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            {t('btn_add_tx')}
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards: Total Income, Total Expenses, Remaining Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <div className="glass-card glass-card-glow flex flex-col justify-between group hover:border-emerald-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400/90 uppercase tracking-wider block">
                Total Income
              </span>
              <span className="text-2xl font-black text-white block mt-2 tracking-tight">
                PKR {summary.total_income.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> {summary.income_count} Income Entries
            </span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass-card flex flex-col justify-between group hover:border-rose-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-rose-400/90 uppercase tracking-wider block">
                Total Expenses
              </span>
              <span className="text-2xl font-black text-white block mt-2 tracking-tight">
                PKR {summary.total_expenses.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-rose-300 font-bold bg-rose-500/15 border border-rose-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {summary.expense_count} Expense Entries
            </span>
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className="glass-card flex flex-col justify-between group hover:border-cyan-500/40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-cyan-400/90 uppercase tracking-wider block">
                Remaining Balance
              </span>
              <span className={`text-2xl font-black block mt-2 tracking-tight ${
                summary.balance >= 0 ? 'text-white' : 'text-rose-400'
              }`}>
                PKR {summary.balance.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/40 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.8 rounded-full inline-flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Net Cash Reserve
            </span>
          </div>
        </div>
      </div>

      {/* AI Analysis View */}
      {(aiAnalysis || analysisLoading) && (
        <div className="glass-card bg-emerald-950/40 border border-emerald-500/20 p-5 rounded-2xl relative animate-in fade-in duration-150">
          {aiAnalysis && (
            <button
              onClick={() => setAiAnalysis('')}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-start gap-3.5 text-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-md">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-emerald-400 mb-1 flex items-center gap-1.5">
                FinGuide Assistant Analysis
              </h3>
              {analysisLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Running AI analysis model...
                </div>
              ) : (
                <p className="text-xs leading-relaxed font-medium mt-1 text-slate-200">{aiAnalysis}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="glass-card">
        <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Transaction Logs
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading ledger...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No transactions found. Log a transaction using the button above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-emerald-400/80 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">{tx.date}</td>
                    <td className="py-3.5 px-4 font-medium uppercase">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type?.toLowerCase() === 'income'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{tx.category}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                      {tx.description || '-'}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black ${
                      tx.type?.toLowerCase() === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type?.toLowerCase() === 'income' ? '+' : '-'}PKR {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 hover:bg-rose-500/15 rounded-lg text-rose-400 hover:text-rose-300 transition-colors inline-block"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#112316] border border-white/15 text-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-white">Log Transaction</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                      type === 'expense'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-md'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                      type === 'income'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full bg-[#152a1b] text-white font-extrabold border-2 border-[#2b4d32] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                  >
                    <span className="text-inherit font-bold">{category}</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#112316] border-2 border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {[...categories, ...(type === 'income' ? ['Salary'] : [])].map((cat) => {
                        const isSelected = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#2b4d32] text-white font-extrabold'
                                : 'text-slate-200 hover:bg-white/10 hover:text-emerald-300'
                            }`}
                          >
                            <span className="text-inherit">{cat}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Amount (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder="2,500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-900 placeholder:text-slate-400 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Uber ride to office"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-900 placeholder:text-slate-400 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#2b4d32] focus:ring-4 focus:ring-[#2b4d32]/10 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-900 transition-all font-semibold cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-tr from-emerald-600 to-forest-500 hover:from-emerald-500 hover:to-forest-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/40 text-xs"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MoneyManager;
