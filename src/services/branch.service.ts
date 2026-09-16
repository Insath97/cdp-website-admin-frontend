import apiClient from "@/lib/api-client";

export interface Branch {
  id: number;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  status?: "active" | "inactive";
}

export interface BranchListResponse {
  data: Branch[];
  meta: {
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
  status?: string;
}

export const branchService = {
  getAll: async (params?: BranchQueryParams): Promise<BranchListResponse> => {
    const response = await apiClient.get("/branches", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get(`/branches/${id}`);
    return response.data;
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

  getCities: async (): Promise<string[]> => {
    const response = await apiClient.get("/branches", {
      params: { per_page: 100 },
    });
    const branches = response.data?.data || [];
    const cities = [...new Set(branches.map((b: Branch) => b.city).filter(Boolean))];
    return cities as string[];
  },
};

export default branchService;
