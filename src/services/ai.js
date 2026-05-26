import apiClient from './apiClient';

export const labReportService = {
  async parse(data) {
    const response = await apiClient.post('/api/lab-report/parse', data);
    return response.data;
  },

  async evaluate(data) {
    const response = await apiClient.post('/api/lab-report/evaluate', data);
    return response.data;
  },
};

export const symptomService = {
  async analyze(data) {
    const response = await apiClient.post('/api/symptom/analyze', data);
    return response.data;
  },

  async getCategories() {
    const response = await apiClient.get('/api/symptom/categories');
    return response.data;
  },
};

export const knowledgeService = {
  async search(query, nResults = 3) {
    const response = await apiClient.get('/api/knowledge/search', {
      params: { query, n_results: nResults },
    });
    return response.data;
  },

  async getStatus() {
    const response = await apiClient.get('/api/knowledge/status');
    return response.data;
  },
};

export const modelService = {
  async getAvailableModels() {
    const response = await apiClient.get('/models');
    return response.data;
  },

  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
