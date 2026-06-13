import api from '@/lib/api';
import type { Order } from '@/lib/types';

export const ordersService = {
  create: async (payload: {
    seller_id: string;
    delivery_address: string;
    delivery_city: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
  }) => {
    const response = await api.post('/api/orders', payload);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/api/orders/me');
    return response.data.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data.data;
  },

  getSellerOrders: async (sellerId: string) => {
    const response = await api.get(`/api/orders/seller/${sellerId}`);
    return response.data.data || [];
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};
