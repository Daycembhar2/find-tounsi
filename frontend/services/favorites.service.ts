import api from '@/lib/api';

export const favoritesService = {
  getAll: async () => {
    const response = await api.get('/api/favorites');
    return response.data;
  },

  add: async (productId: string) => {
    const response = await api.post('/api/favorites', { product_id: productId });
    return response.data;
  },

  remove: async (productId: string) => {
    const response = await api.delete(`/api/favorites/${productId}`);
    return response.data;
  },

  check: async (productId: string) => {
    const response = await api.get(`/api/favorites/check/${productId}`);
    return response.data;
  },
};
