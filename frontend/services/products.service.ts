import api from '@/lib/api';

export const productsService = {

  // Tous les produits
  getAll: async (params?: {
    limit?    : number;
    category? : string;
    brand?    : string;
    search?   : string;
  }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Un produit par ID
  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Un produit par slug
  getBySlug: async (slug: string) => {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data;
  },
};