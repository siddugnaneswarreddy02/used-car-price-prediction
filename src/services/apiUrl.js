const envUrl = import.meta.env.VITE_API_URL;

if (!envUrl) {
  console.warn(
    "[apiUrl] VITE_API_URL is not set. Falling back to http://localhost:5000.\n" +
    "For deployment, set VITE_API_URL to your backend URL (e.g., https://your-backend.onrender.com)."
  );
}

const normalizeUrl = (url) => {
  // Ensure the URL has a protocol
  let normalized = /^https?:\/\//i.test(url)
    ? url.replace(/\/$/, "")
    : `https://${url}`;

  // Fix Render URLs that are missing .onrender.com (e.g. "https://used-car-backend-yctk")
  try {
    const u = new URL(normalized);
    const hostname = u.hostname;
    // If hostname has no dots (not localhost, not a full domain), it's likely a Render subdomain
    if (
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      !hostname.includes(".") &&
      !hostname.endsWith(".onrender.com")
    ) {
      normalized = `${normalized}.onrender.com`;
      console.log("[apiUrl] Fixed Render URL:", normalized);
    }
  } catch (e) {
    // ignore invalid URLs
  }

  return normalized;
};

export const API_URL = normalizeUrl(
  envUrl || "http://localhost:5000"
);

