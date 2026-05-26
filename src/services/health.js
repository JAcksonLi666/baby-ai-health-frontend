import apiClient from './apiClient';

export const growthService = {
  async createRecord(data) {
    const response = await apiClient.post('/api/growth', data);
    return response.data;
  },

  async listRecords(params = {}) {
    const response = await apiClient.get('/api/growth', { params });
    return response.data;
  },

  async getRecord(id) {
    const response = await apiClient.get(`/api/growth/${id}`);
    return response.data;
  },

  async updateRecord(id, data) {
    const response = await apiClient.put(`/api/growth/${id}`, data);
    return response.data;
  },

  async deleteRecord(id) {
    const response = await apiClient.delete(`/api/growth/${id}`);
    return response.data;
  },

  async getLatest() {
    const response = await apiClient.get('/api/growth/latest');
    return response.data;
  },
};

export const reminderService = {
  async createRecord(data) {
    const response = await apiClient.post('/api/reminder', data);
    return response.data;
  },

  async listRecords(params = {}) {
    const response = await apiClient.get('/api/reminder', { params });
    return response.data;
  },

  async getRecord(id) {
    const response = await apiClient.get(`/api/reminder/${id}`);
    return response.data;
  },

  async updateRecord(id, data) {
    const response = await apiClient.put(`/api/reminder/${id}`, data);
    return response.data;
  },

  async deleteRecord(id) {
    const response = await apiClient.delete(`/api/reminder/${id}`);
    return response.data;
  },

  async getPending() {
    const response = await apiClient.get('/api/reminder/pending');
    return response.data;
  },

  async getToday() {
    const response = await apiClient.get('/api/reminder/today');
    return response.data;
  },
};

export const dashboardService = {
  async getTodaySummary() {
    const response = await apiClient.get('/api/today/summary');
    return response.data;
  },
};

export const analysisService = {
  async analyzeTrend(metricName, timeRange = 'all') {
    const response = await apiClient.post('/analyze-trend', null, {
      params: { metric_name: metricName, time_range: timeRange },
    });
    return response.data;
  },
};
