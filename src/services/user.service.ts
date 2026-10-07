import apiClient from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  branch_id?: number;
  status?: "active" | "inactive";
  is_active?: boolean;
  profile_image?: string | null;
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

  activate: async (id: number): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data.data || response.data;
  },

  deactivate: async (id: number): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response.data.data || response.data;
  },

  updateProfileImage: async (id: number, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("profile_image", file);
    const response = await apiClient.patch(`/users/${id}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data;
  },

  removeProfileImage: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}/profile-image`);
  },
};

export default userService;
