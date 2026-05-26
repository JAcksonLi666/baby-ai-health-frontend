import apiClient, { API_BASE_URL } from './apiClient';

export const chatService = {
  async askQuestion(question, useCloud = false, topK = 3, model = "auto") {
    const response = await apiClient.post('/ask', {
      question,
      use_cloud: useCloud,
      top_k: topK,
      model,
    });
    return response.data;
  },

  askQuestionStream(question, useCloud = false, topK = 3, model = "auto") {
    return new EventSource(
      `${API_BASE_URL}/ask/stream?question=${encodeURIComponent(question)}&use_cloud=${useCloud}&top_k=${topK}&model=${encodeURIComponent(model)}`
    );
  },
};

export const chatHistoryService = {
  async createSession(data) {
    const response = await apiClient.post('/api/chat/sessions', data);
    return response.data;
  },

  async listSessions() {
    const response = await apiClient.get('/api/chat/sessions');
    return response.data;
  },

  async getSessionMessages(sessionId) {
    const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async deleteSession(sessionId) {
    const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
    return response.data;
  },
};
