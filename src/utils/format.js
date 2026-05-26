import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatTime = (date, format = 'HH:mm') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0分钟';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals);
};

export const formatWeight = (kg) => {
  if (!kg) return '';
  return `${kg} kg`;
};

export const formatHeight = (cm) => {
  if (!cm) return '';
  return `${cm} cm`;
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  const now = dayjs();
  const diff = now.diff(dayjs(date), 'day');
  
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff === -1) return '明天';
  if (diff < 7) return `${Math.abs(diff)}天前`;
  if (diff < 30) return `${Math.floor(Math.abs(diff) / 7)}周前`;
  return formatDate(date);
};
