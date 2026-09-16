import apiClient from "@/lib/api-client";

export interface ContactType {
  id: number;
  name: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface ContactTypeListResponse {
  data: ContactType[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ContactTypeQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export const contactTypeService = {
  getAll: async (params?: ContactTypeQueryParams): Promise<ContactTypeListResponse> => {
    const response = await apiClient.get("/contact-types", { params });
    return response.data;
  },

  getById: async (id: number): Promise<ContactType> => {
    const response = await apiClient.get(`/contact-types/${id}`);
    return response.data;
  },

  create: async (data: Partial<ContactType>): Promise<ContactType> => {
    const response = await apiClient.post("/contact-types", data);
    return response.data;
  },

  update: async (id: number, data: Partial<ContactType>): Promise<ContactType> => {
    const response = await apiClient.put(`/contact-types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/contact-types/${id}`);
  },

  toggleStatus: async (id: number, status: "active" | "inactive"): Promise<ContactType> => {
    const endpoint = status === "active"
      ? `/contact-types/${id}/activate`
      : `/contact-types/${id}/deactivate`;
    const response = await apiClient.patch(endpoint);
    return response.data;
  },
};

export default contactTypeService;
