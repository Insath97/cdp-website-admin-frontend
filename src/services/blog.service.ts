import apiClient from "@/lib/api-client";

export interface EventGallery {
  id: number;
  event_id: number;
  image_path: string;
  caption?: string;
  display_order?: number;
}

export interface EventTag {
  id: number;
  name: string;
  slug: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  status: "pending" | "approved" | "rejected" | "draft" | "published" | "archived";
  created_date?: string;
  thumbnail_image?: string;
  featured_image?: string;
  url?: string;
  description?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  is_active?: boolean;
  galleries?: EventGallery[];
  tags?: EventTag[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  rejected_reason?: string;
}

export interface BlogListResponse {
  data: Blog[];
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

export interface BlogQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  is_active?: boolean | number | string;
}

export const blogService = {
  getAll: async (params?: BlogQueryParams): Promise<BlogListResponse> => {
    const response = await apiClient.get("/events", { params });
    const payload = response.data;
    // Normalize paginated structure
    const paginated = payload.data || payload;
    const items = (Array.isArray(paginated) ? paginated : paginated.data || []).map((e: any) => ({
      ...e,
      content: e.description || "",
      excerpt: e.description ? e.description.substring(0, 160) : "",
      featured_image: e.thumbnail_image,
      category: e.tags && e.tags.length > 0 ? e.tags[0].name : "General",
      status: e.status === "approved" ? "published" : e.status === "rejected" ? "archived" : "draft",
    }));

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

  getById: async (id: number): Promise<Blog> => {
    const response = await apiClient.get(`/events/${id}`);
    const e = response.data.data;
    return {
      ...e,
      content: e.description || "",
      excerpt: e.description ? e.description.substring(0, 160) : "",
      featured_image: e.thumbnail_image,
      category: e.tags && e.tags.length > 0 ? e.tags[0].name : "General",
      status: e.status === "approved" ? "published" : e.status === "rejected" ? "archived" : "draft",
    };
  },

  create: async (data: FormData | Partial<Blog>): Promise<Blog> => {
    let payload = data;
    let headers: Record<string, string> = {};

    if (!(data instanceof FormData)) {
      const fd = new FormData();
      fd.append("title", data.title || "");
      fd.append("status", data.status === "published" ? "approved" : "pending");
      fd.append("created_date", data.created_date || new Date().toISOString().split("T")[0]);
      fd.append("description", (data.content || data.description || "") as string);
      if (data.category) {
        fd.append("tags", data.category);
      }
      payload = fd;
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await apiClient.post("/events", payload, { headers });
    return response.data;
  },

  update: async (id: number, data: FormData | Partial<Blog>): Promise<Blog> => {
    let payload = data;
    let headers: Record<string, string> = {};

    if (data instanceof FormData) {
      // In Laravel, PUT requests with files work via POST with _method=PUT
      data.append("_method", "PUT");
      headers["Content-Type"] = "multipart/form-data";
      const response = await apiClient.post(`/events/${id}`, data, { headers });
      return response.data;
    } else {
      const cleanData: Record<string, any> = {
        title: data.title,
        description: data.content || data.description,
        status: data.status === "published" ? "approved" : data.status === "archived" ? "rejected" : "pending",
        created_date: data.created_date || new Date().toISOString().split("T")[0],
      };
      if (data.category) {
        cleanData.tags = data.category;
      }
      const response = await apiClient.put(`/events/${id}`, cleanData);
      return response.data;
    }
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  toggleStatus: async (id: number): Promise<Blog> => {
    const response = await apiClient.patch(`/events/${id}/toggle-status`);
    return response.data;
  },

  approve: async (id: number): Promise<Blog> => {
    const response = await apiClient.patch(`/events/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<Blog> => {
    const response = await apiClient.patch(`/events/${id}/reject`, { rejected_reason: reason });
    return response.data;
  },

  getTags: async (): Promise<EventTag[]> => {
    const response = await apiClient.get("/events/tags/list");
    return response.data.data || [];
  },

  submitForReview: async (id: number): Promise<Blog> => {
    const response = await apiClient.patch(`/events/${id}/submit-for-review`);
    return response.data;
  },

  restore: async (id: number): Promise<Blog> => {
    const response = await apiClient.patch(`/events/${id}/restore`);
    return response.data;
  },

  forceDelete: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}/force-delete`);
  },
};

export default blogService;
