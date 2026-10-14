import apiClient from "@/lib/api-client";

export interface Testimonial {
  id: number;
  name: string;
  city: string;
  designation?: string | null;
  body: string;
  rating: number;
  is_active: boolean;
  thumbnail_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialListResponse {
  data: Testimonial[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TestimonialQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  rating?: number | string;
  is_active?: boolean | number | string;
}

export const testimonialService = {
  getAll: async (params?: TestimonialQueryParams): Promise<TestimonialListResponse> => {
    const response = await apiClient.get("/testimonials", { params });
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

  getById: async (id: number): Promise<Testimonial> => {
    const response = await apiClient.get(`/testimonials/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: FormData | Partial<Testimonial>): Promise<Testimonial> => {
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.post("/testimonials", data, { headers });
    return response.data.data || response.data;
  },

  update: async (id: number, data: FormData | Partial<Testimonial>): Promise<Testimonial> => {
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      const response = await apiClient.post(`/testimonials/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data || response.data;
    }
    const response = await apiClient.put(`/testimonials/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/testimonials/${id}`);
  },

  toggleStatus: async (id: number): Promise<Testimonial> => {
    const response = await apiClient.patch(`/testimonials/${id}/toggle-status`);
    return response.data.data || response.data;
  },
};

export default testimonialService;
