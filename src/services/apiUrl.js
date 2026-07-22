const normalizeUrl = (url) =>
  /^https?:\/\//i.test(url) ? url.replace(/\/$/, "") : `https://${url}`;

export const API_URL = normalizeUrl(
  import.meta.env.VITE_API_URL || "http://localhost:5000"
);
