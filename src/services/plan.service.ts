import apiClient from "@/lib/api-client";

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  status?: "active" | "inactive";
}

export interface PlanListResponse {
  data: Plan[];
  meta: {
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
  status?: string;
}

export const planService = {
  getAll: async (params?: PlanQueryParams): Promise<PlanListResponse> => {
    const response = await apiClient.get("/plans", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Plan> => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  create: async (data: Partial<Plan>): Promise<Plan> => {
    const response = await apiClient.post("/plans", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Plan>): Promise<Plan> => {
    const response = await apiClient.patch(`/plans/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },

  toggleStatus: async (id: number, status: "active" | "inactive"): Promise<Plan> => {
    const endpoint = status === "active"
      ? `/plans/${id}/activate`
      : `/plans/${id}/deactivate`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },
};

export default planService;
