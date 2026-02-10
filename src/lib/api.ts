const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  const url = `${API_BASE_URL}/${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

export const adsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `ads?${queryString}` : 'ads';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`ads/${id}`);
  },

  create: async (data: {
    title: string;
    description: string;
    price: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    dealer_id: string;
    dealer_name: string;
  }) => {
    return apiCall('ads', 'POST', data);
  },

  update: async (id: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    status: string;
  }>) => {
    return apiCall(`ads/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`ads/${id}`, 'DELETE');
  },
};

export const paymentsApi = {
  getAll: async (params?: { ad_id?: string; dealer_id?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.ad_id) queryParams.append('ad_id', params.ad_id);
    if (params?.dealer_id) queryParams.append('dealer_id', params.dealer_id);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `payments?${queryString}` : 'payments';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`payments/${id}`);
  },

  create: async (data: {
    ad_id: string;
    dealer_id: string;
    dealer_name: string;
    amount: number;
    payment_method: string;
    status?: string;
    duration_days?: number;
  }) => {
    return apiCall('payments', 'POST', data);
  },

  update: async (id: string, data: Partial<{
    status: string;
    payment_method: string;
    amount: number;
  }>) => {
    return apiCall(`payments/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`payments/${id}`, 'DELETE');
  },
};

export const dashboardApi = {
  getStats: async () => {
    return apiCall('dashboard/stats');
  },

  getRecentAds: async (limit?: number) => {
    const endpoint = limit ? `dashboard/recent-ads?limit=${limit}` : 'dashboard/recent-ads';
    return apiCall(endpoint);
  },

  getRecentRequests: async (limit?: number) => {
    const endpoint = limit ? `dashboard/recent-requests?limit=${limit}` : 'dashboard/recent-requests';
    return apiCall(endpoint);
  },

  getTopDealers: async (limit?: number) => {
    const endpoint = limit ? `dashboard/top-dealers?limit=${limit}` : 'dashboard/top-dealers';
    return apiCall(endpoint);
  },

  getCategoryDistribution: async () => {
    return apiCall('dashboard/category-distribution');
  },

  getActivities: async (limit?: number) => {
    const endpoint = limit ? `dashboard/activities?limit=${limit}` : 'dashboard/activities';
    return apiCall(endpoint);
  },

  createActivity: async (data: {
    user_id?: string;
    user_name: string;
    action: string;
    item?: string;
    type?: string;
  }) => {
    return apiCall('dashboard/activities', 'POST', data);
  },
};

export const carRequestsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `car-requests?${queryString}` : 'car-requests';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`car-requests/${id}`);
  },

  create: async (data: any) => {
    return apiCall('car-requests', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`car-requests/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`car-requests/${id}`, 'DELETE');
  },
};

export const dealersApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `dealers?${queryString}` : 'dealers';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`dealers/${id}`);
  },

  create: async (data: any) => {
    return apiCall('dealers', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`dealers/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`dealers/${id}`, 'DELETE');
  },
};

export const usersApi = {
  getAll: async (params?: { role?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `users?${queryString}` : 'users';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`users/${id}`);
  },

  create: async (data: any) => {
    return apiCall('users', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`users/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`users/${id}`, 'DELETE');
  },
};

export const financeApi = {
  getAll: async (params?: { type?: string; category?: string; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `finance?${queryString}` : 'finance';

    return apiCall(endpoint);
  },

  getSummary: async (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `finance/summary?${queryString}` : 'finance/summary';

    return apiCall(endpoint);
  },

  getDashboard: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    return apiCall(`finance/dashboard?period=${period}`);
  },

  getMonthlyTrend: async (months: number = 6) => {
    return apiCall(`finance/monthly-trend?months=${months}`);
  },

  getById: async (id: string) => {
    return apiCall(`finance/${id}`);
  },

  create: async (data: any) => {
    return apiCall('finance', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`finance/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`finance/${id}`, 'DELETE');
  },
};

export const socialMediaApi = {
  getAll: async (params?: { platform?: string; status?: string; ad_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.ad_id) queryParams.append('ad_id', params.ad_id);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `social-media?${queryString}` : 'social-media';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`social-media/${id}`);
  },

  create: async (data: any) => {
    return apiCall('social-media', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`social-media/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`social-media/${id}`, 'DELETE');
  },
};

export const supportTicketsApi = {
  getAll: async (params?: { status?: string; priority?: string; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `support-tickets?${queryString}` : 'support-tickets';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`support-tickets/${id}`);
  },

  create: async (data: any) => {
    return apiCall('support-tickets', 'POST', data);
  },

  update: async (id: string, data: any) => {
    return apiCall(`support-tickets/${id}`, 'PUT', data);
  },

  delete: async (id: string) => {
    return apiCall(`support-tickets/${id}`, 'DELETE');
  },
};

export const notificationsApi = {
  getAll: async (params?: { user_id?: string; is_read?: boolean; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `notifications?${queryString}` : 'notifications';

    return apiCall(endpoint);
  },

  getById: async (id: string) => {
    return apiCall(`notifications/${id}`);
  },

  create: async (data: any) => {
    return apiCall('notifications', 'POST', data);
  },

  markAsRead: async (id: string) => {
    return apiCall(`notifications/${id}`, 'PUT', { is_read: true });
  },

  markAllAsRead: async (user_id: string) => {
    return apiCall(`notifications/mark-all-read/${user_id}`, 'PUT');
  },

  delete: async (id: string) => {
    return apiCall(`notifications/${id}`, 'DELETE');
  },
};

export const settingsApi = {
  getAll: async (params?: { category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `settings?${queryString}` : 'settings';

    return apiCall(endpoint);
  },

  getByKey: async (key: string) => {
    return apiCall(`settings/${key}`);
  },

  createOrUpdate: async (data: any) => {
    return apiCall('settings', 'POST', data);
  },

  update: async (key: string, data: any) => {
    return apiCall(`settings/${key}`, 'PUT', data);
  },

  delete: async (key: string) => {
    return apiCall(`settings/${key}`, 'DELETE');
  },
};
