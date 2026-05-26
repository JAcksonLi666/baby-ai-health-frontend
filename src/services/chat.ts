import apiClient, { API_BASE_URL } from './apiClient';

export const chatService = {
  async askQuestion(question: string, useCloud: boolean = false, topK: number = 3, model: string = "auto") {
    const response = await apiClient.post('/ask', {
      question,
      use_cloud: useCloud,
      top_k: topK,
      model,
    });
    return response.data;
  },

  askQuestionStream(question: string, useCloud: boolean = false, topK: number = 3, model: string = "auto"): EventSource {
    return new EventSource(
      `${API_BASE_URL}/ask/stream?question=${encodeURIComponent(question)}&use_cloud=${useCloud}&top_k=${topK}&model=${encodeURIComponent(model)}`
    );
  },
};

export const chatHistoryService = {
  async createSession(data: any) {
    const response = await apiClient.post('/api/chat/sessions', data);
    return response.data;
  },

  async listSessions() {
    const response = await apiClient.get('/api/chat/sessions');
    return response.data;
  },

  async getSessionMessages(sessionId: string) {
    const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async deleteSession(sessionId: string) {
    const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
    return response.data;
  },
};
