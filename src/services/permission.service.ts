import apiClient from "@/lib/api-client";

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface PermissionListResponse {
  data: Permission[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PermissionQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const permissionService = {
  getAll: async (params?: PermissionQueryParams): Promise<PermissionListResponse> => {
    const response = await apiClient.get("/permissions", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data;
  },

  create: async (data: Partial<Permission>): Promise<Permission> => {
    const response = await apiClient.post("/permissions", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Permission>): Promise<Permission> => {
    const response = await apiClient.patch(`/permissions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/permissions/${id}`);
  },
};

export default permissionService;
