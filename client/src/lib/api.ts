import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_THESYS_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("currentUser");
  if (!user) return config;
  const parsedUser = JSON.parse(user);
  if (!parsedUser.id) return config;
  // Attach user ID to the request headers
  config.headers["X-User-ID"] = parsedUser.id;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
