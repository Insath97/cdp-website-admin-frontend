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

export const defaultInvestors: InvestorMember[] = [
  {
    id: "inv-manjula-senaratne",
    name: "Dr. Manjula Senaratne",
    role: "Strategic Ag-Tech Venture Partner",
    company: "Serendib Agri-Ventures & Seed Capital",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    is_active: true,
    order: 1,
  },
  {
    id: "inv-mohan-jayasuriya",
    name: "Deshabandu Mohan Jayasuriya",
    role: "Lead Institutional Capital Partner",
    company: "Ceylon Agro-Infrastructure Growth Fund",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80",
    is_active: true,
    order: 2,
  },
  {
    id: "inv-ranjit-aluwihare",
    name: "Ranjit Aluwihare",
    role: "Founding Consortium Partner",
    company: "Heritage Plantation Equity Syndicate",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80",
    is_active: true,
    order: 3,
  },
  {
    id: "inv-kavindi-dharmapala",
    name: "Kavindi Dharmapala",
    role: "Impact & Sustainable Capital Lead",
    company: "South Asia Green Horizon Fund",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80",
    is_active: true,
    order: 4,
  },
];

const LOCAL_STORAGE_KEY = "cdp_investors_list";

export const investorsService = {
  getInvestors: async (): Promise<InvestorMember[]> => {
    // 1. Check local storage first for fast responsiveness
    let localData: InvestorMember[] | null = null;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localData = parsed;
          }
        }
      } catch {
        // Ignore local parse error
      }
    }

    // 2. Fetch from CMS API
    try {
      const cmsGroup = await cmsService.getAll("about");
      const listArray = cmsGroup?.investors?.list;
      const investorField = Array.isArray(listArray) && listArray.length > 0 ? listArray[0] : null;
      if (investorField) {
        if (investorField.metadata?.items && Array.isArray(investorField.metadata.items)) {
          const items = investorField.metadata.items as InvestorMember[];
          if (items.length > 0) {
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
            }
            return items;
          }
        }

        if (typeof investorField.value === "string" && investorField.value.trim().startsWith("[")) {
          const parsed = JSON.parse(investorField.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
            }
            return parsed as InvestorMember[];
          }
        }
      }
    } catch {
      // In case CMS API is unavailable or empty, fall back to local or defaults
    }

    if (localData && localData.length > 0) {
      return localData;
    }

    return defaultInvestors;
  },

  saveInvestors: async (investors: InvestorMember[]): Promise<boolean> => {
    // 1. Immediately persist to localStorage for cross-tab and local sync
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(investors));
        window.dispatchEvent(new CustomEvent("cdp_investors_updated", { detail: investors }));
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
      }
    }

    // 2. Persist to CMS API backend
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
