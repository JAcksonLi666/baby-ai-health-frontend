export const helpers = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  sumBy(array, key) {
    return array.reduce((sum, item) => sum + (item[key] || 0), 0);
  },

  avgBy(array, key) {
    if (array.length === 0) return 0;
    return this.sumBy(array, key) / array.length;
  },

  getUnique(array, key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getStatusColor(status) {
    const colors = {
      normal: '#52c41a',
      low: '#faad14',
      high: '#f5222d',
      critical: '#ff0000',
      pending: '#1890ff',
      completed: '#52c41a',
      active: '#1890ff',
      inactive: '#d9d9d9',
    };
    return colors[status] || '#d9d9d9';
  },

  getStatusText(status) {
    const texts = {
      normal: '正常',
      low: '偏低',
      high: '偏高',
      critical: '危急',
      pending: '待处理',
      completed: '已完成',
      active: '进行中',
      inactive: '已停用',
    };
    return texts[status] || status;
  },

  getCryReasonIcon(reason) {
    const icons = {
      hungry: 'CoffeeOutlined',
      sleepy: 'MoonOutlined',
      diaper: 'FilterOutlined',
      uncomfortable: 'AlertOutlined',
      colic: 'FrownOutlined',
      attention: 'HeartOutlined',
    };
    return icons[reason] || 'HelpCircleOutlined';
  },
};
