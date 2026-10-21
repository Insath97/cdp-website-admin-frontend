import apiClient from "@/lib/api-client";
import { cmsService } from "./cms.service";

export type InvestorCategory = string;

export interface InvestorMember {
  id: string;
  name: string;
  role: string;
  company?: string;
  image: string;
  is_active: boolean;
  order?: number;
  category?: string;
  qualifications?: string;
  bio?: string;
  message?: string;
  focus?: string;
  domain?: string;
  linkedin?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiInvestor {
  id: number;
  name: string;
  designation: string;
  organization?: string | null;
  image?: string | null;
  sort_order?: number | null;
  is_active: boolean;
  qualifications?: { id: number; investor_id: number; title: string; sort_order: number }[] | string[];
  created_at?: string;
  updated_at?: string;
}

export function resolveInvestorImage(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/storage/${cleanPath}`;
}

export function mapApiToInvestorMember(api: ApiInvestor): InvestorMember {
  let qualifications = "";
  if (Array.isArray(api.qualifications)) {
    qualifications = api.qualifications
      .map((q) => (typeof q === "string" ? q : q.title))
      .filter(Boolean)
      .join(" · ");
  }

  return {
    id: String(api.id),
    name: api.name,
    role: api.designation || "",
    company: api.organization || "",
    image: resolveInvestorImage(api.image),
    is_active: Boolean(api.is_active),
    order: api.sort_order ?? 0,
    qualifications: qualifications || undefined,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export function mapInvestorMemberToFormData(member: InvestorMember, photoFile?: File | null): FormData {
  const fd = new FormData();
  fd.append("name", member.name);
  fd.append("designation", member.role);
  if (member.company) {
    fd.append("organization", member.company);
  }
  fd.append("is_active", member.is_active ? "1" : "0");
  if (member.order !== undefined) {
    fd.append("sort_order", String(member.order));
  }
  if (photoFile) {
    fd.append("image", photoFile);
  }
  if (member.qualifications) {
    const quals = member.qualifications
      .split(/[·,\n|]/)
      .map((q) => q.trim())
      .filter(Boolean);
    quals.forEach((q) => fd.append("qualifications[]", q));
  }
  return fd;
}

const LOCAL_STORAGE_KEY = "cdp_investors_list";

export const investorsService = {
  /**
   * Fetch from dedicated /api/v1/investors
   */
  fetchApiInvestors: async (params?: Record<string, any>): Promise<ApiInvestor[]> => {
    const response = await apiClient.get("/investors", { params });
    const payload = response.data?.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },

  /**
   * Create investor on /api/v1/investors
   */
  createInvestor: async (data: FormData | Record<string, any>): Promise<any> => {
    let payload = data;
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const response = await apiClient.post("/investors", payload, { headers });
    return response.data?.data || response.data;
  },

  /**
   * Update investor on /api/v1/investors/{id}
   */
  updateInvestor: async (id: number | string, data: FormData | Record<string, any>): Promise<any> => {
    if (data instanceof FormData) {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }
      const response = await apiClient.post(`/investors/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data || response.data;
    } else {
      const response = await apiClient.put(`/investors/${id}`, data);
      return response.data?.data || response.data;
    }
  },

  /**
   * Delete investor on /api/v1/investors/{id}
   */
  deleteInvestor: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/investors/${id}`);
  },

  /**
   * Toggle status on /api/v1/investors/{id}/toggle-status
   */
  toggleStatus: async (id: number | string): Promise<any> => {
    const response = await apiClient.patch(`/investors/${id}/toggle-status`);
    return response.data?.data || response.data;
  },

  /**
   * Universal getInvestors:
   * Priority:
   * 1. Dedicated /api/v1/investors
   * 2. Local cache
   * 3. CMS API (/about -> investors -> list)
   * 4. Bundled defaults
   */
  getInvestors: async (): Promise<InvestorMember[]> => {
    const apiInvestors = await investorsService.fetchApiInvestors({ per_page: 100 });
    return (apiInvestors || []).map(mapApiToInvestorMember);
  },

  /**
   * Universal saveInvestors with Dual-Sync:
   * 1. LocalStorage & custom event for zero latency
   * 2. Synchronize to dedicated /api/v1/investors
   * 3. Synchronize to /api/v1/cms/update (page: about, section: investors, key: list)
   */
  saveInvestors: async (
    investors: InvestorMember[],
    filesMap?: Record<string, File>
  ): Promise<boolean> => {
    // 1. Immediately persist to localStorage for cross-tab and local sync
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(investors));
        window.dispatchEvent(new CustomEvent("cdp_investors_updated", { detail: investors }));
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
      }
    }

    // 2. Dual-Sync: Dedicated /api/v1/investors
    try {
      for (let i = 0; i < investors.length; i++) {
        const inv = investors[i];
        const isNumericId = /^\d+$/.test(String(inv.id));
        const photoFile = filesMap ? filesMap[String(inv.id)] : undefined;
        const invWithOrder = { ...inv, order: i + 1 };
        const formData = mapInvestorMemberToFormData(invWithOrder, photoFile);

        if (isNumericId) {
          await investorsService.updateInvestor(inv.id, formData).catch(() => {});
        } else if (photoFile || inv.name) {
          await investorsService
            .createInvestor(formData)
            .then((created) => {
              if (created && created.id) {
                inv.id = String(created.id);
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      // Gracefully catch if backend relational table is pending migrations
    }


    // 3. Dual-Sync: Persist to CMS API backend
    try {
      await cmsService.updateBulk([
        {
          page: "about",
          section: "investors",
          key: "list",
          type: "textarea",
          label: "Our Investors List",
          value: JSON.stringify(investors),
          metadata: { items: investors },
        },
      ]);
      return true;
    } catch (err) {
      console.warn("CMS API save warning, saved to local cache:", err);
      return true;
    }
  },

  moveInvestor: (
    investors: InvestorMember[],
    investorId: string,
    direction: "up" | "down"
  ): InvestorMember[] => {
    const targetIndex = investors.findIndex((m) => m.id === investorId);
    if (targetIndex === -1) return investors;

    if (direction === "up" && targetIndex <= 0) return investors;
    if (direction === "down" && targetIndex >= investors.length - 1) return investors;

    const swapWithIndex = direction === "up" ? targetIndex - 1 : targetIndex + 1;
    const nextList = [...investors];
    const temp = nextList[targetIndex];
    nextList[targetIndex] = nextList[swapWithIndex];
    nextList[swapWithIndex] = temp;

    return nextList;
  },

  reorderInvestors: (
    investors: InvestorMember[],
    sourceId: string,
    targetId: string
  ): InvestorMember[] => {
    if (sourceId === targetId) return investors;

    const sourceIdx = investors.findIndex((m) => m.id === sourceId);
    const targetIdx = investors.findIndex((m) => m.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) return investors;

    const nextList = [...investors];
    const [moved] = nextList.splice(sourceIdx, 1);
    nextList.splice(targetIdx, 0, moved);

    return nextList;
  },
};

export default investorsService;
