export const helpers = {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  debounce(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
    let timeout: ReturnType<typeof setTimeout> | null;
    return function executedFunction(...args: any[]): void {
      const later = () => {
        if (timeout) clearTimeout(timeout);
        func(...args);
      };
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func: (...args: any[]) => void, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]): void {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result: Record<string, T[]>, item: T) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  sortBy<T extends Record<string, any>>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  sumBy<T extends Record<string, any>>(array: T[], key: keyof T): number {
    return array.reduce((sum: number, item: T) => sum + (Number(item[key]) || 0), 0);
  },

  avgBy<T extends Record<string, any>>(array: T[], key: keyof T): number {
    if (array.length === 0) return 0;
    return this.sumBy(array, key) / array.length;
  },

  getUnique<T extends Record<string, any>>(array: T[], key: keyof T): T[] {
    const seen = new Set<any>();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
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

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
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

  getCryReasonIcon(reason: string): string {
    const icons: Record<string, string> = {
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
