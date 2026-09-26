/**
 * Storage Utility — Safe LocalStorage access with memory fallback (R-JS-05)
 */

const memoryStore = {};

export const storage = {
  get(key, fallback = null) {
    try {
      const val = window.localStorage.getItem(key);
      if (val === null) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    } catch {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
    }
  },

  set(key, value) {
    try {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, str);
    } catch {
      memoryStore[key] = value;
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  }
};
