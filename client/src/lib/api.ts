import type { User } from "@/hooks/AuthContext";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_DB_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("currentUser");
    if (!user) return config;
    const parsedUser: User = JSON.parse(user);
    if (!parsedUser.user_id) return config;
    // Attach user ID to the request headers
    config.headers["X-User-ID"] = parsedUser.user_id.toString();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("API said 401, redirecting to login...")
      // window.location.href = "/login";
    }
    return Promise.reject(
      new Error(error.response?.data?.error || error.message)
    );
  }
);

export default api;
