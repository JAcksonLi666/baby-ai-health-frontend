export const storage = {
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to set localStorage:', error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to get localStorage:', error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove localStorage:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },

  getLanguage() {
    return this.getItem('app_language', 'zh');
  },

  setLanguage(language) {
    return this.setItem('app_language', language);
  },

  getTheme() {
    return this.getItem('app_theme', 'light');
  },

  setTheme(theme) {
    return this.setItem('app_theme', theme);
  },
};

export const sessionStorage = {
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to set sessionStorage:', error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to get sessionStorage:', error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove sessionStorage:', error);
      return false;
    }
  },
};
