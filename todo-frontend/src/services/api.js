import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

export default api;
