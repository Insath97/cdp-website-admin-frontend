import apiClient from "@/lib/api-client";

export interface FaqType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  faqs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FaqTypeListResponse {
  data: FaqType[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface FaqTypeQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string | boolean | number;
}

export const faqTypeService = {
  getAll: async (params?: FaqTypeQueryParams): Promise<FaqTypeListResponse> => {
    const response = await apiClient.get("/faq-types", { params });
    const payload = response.data;
    const paginated = payload.data || payload;
    const items = Array.isArray(paginated) ? paginated : paginated.data || [];
    return {
      data: items,
      meta: {
        current_page: paginated.current_page || 1,
        last_page: paginated.last_page || 1,
        per_page: paginated.per_page || 15,
        total: paginated.total || items.length,
      },
      current_page: paginated.current_page || 1,
      last_page: paginated.last_page || 1,
      per_page: paginated.per_page || 15,
      total: paginated.total || items.length,
    };
  },

  getById: async (id: number): Promise<FaqType> => {
    const response = await apiClient.get(`/faq-types/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<FaqType>): Promise<FaqType> => {
    const response = await apiClient.post("/faq-types", data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<FaqType>): Promise<FaqType> => {
    const response = await apiClient.put(`/faq-types/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/faq-types/${id}`);
  },

  toggleStatus: async (id: number): Promise<FaqType> => {
    const response = await apiClient.patch(`/faq-types/${id}/toggle-status`);
    return response.data.data || response.data;
  },
};

export default faqTypeService;
