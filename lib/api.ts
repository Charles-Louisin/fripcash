const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fripcash-token');
}

export function setToken(token: string) {
  localStorage.setItem('fripcash-token', token);
}

export function removeToken() {
  localStorage.removeItem('fripcash-token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.message || 'Une erreur est survenue',
      res.status,
      data
    );
  }

  return data;
}

// ─── Auth ───

export const authApi = {
  register: (body: {
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    pseudo: string;
  }) => request<{ success: boolean; message: string; user?: any; token?: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  verifySms: (body: { phone: string; code: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/verify-sms', { method: 'POST', body: JSON.stringify(body) }),

  resendCode: (body: { phone: string }) =>
    request<{ success: boolean; message: string; verificationCode?: string }>('/auth/resend-code', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { phone: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  adminLogin: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  updateProfile: (body: Record<string, string>) =>
    request<{ success: boolean; user: any }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Articles ───

export interface ArticleFilters {
  category?: string;
  subCategory?: string;
  itemType?: string;
  condition?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const articlesApi = {
  getAll: (filters: ArticleFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.set(key, String(val));
    });
    return request<{ success: boolean; data: any[]; total: number; pagination: any }>(
      `/articles?${params.toString()}`
    );
  },

  getById: (id: string) =>
    request<{ success: boolean; data: any }>(`/articles/${id}`),

  getByUser: (userId: string) =>
    request<{ success: boolean; data: any[] }>(`/articles/user/${userId}`),

  getMy: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<{ success: boolean; data: any[] }>(`/articles/me/listings${q}`);
  },

  create: (body: any) =>
    request<{ success: boolean; data: any }>('/articles', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: any) =>
    request<{ success: boolean; data: any }>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/articles/${id}`, { method: 'DELETE' }),
};

// ─── Categories ───

export const categoriesApi = {
  getAll: () =>
    request<{ success: boolean; data: any[] }>('/categories'),

  getAllAdmin: () =>
    request<{ success: boolean; data: any[] }>('/categories/all'),

  create: (body: { name: string; slug?: string; enabled?: boolean; subGroups?: any[] }) =>
    request<{ success: boolean; data: any }>('/categories', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: any) =>
    request<{ success: boolean; data: any }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Orders ───

export const ordersApi = {
  create: (body: any) =>
    request<{ success: boolean; data: any }>('/orders', { method: 'POST', body: JSON.stringify(body) }),

  getMy: (params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return request<{ success: boolean; data: any[] }>(`/orders${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<{ success: boolean; data: any }>(`/orders/${id}`),

  confirmDelivery: (id: string, code: string) =>
    request<{ success: boolean; data: any }>(`/orders/${id}/confirm`, { method: 'PUT', body: JSON.stringify({ code }) }),

  ship: (id: string, trackingNumber?: string) =>
    request<{ success: boolean; data: any }>(`/orders/${id}/ship`, { method: 'PUT', body: JSON.stringify({ trackingNumber }) }),
};

// ─── Wallet ───

export const walletApi = {
  getBalance: () =>
    request<{ success: boolean; data: { balance: number; totalIn: number; totalOut: number } }>('/wallet/balance'),

  getTransactions: (type?: string) => {
    const q = type ? `?type=${type}` : '';
    return request<{ success: boolean; data: any[] }>(`/wallet/transactions${q}`);
  },

  withdraw: (body: { amount: number; phone?: string }) =>
    request<{ success: boolean; data: any }>('/wallet/withdraw', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Favorites ───

export const favoritesApi = {
  getAll: () =>
    request<{ success: boolean; data: any[] }>('/favorites'),

  check: (articleId: string) =>
    request<{ success: boolean; isFavorite: boolean }>(`/favorites/${articleId}/check`),

  add: (articleId: string) =>
    request<{ success: boolean; message: string }>(`/favorites/${articleId}`, { method: 'POST' }),

  remove: (articleId: string) =>
    request<{ success: boolean; message: string }>(`/favorites/${articleId}`, { method: 'DELETE' }),
};

// ─── Messages ───

export const messagesApi = {
  getConversations: () =>
    request<{ success: boolean; data: any[] }>('/messages/conversations'),

  getMessages: (conversationId: string) =>
    request<{ success: boolean; data: any[] }>(`/messages/conversations/${conversationId}`),

  startConversation: (body: { articleId: string; message?: string }) =>
    request<{ success: boolean; data: any }>('/messages/conversations', { method: 'POST', body: JSON.stringify(body) }),

  sendMessage: (conversationId: string, text: string) =>
    request<{ success: boolean; data: any }>(`/messages/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
};

// ─── Offers ───

export const offersApi = {
  create: (body: { articleId: string; amount: number; message?: string }) =>
    request<{ success: boolean; data: any }>('/offers', { method: 'POST', body: JSON.stringify(body) }),

  getMine: (type?: 'sent' | 'received') => {
    const q = type ? `?type=${type}` : '';
    return request<{ success: boolean; data: any[] }>(`/offers/me${q}`);
  },

  getForArticle: (articleId: string) =>
    request<{ success: boolean; data: any[] }>(`/offers/article/${articleId}`),

  respond: (id: string, body: { action: 'accept' | 'reject' | 'counter'; counterAmount?: number }) =>
    request<{ success: boolean; data: any }>(`/offers/${id}/respond`, { method: 'PUT', body: JSON.stringify(body) }),

  cancel: (id: string) =>
    request<{ success: boolean; data: any }>(`/offers/${id}/cancel`, { method: 'PUT' }),
};

// ─── Reviews ───

export const reviewsApi = {
  getForArticle: (articleId: string, page?: number) => {
    const q = page ? `?page=${page}` : '';
    return request<{ success: boolean; data: any[]; total: number; avgRating: number; ratingBreakdown: any[] }>(
      `/reviews/article/${articleId}${q}`
    );
  },

  getTop: () =>
    request<{ success: boolean; data: any[] }>('/reviews/top'),

  post: (articleId: string, body: { rating: number; comment: string; images?: string[] }) =>
    request<{ success: boolean; data: any }>(`/reviews/article/${articleId}`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Newsletter ───

export const newsletterApi = {
  subscribe: (email: string) =>
    request<{ success: boolean; message: string }>('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),

  unsubscribe: (email: string) =>
    request<{ success: boolean; message: string }>('/newsletter/unsubscribe', { method: 'POST', body: JSON.stringify({ email }) }),
};

// ─── Notifications ───

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<{ success: boolean; data: any[]; unreadCount: number; pagination: any }>(`/notifications?${q.toString()}`);
  },

  getUnreadCount: () =>
    request<{ success: boolean; unreadCount: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    request<{ success: boolean; data: any }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    request<{ success: boolean; message: string }>('/notifications/read-all', { method: 'PUT' }),
};

// ─── Disputes ───

export const disputesApi = {
  create: (body: { orderId: string; reason: string; description: string }) =>
    request<{ success: boolean; data: any }>('/disputes', { method: 'POST', body: JSON.stringify(body) }),

  getMy: () =>
    request<{ success: boolean; data: any[] }>('/disputes'),
};

// ─── Admin ───

export const adminApi = {
  getStats: () =>
    request<{ success: boolean; data: any }>('/admin/stats'),

  getChartData: (days?: number) => {
    const q = days ? `?days=${days}` : '';
    return request<{ success: boolean; data: { date: string; revenus: number; commissions: number }[] }>(`/admin/chart-data${q}`);
  },

  getUserChartData: (range?: string) => {
    const q = range ? `?range=${range}` : '';
    return request<{ success: boolean; data: { label: string; ventes: number; achats: number }[] }>(`/admin/user-chart${q}`);
  },

  getPublicStats: () =>
    request<{ success: boolean; data: { totalUsers: number; totalArticles: number; totalSold: number; avgRating: number } }>('/admin/public-stats'),

  getUsers: (params?: { status?: string; q?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.q) q.set('q', params.q);
    if (params?.page) q.set('page', String(params.page));
    return request<{ success: boolean; data: any[]; total: number }>(`/admin/users?${q.toString()}`);
  },

  updateUserStatus: (id: string, status: string) =>
    request<{ success: boolean; data: any }>(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getArticles: (params?: { status?: string; q?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.q) q.set('q', params.q);
    if (params?.page) q.set('page', String(params.page));
    return request<{ success: boolean; data: any[]; total: number }>(`/admin/articles?${q.toString()}`);
  },

  updateArticleStatus: (id: string, status: string) =>
    request<{ success: boolean; data: any }>(`/admin/articles/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getOrders: (params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    return request<{ success: boolean; data: any[]; total: number }>(`/admin/orders?${q.toString()}`);
  },

  getDisputes: (params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    return request<{ success: boolean; data: any[]; total: number }>(`/admin/disputes?${q.toString()}`);
  },

  updateDisputeStatus: (id: string, status: string) =>
    request<{ success: boolean; data: any }>(`/admin/disputes/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};
