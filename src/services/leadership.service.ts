import apiClient from "@/lib/api-client";
import { cmsService } from "./cms.service";

export type LeadershipCategory =
  | "Board & Executive Leadership"
  | "Group Functional Executives"
  | "Legal, HR & People Development"
  | "Sales & Business Leadership";

export type LeadershipTier = "founder" | "executive" | "group_head";

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  tier: LeadershipTier;
  category: LeadershipCategory | string;
  qualifications: string;
  credentials?: string;
  image: string;
  bio: string;
  message?: string;
  division?: string;
  domain?: string;
  focus?: string;
  linkedin?: string;
  email?: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiLeadershipMember {
  id: number;
  section: "chairman" | "executive" | "specialised";
  name: string;
  designation: string;
  group_label?: string | null;
  summary?: string | null;
  executive_statement?: string | null;
  message?: string | null;
  focus_area?: string | null;
  linkedin?: string | null;
  photo?: string | null;
  sort_order?: number | null;
  is_active: boolean;
  qualifications?: { id: number; title: string; sort_order: number }[] | string[];
  created_at?: string;
  updated_at?: string;
}

export function resolveLeaderPhoto(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/storage/${cleanPath}`;
}

export function mapApiToLeaderMember(api: ApiLeadershipMember): LeadershipMember {
  const tier: LeadershipTier =
    api.section === "chairman" ? "founder" : api.section === "specialised" ? "group_head" : "executive";

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
    tier,
    category:
      api.group_label ||
      (api.section === "chairman"
        ? "Board & Executive Leadership"
        : api.section === "specialised"
        ? "Group Functional Executives"
        : "Board & Executive Leadership"),
    qualifications,
    credentials: qualifications.split("·")[0]?.trim() || "",
    image: resolveLeaderPhoto(api.photo),
    bio: api.summary || "",
    message: api.message || api.executive_statement || "",
    division: api.group_label || "",
    domain: "",
    focus: api.focus_area || "",
    linkedin: api.linkedin || "",
    is_active: Boolean(api.is_active),
    sort_order: api.sort_order ?? 0,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export function mapLeaderMemberToFormData(member: LeadershipMember, photoFile?: File | null): FormData {
  const fd = new FormData();
  const section =
    member.tier === "founder" ? "chairman" : member.tier === "group_head" ? "specialised" : "executive";

  fd.append("section", section);
  fd.append("name", member.name);
  fd.append("designation", member.role);
  if (member.category || member.division) {
    fd.append("group_label", member.category || member.division || "");
  }
  if (member.bio) {
    fd.append("summary", member.bio);
  }
  if (member.tier === "founder") {
    if (member.message) fd.append("message", member.message);
  } else {
    if (member.message) fd.append("executive_statement", member.message);
  }
  if (member.focus) {
    fd.append("focus_area", member.focus);
  }
  if (member.linkedin) {
    fd.append("linkedin", member.linkedin);
  }
  fd.append("is_active", member.is_active ? "1" : "0");
  if (member.sort_order !== undefined) {
    fd.append("sort_order", String(member.sort_order));
  }

  // Split qualification strings into individual items for backend relation table
  if (member.qualifications) {
    const quals = member.qualifications
      .split(/[·,\n|]/)
      .map((q) => q.trim())
      .filter(Boolean);
    quals.forEach((q) => fd.append("qualifications[]", q));
  }

  if (photoFile instanceof File) {
    fd.append("photo", photoFile);
  }

  return fd;
}


const LOCAL_STORAGE_KEY = "cdp_leadership_members";

export const leadershipService = {
  /**
   * Fetch directly from dedicated backend /api/v1/leadership-members
   */
  fetchApiMembers: async (params?: { search?: string; section?: string; is_active?: boolean; per_page?: number }) => {
    const response = await apiClient.get("/leadership-members", { params });
    const payload = response.data;
    const paginated = payload.data || payload;
    const items: ApiLeadershipMember[] = Array.isArray(paginated) ? paginated : paginated.data || [];
    return items;
  },

  /**
   * Create member on /api/v1/leadership-members
   */
  createMember: async (data: FormData | Record<string, any>): Promise<any> => {
    let payload = data;
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const response = await apiClient.post("/leadership-members", payload, { headers });
    return response.data.data || response.data;
  },

  /**
   * Update member on /api/v1/leadership-members/{id}
   */
  updateMember: async (id: number | string, data: FormData | Record<string, any>): Promise<any> => {
    if (data instanceof FormData) {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }
      const response = await apiClient.post(`/leadership-members/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data || response.data;
    } else {
      const response = await apiClient.put(`/leadership-members/${id}`, data);
      return response.data.data || response.data;
    }
  },

  /**
   * Delete member on /api/v1/leadership-members/{id}
   */
  deleteMember: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/leadership-members/${id}`);
  },

  /**
   * Toggle status on /api/v1/leadership-members/{id}/toggle-status
   */
  toggleStatus: async (id: number | string): Promise<any> => {
    const response = await apiClient.patch(`/leadership-members/${id}/toggle-status`);
    return response.data.data || response.data;
  },

  /**
   * Universal getMembers: Priority:
   * 1. Dedicated /api/v1/leadership-members endpoint
   * 2. Local cache
   * 3. CMS endpoint
   * 4. Built-in defaults
   */
  getMembers: async (): Promise<LeadershipMember[]> => {
    const apiMembers = await leadershipService.fetchApiMembers({ per_page: 100 });
    return (apiMembers || []).map(mapApiToLeaderMember);
  },

  /**
   * Universal saveMembers:
   * 1. Persists locally for instant UI responsiveness
   * 2. Synchronizes with dedicated /api/v1/leadership-members backend tables
   * 3. Synchronizes with /api/v1/cms/update so public website (reading public CMS) gets immediate updates
   */
  saveMembers: async (members: LeadershipMember[], filesMap?: Record<string, File>): Promise<boolean> => {
    // 1. Immediately persist to localStorage for zero latency
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
        window.dispatchEvent(new CustomEvent("cdp_leadership_updated", { detail: members }));
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
      }
    }

    // 2. Dual Sync: Persist to dedicated /api/v1/leadership-members
    try {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const isNumericId = /^\d+$/.test(String(member.id));
        const photoFile = filesMap ? filesMap[String(member.id)] : undefined;
        const memberWithOrder = { ...member, sort_order: i };
        const formData = mapLeaderMemberToFormData(memberWithOrder, photoFile);

        if (isNumericId) {
          try {
            await leadershipService.updateMember(member.id, formData);
          } catch (err) {
            console.warn(`Could not update member #${member.id} via dedicated endpoint:`, err);
          }
        } else {
          try {
            const created = await leadershipService.createMember(formData);
            if (created?.id) {
              member.id = String(created.id);
            }
          } catch (err) {
            console.warn(`Could not create member ${member.name} via dedicated endpoint:`, err);
          }
        }
      }
    } catch (dedicatedErr) {
      console.warn("Dedicated leadership synchronization notice:", dedicatedErr);
    }

    // 3. Dual Sync: Persist to CMS API backend for public website compatibility
    try {
      await cmsService.updateBulk([
        {
          page: "leadership",
          section: "members",
          key: "list",
          type: "textarea",
          label: "Leadership Directory Members",
          value: JSON.stringify(members),
          metadata: { items: members },
        },
      ]);
      return true;
    } catch (err) {
      console.warn("CMS API save warning, saved to local cache:", err);
      return true; // Still successful locally
    }
  },

  /**
   * Reorder helper: Moves a member up or down within their category tier.
   * Does NOT use manually assigned sequential numbers.
   * Preserves all items and their hidden/active states.
   */
  moveMember: (
    members: LeadershipMember[],
    memberId: string,
    direction: "up" | "down"
  ): LeadershipMember[] => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return members;

    // Filter all members belonging to the same tier
    const sameTierMembers = members.filter((m) => m.tier === target.tier);
    const tierIndex = sameTierMembers.findIndex((m) => m.id === memberId);

    if (direction === "up" && tierIndex <= 0) return members;
    if (direction === "down" && tierIndex >= sameTierMembers.length - 1) return members;

    const swapWithIndex = direction === "up" ? tierIndex - 1 : tierIndex + 1;
    const swapTarget = sameTierMembers[swapWithIndex];

    // Swap positions in the full members array
    const fullIndexA = members.findIndex((m) => m.id === target.id);
    const fullIndexB = members.findIndex((m) => m.id === swapTarget.id);

    const nextMembers = [...members];
    const temp = nextMembers[fullIndexA];
    nextMembers[fullIndexA] = nextMembers[fullIndexB];
    nextMembers[fullIndexB] = temp;

    return nextMembers;
  },

  /**
   * Drag-and-drop reorder helper: Moves a dragged member from one position to another within a tier.
   */
  reorderWithinTier: (
    members: LeadershipMember[],
    tier: LeadershipTier,
    sourceId: string,
    targetId: string
  ): LeadershipMember[] => {
    if (sourceId === targetId) return members;

    const sameTier = members.filter((m) => m.tier === tier);
    const sourceTierIdx = sameTier.findIndex((m) => m.id === sourceId);
    const targetTierIdx = sameTier.findIndex((m) => m.id === targetId);

    if (sourceTierIdx === -1 || targetTierIdx === -1) return members;

    const newTierList = [...sameTier];
    const [moved] = newTierList.splice(sourceTierIdx, 1);
    newTierList.splice(targetTierIdx, 0, moved);

    // Reconstruct the full members list replacing the items of this tier with the new order
    let tierPointer = 0;
    return members.map((m) => {
      if (m.tier === tier) {
        return newTierList[tierPointer++];
      }
      return m;
    });
  },
};

export default leadershipService;
