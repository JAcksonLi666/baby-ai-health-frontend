import apiClient from './apiClient';

export const recordService = {
  async getRecords(limit: number = 50) {
    const response = await apiClient.get('/records', { params: { limit } });
    return response.data;
  },

  async getRecord(recordId: string) {
    const response = await apiClient.get(`/record/${recordId}`);
    return response.data;
  },

  async deleteRecord(recordId: string) {
    const response = await apiClient.delete(`/record/${recordId}`);
    return response.data;
  },

  async updateRecord(recordId: string, recordDate: string, recordType: string) {
    const response = await apiClient.put(`/record/${recordId}`, null, {
      params: { record_date: recordDate, record_type: recordType },
    });
    return response.data;
  },

  async filterRecords(filters: any) {
    const response = await apiClient.get('/records/filter', { params: filters });
    return response.data;
  },

  async getRecordTypes() {
    const response = await apiClient.get('/records/types');
    return response.data;
  },
};

export const uploadService = {
  async previewFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadFile(file: File, recordDate?: string, recordType?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (recordDate) formData.append('record_date', recordDate);
    if (recordType) formData.append('record_type', recordType);
    const response = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
