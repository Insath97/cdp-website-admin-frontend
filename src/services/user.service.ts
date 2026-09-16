import apiClient from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  branch_id?: number;
  status?: "active" | "inactive";
  created_at?: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const userService = {
  getAll: async (params?: UserQueryParams): Promise<UserListResponse> => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

export default userService;
