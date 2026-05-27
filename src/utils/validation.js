import dayjs from 'dayjs';

export const validation = {
  isEmpty(value) {
    return value === null || value === undefined || value === '';
  },

  isEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  isPhone(value) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  },

  isUrl(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  isPositiveNumber(value) {
    return this.isNumber(value) && parseFloat(value) > 0;
  },

  isDate(value) {
    return dayjs(value).isValid();
  },

  minLength(value, min) {
    return String(value).length >= min;
  },

  maxLength(value, max) {
    return String(value).length <= max;
  },

  between(value, min, max) {
    const num = parseFloat(value);
    return num >= min && num <= max;
  },

  validateSleepDuration(hours, minutes) {
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes > 0 && totalMinutes <= 1440;
  },

  validateWeight(kg) {
    return this.between(kg, 0.5, 50);
  },

  validateHeight(cm) {
    return this.between(cm, 30, 200);
  },

  validateAge(months) {
    return this.between(months, 0, 240);
  },

  validateBabyAge(birthDate) {
    if (!this.isDate(birthDate)) return false;
    const ageMonths = dayjs().diff(dayjs(birthDate), 'month');
    return ageMonths >= 0 && ageMonths <= 240;
  },

  validateLabValue(value, referenceRange) {
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
