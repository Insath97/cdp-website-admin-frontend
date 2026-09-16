import apiClient from "@/lib/api-client";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  status: "draft" | "published" | "archived";
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  data: Blog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BlogQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category?: string;
}

export const blogService = {
  getAll: async (params?: BlogQueryParams): Promise<BlogListResponse> => {
    const response = await apiClient.get("/blogs", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Blog> => {
    const response = await apiClient.get(`/blogs/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Blog>): Promise<Blog> => {
    const response = await apiClient.post("/blogs", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Blog>): Promise<Blog> => {
    const response = await apiClient.put(`/blogs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/blogs/${id}`);
  },

  toggleStatus: async (id: number, status: string): Promise<Blog> => {
    const response = await apiClient.patch(`/blogs/${id}/status`, { status });
    return response.data;
  },
};

export default blogService;
