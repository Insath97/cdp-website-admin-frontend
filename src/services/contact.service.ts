import apiClient from "@/lib/api-client";

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  contact_type_id?: number;
  contact_type?: {
    id: number;
    name: string;
  };
  is_active: boolean;
  is_replied: boolean;
  reply?: string;
  replied_at?: string;
  created_at: string;
}

export interface ContactListResponse {
  data: Contact[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ContactQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export const contactService = {
  getAll: async (params?: ContactQueryParams): Promise<ContactListResponse> => {
    const response = await apiClient.get("/contacts", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Contact> => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<void> => {
    const endpoint = isActive
      ? `/contacts/${id}/deactivate`
      : `/contacts/${id}/activate`;
    await apiClient.patch(endpoint);
  },

  sendReply: async (id: number, replyMessage: string): Promise<void> => {
    await apiClient.post(`/contacts/${id}/send-reply-email`, {
      reply_message: replyMessage,
    });
  },
};

export default contactService;
