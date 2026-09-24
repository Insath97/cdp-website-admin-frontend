import apiClient from "@/lib/api-client";
import type { SystemSettings } from "@/types";

export type { SystemSettings };

export const systemSettingService = {
  getAll: async (): Promise<SystemSettings> => {
    const response = await apiClient.get("/settings");
    return response.data?.data || {};
  },

  update: async (data: Partial<SystemSettings> | FormData): Promise<SystemSettings> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post("/settings", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data?.data || {};
  },
};

export default systemSettingService;
