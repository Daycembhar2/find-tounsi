import api from '@/lib/api';

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

const persistSession = (token: string, user: { id: string; name?: string; email?: string; role?: string }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setCookie('token', token);
  setCookie('user_id', user.id);
};

export const authService = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', data);
    if (response.data.token) {
      persistSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    if (response.data.token) {
      persistSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
    removeCookie('user_id');
    window.location.href = '/auth/login';
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    if (response.data?.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      setCookie('user_id', response.data.data.id);
    }
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  requireAuth: () => {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('Non authentifié');
    }
    return user;
  },
};
