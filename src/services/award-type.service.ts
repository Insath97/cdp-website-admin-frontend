import apiClient from "@/lib/api-client";

export interface AwardType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AwardTypeListResponse {
  data: AwardType[];
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

export interface AwardTypeQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string | boolean | number;
}

export const awardTypeService = {
  getList: async (): Promise<AwardType[]> => {
    const response = await apiClient.get("/award-types/list");
    return response.data.data || [];
  },

  getAll: async (params?: AwardTypeQueryParams): Promise<AwardTypeListResponse> => {
    const response = await apiClient.get("/award-types", { params });
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

  getById: async (id: number): Promise<AwardType> => {
    const response = await apiClient.get(`/award-types/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<AwardType>): Promise<AwardType> => {
    const response = await apiClient.post("/award-types", data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<AwardType>): Promise<AwardType> => {
    const response = await apiClient.put(`/award-types/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/award-types/${id}`);
  },

  toggleStatus: async (id: number): Promise<AwardType> => {
    const response = await apiClient.patch(`/award-types/${id}/toggle-status`);
    return response.data.data || response.data;
  },
};

export default awardTypeService;
