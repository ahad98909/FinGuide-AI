import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Transaction, DashboardData } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  ChevronDown,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export const Reports: React.FC<{ refreshCounter: number }> = ({ refreshCounter }) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'6m' | '3m' | '1y'>('6m');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, txs] = await Promise.all([
          api.getDashboard().catch(() => null),
          api.getTransactions().catch(() => [])
        ]);
        if (dash) setDashboardData(dash);
        if (txs) {
          const txList = Array.isArray(txs) ? txs : (txs?.transactions || []);
          setTransactions(txList);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshCounter]);

  // Monthly Spending Trend Data
  const monthlySpendingData = [
    { month: 'Mar', expenses: 38000, income: 100000 },
    { month: 'Apr', expenses: 42000, income: 100000 },
    { month: 'May', expenses: 39500, income: 100000 },
    { month: 'Jun', expenses: 54000, income: 100000 },
    { month: 'Jul', expenses: 51200, income: 100000 },
    { month: 'Aug', expenses: 46800, income: 100000 },
  ];

  // Category Breakdown Data
  const defaultCategoryData = [
    { name: 'Food', value: 26, color: '#10b981' },
    { name: 'Transport', value: 14, color: '#06b6d4' },
    { name: 'Bills', value: 33, color: '#f59e0b' },
    { name: 'Shopping', value: 12, color: '#a855f7' },
    { name: 'Education', value: 8, color: '#ec4899' },
    { name: 'Other', value: 7, color: '#64748b' }
  ];

  // Calculate live category breakdown if user logged transactions
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const totalExpenseVal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const pieData =
    totalExpenseVal > 0
      ? Object.entries(categoryTotals).map(([name, val], idx) => {
          const colors = ['#10b981', '#06b6d4', '#f59e0b', '#a855f7', '#ec4899', '#64748b', '#3b82f6'];
          return {
            name,
            value: Math.round((val / totalExpenseVal) * 100),
            color: colors[idx % colors.length]
          };
        })
      : defaultCategoryData;

  // Income vs Expenses Horizontal Data
  const incomeVsExpenseData = [
    { month: 'Mar', Income: 100000, Expenses: 38000 },
    { month: 'Apr', Income: 100000, Expenses: 42000 },
    { month: 'Aug', Income: 100000, Expenses: 46800 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-emerald-400/90 font-medium mt-1">
            Understand your financial patterns and spending trends.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1 text-xs font-bold text-slate-300">
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '3m' ? 'bg-[#2b4d32] text-white' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              Last 3 Months
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '6m' ? 'bg-[#2b4d32] text-white' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '1y' ? 'bg-[#2b4d32] text-white' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner: AI Summary */}
      <div className="glass-card bg-emerald-950/60 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                AI Financial Summary
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Your expenses <strong className="text-emerald-300">decreased by 8%</strong> compared with last month.
              Food spending remains your largest category at <strong className="text-emerald-300">26%</strong>. Your
              savings rate improved to <strong className="text-emerald-300">17%</strong>, which is above average.
              Keep up the good work!
            </p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Monthly Spending Trend */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Monthly Spending Trend
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Expenses in PKR</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#112316',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Expenses']}
                />
                <Bar dataKey="expenses" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Category Breakdown */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              Category Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{pieData.length} Categories</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#112316',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-extrabold text-white">{pieData.length}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Categories</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
            {pieData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
                <span className="text-white font-extrabold ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Income vs Expenses Comparison */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Income vs Expenses
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Expenses
              </span>
            </div>
          </div>

          <div className="space-y-4 my-auto">
            {incomeVsExpenseData.map((item) => {
              const expensePct = Math.round((item.Expenses / item.Income) * 100);
              const savingsPct = 100 - expensePct;
              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{item.month}</span>
                    <span className="text-slate-400 text-[10px]">
                      Expenses: <span className="text-rose-400">PKR {item.Expenses.toLocaleString()}</span> /
                      Income: <span className="text-emerald-400">PKR {item.Income.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/10">
                    <div
                      style={{ width: `${savingsPct}%` }}
                      className="bg-emerald-500/80 hover:bg-emerald-500 transition-all"
                      title={`Savings: ${savingsPct}%`}
                    />
                    <div
                      style={{ width: `${expensePct}%` }}
                      className="bg-rose-500/80 hover:bg-rose-500 transition-all"
                      title={`Expenses: ${expensePct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Spending Trend Card */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Spending Trend
            </h3>
          </div>

          <div className="my-auto flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/40">
              <TrendingDown className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-1.5 text-3xl font-black text-emerald-400 mb-1">
              <span>↓ 8%</span>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-3">
              Spending decreased vs last month
            </p>

            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Improving
            </span>
          </div>

          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Avg Monthly Burn</span>
              <span className="text-white font-extrabold">PKR 45,000</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Savings Rate</span>
              <span className="text-emerald-400 font-extrabold">17%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
