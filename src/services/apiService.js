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
  async previewFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/upload/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('预识别文件失败:', error);
      throw error.response?.data || error;
    }
  },

  async uploadFile(file, recordDate, recordType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (recordDate) {
        formData.append('record_date', recordDate);
      }
      if (recordType) {
        formData.append('record_type', recordType);
      }
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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

  async updateRecord(recordId, recordDate, recordType) {
    try {
      const response = await apiClient.put(`/record/${recordId}`, null, {
        params: {
          record_date: recordDate,
          record_type: recordType,
        },
      });
      return response.data;
    } catch (error) {
      console.error('更新记录失败:', error);
      throw error.response?.data || error;
    }
  },

  async filterRecords(filters) {
    try {
      const response = await apiClient.get('/records/filter', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('筛选记录失败:', error);
      throw error.response?.data || error;
    }
  },

  async getRecordTypes() {
    try {
      const response = await apiClient.get('/records/types');
      return response.data;
    } catch (error) {
      console.error('获取记录类型失败:', error);
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

export const sleepService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/sleep', data);
      return response.data;
    } catch (error) {
      console.error('创建睡眠记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/sleep', { params });
      return response.data;
    } catch (error) {
      console.error('获取睡眠记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/sleep/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取睡眠记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/sleep/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新睡眠记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/sleep/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除睡眠记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getOngoing() {
    try {
      const response = await apiClient.get('/api/sleep/ongoing');
      return response.data;
    } catch (error) {
      console.error('获取进行中睡眠失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const diaperService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/diaper', data);
      return response.data;
    } catch (error) {
      console.error('创建排泄记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/diaper', { params });
      return response.data;
    } catch (error) {
      console.error('获取排泄记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/diaper/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取排泄记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/diaper/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新排泄记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/diaper/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除排泄记录失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const cryService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/cry', data);
      return response.data;
    } catch (error) {
      console.error('创建哭声记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/cry', { params });
      return response.data;
    } catch (error) {
      console.error('获取哭声记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/cry/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取哭声记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/cry/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新哭声记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/cry/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除哭声记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getOngoing() {
    try {
      const response = await apiClient.get('/api/cry/ongoing');
      return response.data;
    } catch (error) {
      console.error('获取进行中哭声失败:', error);
      throw error.response?.data || error;
    }
  },
  async analyzeReason() {
    try {
      const response = await apiClient.get('/api/cry/analyze');
      return response.data;
    } catch (error) {
      console.error('分析哭声原因失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const dashboardService = {
  async getTodaySummary() {
    try {
      const response = await apiClient.get('/api/today/summary');
      return response.data;
    } catch (error) {
      console.error('获取今日汇总失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const feedingService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/feeding', data);
      return response.data;
    } catch (error) {
      console.error('创建喂养记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/feeding', { params });
      return response.data;
    } catch (error) {
      console.error('获取喂养记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/feeding/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取喂养记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/feeding/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新喂养记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/feeding/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除喂养记录失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const growthService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/growth', data);
      return response.data;
    } catch (error) {
      console.error('创建生长发育记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/growth', { params });
      return response.data;
    } catch (error) {
      console.error('获取生长发育记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/growth/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取生长发育记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/growth/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新生长发育记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/growth/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除生长发育记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getLatest() {
    try {
      const response = await apiClient.get('/api/growth/latest');
      return response.data;
    } catch (error) {
      console.error('获取最新生长发育记录失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const reminderService = {
  async createRecord(data) {
    try {
      const response = await apiClient.post('/api/reminder', data);
      return response.data;
    } catch (error) {
      console.error('创建提醒记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async listRecords(params = {}) {
    try {
      const response = await apiClient.get('/api/reminder', { params });
      return response.data;
    } catch (error) {
      console.error('获取提醒记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getRecord(id) {
    try {
      const response = await apiClient.get(`/api/reminder/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取提醒记录详情失败:', error);
      throw error.response?.data || error;
    }
  },
  async updateRecord(id, data) {
    try {
      const response = await apiClient.put(`/api/reminder/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新提醒记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteRecord(id) {
    try {
      const response = await apiClient.delete(`/api/reminder/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除提醒记录失败:', error);
      throw error.response?.data || error;
    }
  },
  async getPending() {
    try {
      const response = await apiClient.get('/api/reminder/pending');
      return response.data;
    } catch (error) {
      console.error('获取待处理提醒失败:', error);
      throw error.response?.data || error;
    }
  },
  async getToday() {
    try {
      const response = await apiClient.get('/api/reminder/today');
      return response.data;
    } catch (error) {
      console.error('获取今日提醒失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const knowledgeService = {
  async search(query, nResults = 3) {
    try {
      const response = await apiClient.get('/api/knowledge/search', {
        params: { query, n_results: nResults },
      });
      return response.data;
    } catch (error) {
      console.error('搜索知识库失败:', error);
      throw error.response?.data || error;
    }
  },
  async getStatus() {
    try {
      const response = await apiClient.get('/api/knowledge/status');
      return response.data;
    } catch (error) {
      console.error('获取知识库状态失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const labReportService = {
  async parse(data) {
    try {
      const response = await apiClient.post('/api/lab-report/parse', data);
      return response.data;
    } catch (error) {
      console.error('化验单解析失败:', error);
      throw error.response?.data || error;
    }
  },
  async evaluate(data) {
    try {
      const response = await apiClient.post('/api/lab-report/evaluate', data);
      return response.data;
    } catch (error) {
      console.error('化验单评估失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const symptomService = {
  async analyze(data) {
    try {
      const response = await apiClient.post('/api/symptom/analyze', data);
      return response.data;
    } catch (error) {
      console.error('症状分析失败:', error);
      throw error.response?.data || error;
    }
  },
  async getCategories() {
    try {
      const response = await apiClient.get('/api/symptom/categories');
      return response.data;
    } catch (error) {
      console.error('获取症状分类失败:', error);
      throw error.response?.data || error;
    }
  },
};

export const chatHistoryService = {
  async createSession(data) {
    try {
      const response = await apiClient.post('/api/chat/sessions', data);
      return response.data;
    } catch (error) {
      console.error('创建对话会话失败:', error);
      throw error.response?.data || error;
    }
  },
  async listSessions() {
    try {
      const response = await apiClient.get('/api/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw error.response?.data || error;
    }
  },
  async getSessionMessages(sessionId) {
    try {
      const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error('获取对话消息失败:', error);
      throw error.response?.data || error;
    }
  },
  async deleteSession(sessionId) {
    try {
      const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('删除对话会话失败:', error);
      throw error.response?.data || error;
    }
  },
};

export default apiClient;