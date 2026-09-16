import apiClient from "@/lib/api-client";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  model_type?: string;
  model_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ActivityLogQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  model_type?: string;
  user_id?: number;
}

export const activityLogService = {
  getAll: async (params?: ActivityLogQueryParams): Promise<ActivityLogListResponse> => {
    const response = await apiClient.get("/activity-logs", { params });
    return response.data;
  },

  getById: async (id: number): Promise<ActivityLog> => {
    const response = await apiClient.get(`/activity-logs/${id}`);
    return response.data;
  },
};

export default activityLogService;
