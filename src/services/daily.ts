import apiClient from './apiClient';

export const sleepService = {
  async createRecord(data: any) {
    const response = await apiClient.post('/api/sleep', data);
    return response.data;
  },

  async listRecords(params: any = {}) {
    const response = await apiClient.get('/api/sleep', { params });
    return response.data;
  },

  async getRecord(id: string) {
    const response = await apiClient.get(`/api/sleep/${id}`);
    return response.data;
  },

  async updateRecord(id: string, data: any) {
    const response = await apiClient.put(`/api/sleep/${id}`, data);
    return response.data;
  },

  async deleteRecord(id: string) {
    const response = await apiClient.delete(`/api/sleep/${id}`);
    return response.data;
  },

  async getOngoing() {
    const response = await apiClient.get('/api/sleep/ongoing');
    return response.data;
  },
};

export const diaperService = {
  async createRecord(data: any) {
    const response = await apiClient.post('/api/diaper', data);
    return response.data;
  },

  async listRecords(params: any = {}) {
    const response = await apiClient.get('/api/diaper', { params });
    return response.data;
  },

  async getRecord(id: string) {
    const response = await apiClient.get(`/api/diaper/${id}`);
    return response.data;
  },

  async updateRecord(id: string, data: any) {
    const response = await apiClient.put(`/api/diaper/${id}`, data);
    return response.data;
  },

  async deleteRecord(id: string) {
    const response = await apiClient.delete(`/api/diaper/${id}`);
    return response.data;
  },
};

export const cryService = {
  async createRecord(data: any) {
    const response = await apiClient.post('/api/cry', data);
    return response.data;
  },

  async listRecords(params: any = {}) {
    const response = await apiClient.get('/api/cry', { params });
    return response.data;
  },

  async getRecord(id: string) {
    const response = await apiClient.get(`/api/cry/${id}`);
    return response.data;
  },

  async updateRecord(id: string, data: any) {
    const response = await apiClient.put(`/api/cry/${id}`, data);
    return response.data;
  },

  async deleteRecord(id: string) {
    const response = await apiClient.delete(`/api/cry/${id}`);
    return response.data;
  },

  async getOngoing() {
    const response = await apiClient.get('/api/cry/ongoing');
    return response.data;
  },

  async analyzeReason() {
    const response = await apiClient.get('/api/cry/analyze');
    return response.data;
  },
};

export const feedingService = {
  async createRecord(data: any) {
    const response = await apiClient.post('/api/feeding', data);
    return response.data;
  },

  async listRecords(params: any = {}) {
    const response = await apiClient.get('/api/feeding', { params });
    return response.data;
  },

  async getRecord(id: string) {
    const response = await apiClient.get(`/api/feeding/${id}`);
    return response.data;
  },

  async updateRecord(id: string, data: any) {
    const response = await apiClient.put(`/api/feeding/${id}`, data);
    return response.data;
  },

  async deleteRecord(id: string) {
    const response = await apiClient.delete(`/api/feeding/${id}`);
    return response.data;
  },
};
