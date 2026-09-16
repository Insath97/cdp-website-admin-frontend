import apiClient from "@/lib/api-client";

export interface CareerApplication {
  id: number;
  application_code: string;
  career_id: number;
  fullname: string;
  email: string;
  phone_number: string;
  resume_path: string;
  cover_letter: string;
  status: "applied" | "reviewing" | "shortlisted" | "rejected" | "offered" | "hired";
  created_at: string;
  updated_at: string;
  career?: {
    id: number;
    title: string;
    slug: string;
    department: string;
    location: string;
    job_type: string;
  };
}

export interface CareerApplicationListResponse {
  data: CareerApplication[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CareerApplicationQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  career_id?: string;
}

export const careerApplicationService = {
  getAll: async (params?: CareerApplicationQueryParams): Promise<CareerApplicationListResponse> => {
    const response = await apiClient.get("/career-applications", { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<CareerApplication> => {
    const response = await apiClient.get(`/career-applications/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<CareerApplication> => {
    const response = await apiClient.patch(`/career-applications/${id}/status`, { status });
    return response.data.data;
  },
};

export default careerApplicationService;
