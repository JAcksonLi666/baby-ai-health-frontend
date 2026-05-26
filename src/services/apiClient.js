import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.response?.data?.message || '';

    if (status === 401) {
      console.error('认证失败: 未授权访问');
    } else if (status === 403) {
      console.error('权限不足: 禁止访问该资源');
    } else if (status === 404) {
      console.error('资源未找到:', detail || error.config?.url);
    } else if (status === 422) {
      console.error('请求参数校验失败:', detail);
    } else if (status === 429) {
      console.error('请求过于频繁，请稍后再试');
    } else if (status && status >= 500) {
      console.error('服务器错误 (HTTP ' + status + '):', detail || '请稍后重试');
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请检查网络连接');
    } else if (!error.response) {
      console.error('网络错误: 无法连接到服务器，请检查后端服务是否运行');
    }

    return Promise.reject(error.response?.data || error);
  }
);

export { API_BASE_URL };
export default apiClient;
