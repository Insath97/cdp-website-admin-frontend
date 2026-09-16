import apiClient from "@/lib/api-client";

export interface Service {
  id: number;
  name: string;
  description?: string;
  category?: string;
  status?: "active" | "inactive";
}

export interface ServiceListResponse {
  data: Service[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ServiceQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export const serviceService = {
  getAll: async (params?: ServiceQueryParams): Promise<ServiceListResponse> => {
    const response = await apiClient.get("/services", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.post("/services", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.patch(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  toggleStatus: async (id: number, status: "active" | "inactive"): Promise<Service> => {
    const endpoint = status === "active"
      ? `/services/${id}/activate`
      : `/services/${id}/deactivate`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },
};

export default serviceService;
