import apiClient from "@/lib/api-client";

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchListResponse {
  data: Branch[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BranchQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  city?: string;
  is_active?: string | boolean | number;
}

export const branchService = {
  getAll: async (params?: BranchQueryParams): Promise<BranchListResponse> => {
    const response = await apiClient.get("/branches", { params });
    const payload = response.data;
    const resData = payload.data || payload;
    const items = Array.isArray(resData) ? resData : resData.data || [];
    return {
      data: items,
      meta: {
        current_page: resData.current_page || 1,
        last_page: resData.last_page || 1,
        per_page: resData.per_page || 15,
        total: resData.total || items.length,
      },
    };
  },

  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get(`/branches/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Branch>): Promise<Branch> => {
    const response = await apiClient.post("/branches", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Branch>): Promise<Branch> => {
    const response = await apiClient.patch(`/branches/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/branches/${id}`);
  },

  activate: async (id: number): Promise<Branch> => {
    const response = await apiClient.patch(`/branches/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: number): Promise<Branch> => {
    const response = await apiClient.patch(`/branches/${id}/deactivate`);
    return response.data;
  },

  getCities: async (): Promise<string[]> => {
    const response = await apiClient.get("/branches", {
      params: { per_page: 100 },
    });
    const branches = response.data?.data || [];
    const items = Array.isArray(branches) ? branches : branches.data || [];
    const cities = [...new Set(items.map((b: Branch) => b.city).filter(Boolean))];
    return cities as string[];
  },
};

export default branchService;
