import type { User } from "@/hooks/AuthContext";
import api from "@/lib/api";

type Credentials = Partial<User>;
const login = async (credentials: Credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const register = async (userData: Credentials) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export default {
  login,
  register,
};
