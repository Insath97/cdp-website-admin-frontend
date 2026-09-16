import apiClient from "@/lib/api-client";

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface RoleListResponse {
  data: Role[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface RoleQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const roleService = {
  getAll: async (params?: RoleQueryParams): Promise<RoleListResponse> => {
    const response = await apiClient.get("/roles", { params });
    return response.data;
  },

  getList: async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiClient.get("/roles/list");
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  create: async (data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post("/roles", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.patch(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

export default roleService;
