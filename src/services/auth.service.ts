import apiClient from "@/lib/api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post("/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/me");
    return response.data;
  },
};

export default authService;
