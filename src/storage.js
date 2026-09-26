// Minimal localStorage-backed stand-in for the Claude Artifact storage API.
// `setWriteListener` lets the cloud-sync layer hear about every successful write.
let writeListener = null;
export const setWriteListener = (fn) => { writeListener = fn; };

export const storage = {
  async get(key) { try { const v = localStorage.getItem("ironlog:" + key); return v != null ? { key, value: v } : null; } catch (e) { return null; } },
  async set(key, value) {
    try {
      localStorage.setItem("ironlog:" + key, value);
      if (writeListener) { try { writeListener(key); } catch (e) { /* sync must never break saving */ } }
      return { key, value };
    } catch (e) { return null; }
  },
};
