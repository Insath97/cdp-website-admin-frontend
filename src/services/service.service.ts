import apiClient from "@/lib/api-client";

export interface Service {
  id: number;
  imagepath?: string;
  title: string;
  slug?: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceListResponse {
  data: Service[];
  meta?: {
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
  is_active?: string | boolean | number;
}

export const serviceService = {
  getAll: async (params?: ServiceQueryParams): Promise<ServiceListResponse> => {
    const response = await apiClient.get("/services", { params });
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

  getById: async (id: number): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data.data;
  },

  create: async (data: FormData | Partial<Service>): Promise<Service> => {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.post("/services", data, { headers });
    return response.data;
  },

  update: async (id: number, data: FormData | Partial<Service>): Promise<Service> => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const response = await apiClient.post(`/services/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  toggleStatus: async (id: number): Promise<Service> => {
    const response = await apiClient.patch(`/services/${id}/toggle-status`);
    return response.data;
  },
};

export default serviceService;
