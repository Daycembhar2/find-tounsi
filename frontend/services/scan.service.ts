import api from '@/lib/api';

export const scanService = {

  scanBarcode: async (barcode: string) => {
    const response = await api.post('/api/scan/barcode', { barcode });
    return response.data;
  },
};