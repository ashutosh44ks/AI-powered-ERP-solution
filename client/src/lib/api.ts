import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_THESYS_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
