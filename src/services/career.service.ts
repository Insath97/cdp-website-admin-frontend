import apiClient from "@/lib/api-client";

export interface Career {
  id: number;
  title: string;
  slug: string;
  description: string;
  poster_image: string | null;
  department: string;
  location: string;
  job_type: string;
  due_date: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  responsibilities?: { id: number; name: string }[];
  requirements?: { id: number; name: string }[];
  benefits?: { id: number; name: string }[];
  applications_count?: number;
}

export interface CareerListResponse {
  data: Career[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CareerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string;
  department?: string;
  location?: string;
  job_type?: string;
}

export const careerService = {
  getAll: async (params?: CareerQueryParams): Promise<CareerListResponse> => {
    const response = await apiClient.get("/careers", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Career> => {
    const response = await apiClient.get(`/careers/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Career> => {
    const response = await apiClient.post("/careers", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<Career> => {
    const response = await apiClient.post(`/careers/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/careers/${id}`);
  },

  forceDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/careers/${id}/force-delete`);
  },

  restore: async (id: string): Promise<Career> => {
    const response = await apiClient.patch(`/careers/${id}/restore`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<Career> => {
    const response = await apiClient.patch(`/careers/${id}/toggle-status`);
    return response.data;
  },
};

export default careerService;
