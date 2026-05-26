import dayjs from 'dayjs';

export const validation = {
  isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  },

  isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  isPhone(value: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  },

  isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  isPositiveNumber(value: any): boolean {
    return this.isNumber(value) && parseFloat(value) > 0;
  },

  isDate(value: any): boolean {
    return dayjs(value).isValid();
  },

  minLength(value: any, min: number): boolean {
    return String(value).length >= min;
  },

  maxLength(value: any, max: number): boolean {
    return String(value).length <= max;
  },

  between(value: any, min: number, max: number): boolean {
    const num = parseFloat(value);
    return num >= min && num <= max;
  },

  validateSleepDuration(hours: number, minutes: number): boolean {
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes > 0 && totalMinutes <= 1440;
  },

  validateWeight(kg: number): boolean {
    return this.between(kg, 0.5, 50);
  },

  validateHeight(cm: number): boolean {
    return this.between(cm, 30, 200);
  },

  validateAge(months: number): boolean {
    return this.between(months, 0, 240);
  },

  validateBabyAge(birthDate: string | Date): boolean {
    if (!this.isDate(birthDate)) return false;
    const ageMonths = dayjs().diff(dayjs(birthDate), 'month');
    return ageMonths >= 0 && ageMonths <= 240;
  },

  validateLabValue(value: string | number, referenceRange: string): string | null {
    if (!referenceRange || !value) return null;

    const range = referenceRange.split('-');
    if (range.length !== 2) return null;

    const min = parseFloat(range[0]);
    const max = parseFloat(range[1]);

    if (isNaN(min) || isNaN(max)) return null;

    const val = parseFloat(value);
    if (isNaN(val)) return null;

    if (val < min) return 'low';
    if (val > max) return 'high';
    return 'normal';
  },
};
