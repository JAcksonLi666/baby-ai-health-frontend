import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadService = {
  async uploadFile(file, recordDate, recordType = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record_date', recordDate);
    formData.append('record_type', recordType);

    try {
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const chatService = {
  async askQuestion(question, useCloud = false, topK = 3, model = "auto") {
    try {
      const response = await apiClient.post('/ask', {
        question,
        use_cloud: useCloud,
        top_k: topK,
        model: model,
      });
      return response.data;
    } catch (error) {
      console.error('问答失败:', error);
      throw error.response?.data || error;
    }
  },

  askQuestionStream(question, useCloud = false, topK = 3, model = "auto") {
    return new EventSource(
      `${API_BASE_URL}/ask/stream?question=${encodeURIComponent(question)}&use_cloud=${useCloud}&top_k=${topK}&model=${encodeURIComponent(model)}`
    );
  },
};

export const recordService = {
  async getRecords(limit = 50) {
    try {
      const response = await apiClient.get('/records', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('获取记录失败:', error);
      throw error.response?.data || error;
    }
  },

  async getRecord(recordId) {
    try {
      const response = await apiClient.get(`/record/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('获取记录详情失败:', error);
      throw error.response?.data || error;
    }
  },

  async deleteRecord(recordId) {
    try {
      const response = await apiClient.delete(`/record/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('删除记录失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const modelService = {
  async getAvailableModels() {
    try {
      const response = await apiClient.get('/models');
      return response.data;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error.response?.data || error;
    }
  },

  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const analysisService = {
  async analyzeTrend(metricName, timeRange = 'all') {
    try {
      const response = await apiClient.post('/analyze-trend', null, {
        params: { metric_name: metricName, time_range: timeRange },
      });
      return response.data;
    } catch (error) {
      console.error('趋势分析失败:', error);
      throw error.response?.data || error;
    }
  },
};

export default apiClient;