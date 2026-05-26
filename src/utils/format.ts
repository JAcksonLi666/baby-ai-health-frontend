import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const formatDate = (date: string | Date | dayjs.Dayjs | null | undefined, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | dayjs.Dayjs | null | undefined, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date | dayjs.Dayjs | null | undefined, format: string = 'HH:mm'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes < 0) return '0分钟';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const formatNumber = (num: number | string | null | undefined, decimals: number = 2): string => {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals);
};

export const formatWeight = (kg: number | string | null | undefined): string => {
  if (!kg) return '';
  return `${kg} kg`;
};

export const formatHeight = (cm: number | string | null | undefined): string => {
  if (!cm) return '';
  return `${cm} cm`;
};

export const getRelativeTime = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
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
