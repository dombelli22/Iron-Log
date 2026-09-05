// localStorage-backed stand-in for the Claude Artifact storage API this
// component was originally written against (window.storage.get/set).
export const storage = {
  async get(key) {
    try {
      const v = localStorage.getItem("ironlog:" + key);
      return v != null ? { key, value: v } : null;
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem("ironlog:" + key, value);
      return { key, value };
    } catch (e) {
      return null;
    }
  },
};
