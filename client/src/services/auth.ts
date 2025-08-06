import api from "@/lib/api";

interface Credentials {
  email: string;
  name?: string;
  // We don't have passwords for now
  password?: string;
}
const login = async (credentials: Credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const register = async (userData: Credentials) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export { login, register };
