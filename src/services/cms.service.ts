import apiClient from "@/lib/api-client";

export type CmsContentType =
  | "text"
  | "textarea"
  | "image"
  | "video"
  | "pdf"
  | "svg"
  | "file"
  | "link"
  | "icon";

export interface CmsContentItem {
  id?: number;
  page: string;
  section: string;
  key: string;
  value: string | null;
  type: CmsContentType;
  label?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export type GroupedCmsData = Record<string, Record<string, CmsContentItem[]>>;

export const cmsService = {
  getAll: async (page?: string): Promise<GroupedCmsData> => {
    const params = page ? { page } : {};
    const response = await apiClient.get("/cms", { params });
    return response.data.data || {};
  },

  updateBulk: async (
    items: {
      page: string;
      section: string;
      key: string;
      value: any;
      type: CmsContentType;
      label?: string | null;
      metadata?: Record<string, any> | null;
    }[],
    files?: Record<number, File>
  ): Promise<any> => {
    // If files are attached, send as multipart FormData
    if (files && Object.keys(files).length > 0) {
      const formData = new FormData();
      items.forEach((item, index) => {
        formData.append(`contents[${index}][page]`, item.page);
        formData.append(`contents[${index}][section]`, item.section);
        formData.append(`contents[${index}][key]`, item.key);
        formData.append(`contents[${index}][type]`, item.type);
        if (item.label) {
          formData.append(`contents[${index}][label]`, item.label);
        }
        if (item.metadata) {
          formData.append(`contents[${index}][metadata]`, JSON.stringify(item.metadata));
        }

        if (files[index]) {
          formData.append(`contents[${index}][value]`, files[index]);
        } else {
          formData.append(`contents[${index}][value]`, item.value ?? "");
        }
      });

      const response = await apiClient.post("/cms/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    const response = await apiClient.post("/cms/update", {
      contents: items,
    });
    return response.data;
  },
};

export default cmsService;
