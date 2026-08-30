export interface User {
  id: number;
  name: string;
  email: string;
  language: string;
  user_type: string;
}

export interface FinancialProfile {
  monthly_income: number;
  current_savings: number;
  monthly_expenses: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
}

export interface PriceTracking {
  id: number;
  user_id: number;
  product_name: string;
  current_price: number;
  previous_price: number | null;
  last_updated: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DashboardData {
  financial_health_score: number;
  financial_health_reasons: string[];
  financial_health_improvements: string[];
  income: number;
  expenses: number;
  savings: number;
  active_goals: Goal[];
  recent_transactions: Transaction[];
  ai_insights: Array<{
    type: 'tip' | 'warning' | 'info';
    title: string;
    message: string;
    action_text: string;
  }>;
  expense_by_category: Record<string, number>;
}
