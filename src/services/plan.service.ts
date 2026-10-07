import apiClient from "@/lib/api-client";

export interface PlanFeature {
  id?: number;
  plan_id?: number;
  feature: string;
  created_at?: string;
  updated_at?: string;
}

export interface Plan {
  id: number;
  image?: string;
  maintitle: string;
  subtitle: string;
  short_description: string;
  is_active: boolean;
  features?: PlanFeature[];
  created_at?: string;
  updated_at?: string;
}

export interface PlanListResponse {
  data: Plan[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PlanQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string | boolean | number;
}

export const planService = {
  getAll: async (params?: PlanQueryParams): Promise<PlanListResponse> => {
    const response = await apiClient.get("/plans", { params });
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

  getById: async (id: number): Promise<Plan> => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data.data;
  },

  create: async (data: FormData | Partial<Plan>): Promise<Plan> => {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.post("/plans", data, { headers });
    return response.data;
  },

  update: async (id: number, data: FormData | Partial<Plan>): Promise<Plan> => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const response = await apiClient.post(`/plans/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await apiClient.put(`/plans/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },

  toggleStatus: async (id: number, currentStatus: boolean): Promise<Plan> => {
    const endpoint = currentStatus ? `/plans/${id}/deactivate` : `/plans/${id}/activate`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },
};

export default planService;
