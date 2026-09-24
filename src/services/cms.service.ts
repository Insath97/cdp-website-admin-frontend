import apiClient from "@/lib/api-client";
import type { CmsPageContent, CmsUpdateItem } from "@/types";

export type { CmsContent, CmsPageContent, CmsUpdateItem } from "@/types";

export const cmsService = {
  getPageContent: async (page: string): Promise<CmsPageContent> => {
    const response = await apiClient.get("/cms", { params: { page } });
    return response.data?.data?.[page] || {};
  },

  getAllContent: async (): Promise<Record<string, CmsPageContent>> => {
    const response = await apiClient.get("/cms");
    return response.data?.data || {};
  },

  updateContent: async (contents: CmsUpdateItem[]): Promise<void> => {
    await apiClient.post("/cms/update", { contents });
  },
};

export default cmsService;
