import apiClient from "@/lib/api-client";

export interface EventGallery {
  id: number;
  event_id: number;
  image_path: string;
}

export interface EventUrl {
  id: number;
  event_id: number;
  url: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  created_date: string;
  created_by: number;
  thumbnail_image: string | null;
  description: string;
  is_active: boolean;
  status: "draft" | "pending" | "approved" | "rejected";
  decision_by: number | null;
  decision_at: string | null;
  rejected_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  galleries?: EventGallery[];
  urls?: EventUrl[];
  tags?: Tag[];
  created_by_user?: { id: number; name: string };
  decision_by_user?: { id: number; name: string };
}

export interface EventListResponse {
  data: Event[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface EventQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string;
  status?: string;
}

export const eventService = {
  getAll: async (params?: EventQueryParams): Promise<EventListResponse> => {
    const response = await apiClient.get("/events", { params });
    return response.data.data;
  },

  getById: async (id: string | number): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  create: async (data: FormData): Promise<Event> => {
    const response = await apiClient.post("/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  update: async (id: string | number, data: FormData): Promise<Event> => {
    const response = await apiClient.post(`/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  forceDelete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/events/${id}/force-delete`);
  },

  restore: async (id: string | number): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}/restore`);
    return response.data.data;
  },

  toggleStatus: async (id: string | number): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}/toggle-status`);
    return response.data.data;
  },

  submitForReview: async (id: string | number): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}/submit-for-review`);
    return response.data.data;
  },

  approve: async (id: string | number): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: string | number, rejectedReason: string): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}/reject`, {
      rejected_reason: rejectedReason,
    });
    return response.data.data;
  },

  getAvailableTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get("/events/tags/list");
    return response.data.data;
  },
};

export default eventService;
