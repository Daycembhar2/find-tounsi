import api from '@/lib/api';

export const categoriesService = {

  getAll: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/api/categories/${slug}`);
    return response.data;
  },
};