import apiClient from "@/lib/api-client";
import type { AwardType } from "./award-type.service";

export interface AwardGallery {
  id: number;
  award_id: number;
  image_path: string;
  caption?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Award {
  id: number;
  award_type_id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  verified: boolean;
  is_active: boolean;
  thumbnail_image?: string;
  award_type?: AwardType;
  galleries?: AwardGallery[];
  created_at?: string;
  updated_at?: string;
}

export interface AwardListResponse {
  data: Award[];
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

export interface AwardQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  award_type_id?: number | string;
  is_active?: boolean | number | string;
  verified?: boolean | number | string;
}

export const awardService = {
  getAll: async (params?: AwardQueryParams): Promise<AwardListResponse> => {
    const response = await apiClient.get("/awards", { params });
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

  getById: async (id: number): Promise<Award> => {
    const response = await apiClient.get(`/awards/${id}`);
    return response.data.data;
  },

  create: async (data: FormData | Partial<Award>): Promise<Award> => {
    let payload = data;
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const response = await apiClient.post("/awards", payload, { headers });
    return response.data.data || response.data;
  },

  update: async (id: number, data: FormData | Partial<Award>): Promise<Award> => {
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }
      const response = await apiClient.post(`/awards/${id}`, data, { headers });
      return response.data.data || response.data;
    } else {
      const response = await apiClient.put(`/awards/${id}`, data);
      return response.data.data || response.data;
    }
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/awards/${id}`);
  },

  toggleStatus: async (id: number): Promise<Award> => {
    const response = await apiClient.patch(`/awards/${id}/toggle-status`);
    return response.data.data || response.data;
  },
};

export default awardService;
