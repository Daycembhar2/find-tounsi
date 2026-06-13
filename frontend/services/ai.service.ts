import api from '@/lib/api';

export const aiService = {

  // Chat avec l'assistant
  chat: async (messages: { role: string; content: string }[]) => {
    const response = await api.post('/api/ai/chat', { messages });
    return response.data;
  },

  // Vérifier l'origine d'un produit
  verify: async (productInfo: {
    name     : string;
    brand?   : string;
    country? : string;
    origins? : string;
  }) => {
    const response = await api.post('/api/ai/verify', productInfo);
    return response.data;
  },
};