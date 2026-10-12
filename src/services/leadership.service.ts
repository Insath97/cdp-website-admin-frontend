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
  created_at?: string;
  updated_at?: string;
}

export const defaultLeadershipMembers: LeadershipMember[] = [
  {
    id: "leader-founder-chairman",
    name: "Deshamanya A. R. Wickramasinghe",
    role: "Founder & Executive Chairman",
    tier: "founder",
    category: "Board & Executive Leadership",
    qualifications: "FCA · FCMA (UK) · MBA (Cranfield) · Hon. D.Sc. (Agribusiness)",
    credentials: "FCA, FCMA, MBA",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
    division: "Ceylon Development Plantation Group",
    domain: "Group Strategy & Governance",
    focus: "Fiduciary Stewardship & Vision",
    linkedin: "https://linkedin.com",
    bio: "Over 35 years of senior executive stewardship across agricultural economics, international commodity trading, and chartered enterprise governance. As Founder and Executive Chairman of Ceylon Development Plantation, he pioneered the integration of regenerative agro-forestry with institutional investor transparency, establishing benchmarks recognized across South Asia.",
    message:
      "When we founded Ceylon Development Plantation, our conviction was rooted in a foundational truth: that Sri Lanka's historic agrarian wisdom could be synthesized with institutional corporate governance, regenerative ecological science, and direct community prosperity.",
    is_active: true,
  },
  {
    id: "exec-ceo-group",
    name: "Dr. Sanjeewa Bandara",
    role: "Group Chief Executive Officer & Managing Director",
    tier: "executive",
    category: "Board & Executive Leadership",
    division: "Group Direction & Enterprise Performance",
    qualifications: "B.Sc. Agric (Hons) · M.Sc. · Ph.D. (Plantation Economics)",
    credentials: "Ph.D., M.Sc., B.Sc. Agric",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80",
    bio: "Commands group-level operational execution, multi-estate digitisation, and commercial asset yields. Brings 24 years of executive leadership in commercial agribusiness and large-scale agro-processing.",
    message:
      "Translating board governance into operational rigor on every hectare—empowering our superintendents with real-time field telemetry and fair community equity.",
    focus: "Enterprise Growth & Operational Discipline",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "exec-cm",
    name: "Rohan Senanayake",
    role: "Country Manager",
    tier: "executive",
    category: "Board & Executive Leadership",
    division: "Domestic Estate Management & Field Operations",
    qualifications: "B.Sc. Plantation Management · MBA (Colombo) · PMP",
    credentials: "B.Sc., MBA, PMP",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1000&q=80",
    bio: "Directs field administration across tea, coconut, and cinnamon divisions in Central and Southern provinces. Coordinates 4,000+ estate staff and outgrower networks with unyielding precision.",
    message:
      "Seamless estate coordination, worker welfare, and rigorous yield optimization keep our regional networks profitable, resilient, and respected.",
    focus: "Field Operations & Superintendent Council",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "exec-cto",
    name: "Dinesh Jayawardena",
    role: "Chief Technology & Innovation Officer (CTO)",
    tier: "executive",
    category: "Board & Executive Leadership",
    division: "Digital Agronomy & Precision Telemetry",
    qualifications: "B.Sc. Computer Engineering (Hons) · M.Sc. Data Systems · IEEE",
    credentials: "B.Sc. Eng, M.Sc., IEEE",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80",
    bio: "Pioneers CDP's digital agriculture architecture—integrating IoT canopy sensors, multi-spectral drone analysis, micro-climate predictive modeling, and ERP-integrated estate harvesting logs.",
    message:
      "Deploying IoT soil telemetry, drone canopy inspection, and transparent supply-chain tracking to modernize Sri Lankan agriculture from the soil up.",
    focus: "Agritech IoT, Precision Telemetry & Automation",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "gh-agronomy",
    name: "Prof. Hemantha Abeyratne",
    role: "Group Head of Agronomy & Crop Science",
    tier: "group_head",
    category: "Group Functional Executives",
    division: "Agronomy & Crop Science",
    qualifications: "Ph.D. Soil Science · M.Sc. Tropical Agronomy · B.Sc. Agric",
    credentials: "Ph.D., M.Sc. Agric",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80",
    bio: "Directs biological pest control protocols, organic soil remediation, high-density crop spacing, and climate-adaptive rootstock selection across all plantation zones.",
    focus: "Soil Biochemistry & Biological Pest Control",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "gh-sustainability",
    name: "Nirosha Karunaratne",
    role: "Group Head of Sustainability & ESG",
    tier: "group_head",
    category: "Group Functional Executives",
    division: "Sustainability & ESG",
    qualifications: "M.Sc. Environmental Forestry (Oxford) · B.Sc. Bot (Hons) · IEMA",
    credentials: "M.Sc. (Oxon), IEMA",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    bio: "Oversees zero-chemical buffer preservation, wildlife transit corridors, carbon sequestration measurement, and Rainforest Alliance / FSC certification across estates.",
    focus: "Carbon Accounting & Biodiversity Corridors",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "gh-legal",
    name: "Attorney Chaminda Ratnayake",
    role: "Group Head of Legal & Regulatory Affairs",
    tier: "group_head",
    category: "Legal, HR & People Development",
    division: "Legal & Corporate Governance",
    qualifications: "LL.B (Hons) Colombo · Attorney-at-Law · Notary Public",
    credentials: "LL.B (Hons), Attorney-at-Law",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    bio: "Manages statutory compliance with Ministry of Plantation Industries, land tenure integrity, intellectual property patents, and investor contractual covenants.",
    focus: "Statutory Compliance & Land Title Integrity",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
  {
    id: "gh-hr",
    name: "Dilrukshi Perera",
    role: "Group Head of Human Resources & People Development",
    tier: "group_head",
    category: "Legal, HR & People Development",
    division: "Human Resources & Talent",
    qualifications: "Chartered CIPM · MBA (HRM) · B.Sc. Business Admin",
    credentials: "CIPM, MBA",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    bio: "Spearheads talent pipelines, gender parity in estate leadership, occupational health & safety certifications, and vocational training across our 4,000-strong field workforce.",
    focus: "Occupational Safety & Leadership Acceleration",
    linkedin: "https://linkedin.com",
    is_active: true,
  },
];

const LOCAL_STORAGE_KEY = "cdp_leadership_members";

export const leadershipService = {
  getMembers: async (): Promise<LeadershipMember[]> => {
    // 1. Check local storage first for fast local responsiveness
    let localData: LeadershipMember[] | null = null;
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
      const cmsGroup = await cmsService.getAll("leadership");
      const listArray = cmsGroup?.members?.list;
      const memberField = Array.isArray(listArray) && listArray.length > 0 ? listArray[0] : null;
      if (memberField) {
        if (memberField.metadata?.items && Array.isArray(memberField.metadata.items)) {
          const items = memberField.metadata.items as LeadershipMember[];
          if (items.length > 0) {
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
            }
            return items;
          }
        }

        if (typeof memberField.value === "string" && memberField.value.trim().startsWith("[")) {
          const parsed = JSON.parse(memberField.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
            }
            return parsed as LeadershipMember[];
          }
        }
      }
    } catch {
      // In case CMS API fails or has not been populated yet, fall back to local or defaults
    }

    if (localData && localData.length > 0) {
      return localData;
    }

    return defaultLeadershipMembers;
  },

  saveMembers: async (members: LeadershipMember[]): Promise<boolean> => {
    // 1. Immediately persist to localStorage for zero latency and cross-tab/local sync
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
        window.dispatchEvent(new CustomEvent("cdp_leadership_updated", { detail: members }));
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
      }
    }

    // 2. Persist to CMS API backend
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
