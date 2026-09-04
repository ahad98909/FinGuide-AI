export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const { hostname, protocol } = window.location;
    // When accessing via network IP or domain on LAN (e.g. 192.168.x.x, 10.x.x.x, or non-localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:8000`;
    }
  }
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost') && !import.meta.env.VITE_API_URL.includes('127.0.0.1')) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:8000';
};

const getUrl = (endpoint: string) => `${getApiBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

const getHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Global intercepting fetch wrapper for authenticated endpoints
const authFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    // Session is invalid, expired, or backend database was reset
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('onboarding_complete');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_complete');
    // Force reload to reset React states and redirect back to Landing screen
    window.location.href = '/';
    throw new Error('Session expired');
  }
  return res;
};

export const api = {
  // Authentication & Profile
  async register(data: any) {
    const res = await fetch(getUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(getUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async demo() {
    const res = await fetch(getUrl('/auth/demo'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Demo login failed');
    }
    return res.json();
  },

  async onboarding(data: any) {
    const res = await authFetch(getUrl('/auth/onboarding'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Onboarding failed');
    return res.json();
  },

  // Dashboard Aggregator
  async getDashboard() {
    const res = await authFetch(getUrl('/dashboard'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  },

  // Transactions Manager
  async getTransactions() {
    const res = await authFetch(getUrl('/transactions'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async addTransaction(data: any) {
    const res = await authFetch(getUrl('/transactions'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async deleteTransaction(id: number) {
    const res = await authFetch(getUrl(`/transactions/${id}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  },

  // Goals
  async getGoals() {
    const res = await authFetch(getUrl('/goals'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async addGoal(data: any) {
    const res = await authFetch(getUrl('/goals'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },

  async createGoal(data: any) {
    return this.addGoal(data);
  },

  async post(endpoint: string, data: any) {
    const res = await authFetch(getUrl(endpoint), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `POST ${endpoint} failed`);
    }
    return res.json();
  },

  async updateGoal(id: number, data: any) {
    const res = await authFetch(getUrl(`/goals/${id}`), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  async deleteGoal(id: number) {
    const res = await authFetch(getUrl(`/goals/${id}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete goal');
    return res.json();
  },

  // Prices Simulation
  async getPrices() {
    const res = await authFetch(getUrl('/prices'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch prices');
    return res.json();
  },

  async simulatePriceChange(id: number) {
    const res = await authFetch(getUrl(`/prices/${id}/simulate-change`), {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to simulate price change');
    return res.json();
  },

  // AI Copilot Services & Chat History
  async getChatHistory() {
    const res = await authFetch(getUrl('/ai/history'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  async getChatSession(sessionId: number) {
    const res = await authFetch(getUrl(`/ai/history/${sessionId}`), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch chat session');
    return res.json();
  },

  async newChatSession(language: string = 'en') {
    const res = await authFetch(getUrl(`/ai/new-session?language=${encodeURIComponent(language)}`), {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to create new chat session');
    return res.json();
  },

  async deleteChatSession(sessionId: number) {
    const res = await authFetch(getUrl(`/ai/history/${sessionId}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete chat session');
    return res.json();
  },

  async chat(message: string, language?: string, sessionId?: number) {
    const res = await authFetch(getUrl('/ai/chat'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, language, session_id: sessionId }),
    });
    if (!res.ok) throw new Error('AI Copilot request failed');
    return res.json();
  },

  async analyzeSpending() {
    const res = await authFetch(getUrl('/ai/analyze-expenses'), {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('AI spending analysis failed');
    return res.json();
  },

  async scamDetection(text: string) {
    const res = await authFetch(getUrl('/ai/scam-detection'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Scam detection failed');
    return res.json();
  },

  async whatIf(data: { monthly_savings?: number; monthly_income?: number; monthly_expenses?: number; goal_price?: number; goal_id?: number }) {
    const res = await authFetch(getUrl('/ai/what-if'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('What-if simulation failed');
    return res.json();
  },

  async scanReceipt(data: { image_data?: string; text?: string }) {
    const res = await authFetch(getUrl('/ai/scan-receipt'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Receipt scanning failed');
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await authFetch(getUrl('/notifications'), {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: number) {
    const res = await authFetch(getUrl(`/notifications/${id}/read`), {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await authFetch(getUrl('/notifications/read-all'), {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear notifications');
    return res.json();
  }
};
