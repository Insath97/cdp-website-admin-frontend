import apiClient from "@/lib/api-client";
import type { FaqType } from "./faq-type.service";

export interface Faq {
  id: number;
  faq_type_id: number;
  question: string;
  answers: string;
  is_active: boolean;
  faq_type?: FaqType;
  faqType?: FaqType;
  created_at?: string;
  updated_at?: string;
}

export interface FaqListResponse {
  data: Faq[];
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

export interface FaqQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string | boolean | number;
  faq_type_id?: number | string;
}

export const faqService = {
  getAll: async (params?: FaqQueryParams): Promise<FaqListResponse> => {
    const response = await apiClient.get("/faqs", { params });
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

  getById: async (id: number): Promise<Faq> => {
    const response = await apiClient.get(`/faqs/${id}`);
    return response.data.data;
  },

  create: async (data: { faq_type_id: number; question: string; answers: string; is_active?: boolean }): Promise<Faq> => {
    const response = await apiClient.post("/faqs", data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: { faq_type_id?: number; question?: string; answers?: string; is_active?: boolean }): Promise<Faq> => {
    const response = await apiClient.put(`/faqs/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/faqs/${id}`);
  },

  toggleStatus: async (id: number): Promise<Faq> => {
    const response = await apiClient.patch(`/faqs/${id}/toggle-status`);
    return response.data.data || response.data;
  },
};

export default faqService;
