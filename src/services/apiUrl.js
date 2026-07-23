const envUrl = import.meta.env.VITE_API_URL;

if (!envUrl) {
  console.warn(
    "[apiUrl] VITE_API_URL is not set. Falling back to http://localhost:5000.\n" +
    "For deployment, set VITE_API_URL to your backend URL (e.g., https://your-backend.onrender.com)."
  );
}

const normalizeUrl = (url) =>
  /^https?:\/\//i.test(url) ? url.replace(/\/$/, "") : `https://${url}`;

export const API_URL = normalizeUrl(
  envUrl || "http://localhost:5000"
);
