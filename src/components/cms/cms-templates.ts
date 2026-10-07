import type { CmsContentType } from "@/services/cms.service";
import type { RepeaterFieldSchema } from "./repeater-editor";

export interface CmsTemplateField {
  section: string;
  key: string;
  label: string;
  type: CmsContentType;
  value: string;
  isRepeater?: boolean;
}

export const CMS_PAGES = [
  { id: "home", label: "Home Page" },
  { id: "about", label: "About CDP" },
  { id: "leadership", label: "Leadership & Team" },
  { id: "life-at-cdp", label: "Life at CDP / Memory Book" },
  { id: "careers", label: "Careers & Culture" },
  { id: "awards", label: "Awards & Certifications" },
  { id: "plantations", label: "Our Plantations Explorer" },
  { id: "investments", label: "Investment Opportunities" },
  { id: "how-it-works", label: "How It Works" },
  { id: "calculator", label: "ROI Estimator" },
  { id: "profit-calculator", label: "Profit Calculator Rates" },
  { id: "sustainability", label: "Sustainability & CSR" },
  { id: "insights", label: "Insights & News" },
  { id: "legal", label: "Legal & Compliance" },
  { id: "contact", label: "Contact & Inquiries" },
  { id: "investor-login", label: "Investor Portal" },
  { id: "investor-relations", label: "Investor Relations" },
  { id: "my-investments", label: "Portfolio Verification Portal" },
  { id: "global", label: "Global / Header & Footer" },
];

export const REPEATER_SCHEMAS: Record<string, RepeaterFieldSchema[]> = {
  // Testimonials
  "home.testimonials.items": [
    { key: "quote", label: "Quote Text", type: "textarea", placeholder: "Quote from partner or investor..." },
    { key: "attribution", label: "Person Name", type: "text", placeholder: "e.g. Sunil Perera" },
    { key: "role", label: "Role / Profession", type: "text", placeholder: "e.g. Registered Agro Investor" },
    { key: "location", label: "Location", type: "text", placeholder: "e.g. Colombo, Sri Lanka" },
    { key: "structure", label: "Investment Structure Tag", type: "text", placeholder: "e.g. Paddy Season Structure" },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-plant-line" },
  ],

  // Why CDP Core Values
  "home.why_cdp.values": [
    { key: "title", label: "Value Title", type: "text", placeholder: "e.g. Land Security" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Value explanation..." },
    { key: "icon", label: "Remix Icon Class", type: "text", placeholder: "e.g. ri-shield-check-line" },
  ],

  // FAQs
  "home.faq.items": [
    { key: "group", label: "FAQ Category Group", type: "text", placeholder: "e.g. Land & Ownership, Risk, Investment" },
    { key: "q", label: "Question", type: "text", placeholder: "e.g. Is land freehold or leasehold?" },
    { key: "a", label: "Answer", type: "textarea", placeholder: "Detailed clear answer..." },
  ],

  // About Milestones Timeline
  "about.timeline.milestones": [
    { key: "year", label: "Year", type: "text", placeholder: "e.g. 2021" },
    { key: "title", label: "Milestone Title", type: "text", placeholder: "e.g. Flagship Estate Acquisition" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Details of achievement..." },
    { key: "status", label: "Status Badge", type: "text", placeholder: "Verified / Completed" },
  ],

  // Operations Footprint
  "about.operations.regions": [
    { key: "region", label: "District / Region", type: "text", placeholder: "e.g. Anuradhapura" },
    { key: "focus", label: "Agricultural Focus", type: "text", placeholder: "e.g. Paddy — flagship estate" },
  ],

  // Strategic Partnerships
  "about.partnerships.items": [
    { key: "title", label: "Partner Name / Sector", type: "text", placeholder: "e.g. Farmer Communities" },
    { key: "body", label: "Partnership Description", type: "textarea", placeholder: "Fair-price sourcing..." },
    { key: "status", label: "Status", type: "text", placeholder: "Ongoing / Verified" },
  ],

  // Leadership Team
  "leadership.team.members": [
    { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Dr. Ananda Weerasinghe" },
    { key: "role", label: "Designation / Title", type: "text", placeholder: "e.g. Chief Agronomist" },
    { key: "focus", label: "Operational Focus", type: "text", placeholder: "e.g. Soil & Water Science" },
    { key: "bio", label: "Biography", type: "textarea", placeholder: "Career background..." },
    { key: "image", label: "Photo URL", type: "text", placeholder: "https://..." },
    { key: "linkedin", label: "LinkedIn Profile URL", type: "text", placeholder: "https://linkedin.com/in/..." },
  ],

  // Governance Cards
  "leadership.governance.cards": [
    { key: "title", label: "Governance Pillar", type: "text", placeholder: "e.g. Documented Decision-Making" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Operational accountability..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-shield-keyhole-line" },
  ],

  // Life at CDP Moments
  "life-at-cdp.moments.items": [
    { key: "title", label: "Moment Title", type: "text", placeholder: "e.g. Season Openers" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Every cultivation cycle begins..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-seedling-line" },
  ],

  // Life at CDP Gallery
  "life-at-cdp.gallery.items": [
    { key: "src", label: "Image URL", type: "text", placeholder: "https://..." },
    { key: "caption", label: "Caption / Description", type: "text", placeholder: "Early morning paddy inspection..." },
    { key: "category", label: "Category Tag", type: "text", placeholder: "Harvest / Nursery / Community" },
  ],

  // Awards
  "awards.showcase.items": [
    { key: "title", label: "Award Title", type: "text", placeholder: "e.g. National Agricultural Excellence" },
    { key: "organisation", label: "Awarding Body", type: "text", placeholder: "e.g. Ministry of Agriculture" },
    { key: "year", label: "Year Awarded", type: "text", placeholder: "e.g. 2024" },
    { key: "category", label: "Category", type: "text", placeholder: "e.g. Sustainable Agronomy" },
    { key: "status", label: "Verification Status", type: "text", placeholder: "Verified / Pending verification" },
    { key: "image", label: "Certificate / Trophy Image URL", type: "text", placeholder: "https://..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-award-line" },
  ],

  // Plantations Estates
  "plantations.estates.items": [
    { key: "id", label: "Estate Slug / ID", type: "text", placeholder: "e.g. rajanganaya-paddy-estate" },
    { key: "name", label: "Estate Name", type: "text", placeholder: "e.g. Rajanganaya Flagship Estate" },
    { key: "crop", label: "Primary Crop", type: "text", placeholder: "e.g. Traditional & Export Paddy" },
    { key: "district", label: "District", type: "text", placeholder: "e.g. Anuradhapura" },
    { key: "province", label: "Province", type: "text", placeholder: "e.g. North Central" },
    { key: "areaHa", label: "Area (Hectares)", type: "number", placeholder: "185" },
    { key: "established", label: "Established Year", type: "text", placeholder: "2019" },
    { key: "status", label: "Development Status", type: "text", placeholder: "Operational / Expanding" },
    { key: "summary", label: "Short Summary", type: "textarea", placeholder: "Primary grain production center..." },
    { key: "image", label: "Cover Image URL", type: "text", placeholder: "https://..." },
    { key: "soilType", label: "Soil Type", type: "text", placeholder: "e.g. Red-Yellow Podzolic" },
    { key: "waterSource", label: "Water Source", type: "text", placeholder: "e.g. Tank Cascade Irrigation" },
  ],

  // Journey Steps
  "how-it-works.journey.steps": [
    { key: "step", label: "Step Number", type: "text", placeholder: "01" },
    { key: "title", label: "Stage Title", type: "text", placeholder: "e.g. Select Project & Allocation" },
    { key: "body", label: "Stage Description", type: "textarea", placeholder: "Detailed steps..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-file-list-3-line" },
  ],

  // Sustainability Pillars
  "sustainability.pillars.items": [
    { key: "title", label: "Pillar Name", type: "text", placeholder: "e.g. Soil Stewardship" },
    { key: "body", label: "Summary", type: "textarea", placeholder: "Regenerative soil protocols..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-seedling-line" },
  ],

  // Profit Calculator Plans
  "profit-calculator.plans.items": [
    { key: "id", label: "Account ID", type: "text", placeholder: "standard" },
    { key: "name", label: "Account Type Name", type: "text", placeholder: "Standard Investor Account" },
    { key: "maturityProfitRate", label: "Maturity Profit Rate (%)", type: "number", placeholder: "24" },
    { key: "monthlyProfitRate", label: "Monthly Profit Rate (%)", type: "number", placeholder: "18" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Standard individual investor terms..." },
  ],

  // Sustainability Impact Metrics
  "sustainability.metrics.items": [
    { key: "label", label: "Metric Label", type: "text", placeholder: "e.g. Farmers trained" },
    { key: "value", label: "Metric Value", type: "text", placeholder: "e.g. 450+ or [VERIFY]" },
    { key: "note", label: "Explanatory Note", type: "text", placeholder: "e.g. Cumulative programme reach" },
  ],

  // How It Works Principles
  "how-it-works.principles.items": [
    { key: "title", label: "Principle Title", type: "text", placeholder: "e.g. Nothing hidden" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Detailed principle commitment..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-eye-line" },
  ],

  // Awards Verification Standards
  "awards.standards.steps": [
    { key: "step", label: "Step Number", type: "text", placeholder: "01" },
    { key: "title", label: "Step Title", type: "text", placeholder: "e.g. Logged with evidence" },
    { key: "body", label: "Step Description", type: "textarea", placeholder: "Evidence requirements..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-upload-cloud-2-line" },
  ],

  // About Certifications
  "about.certifications.items": [
    { key: "name", label: "Certification Name", type: "text", placeholder: "e.g. Good Agricultural Practices (GAP)" },
    { key: "detail", label: "Issuing Details", type: "textarea", placeholder: "Details regarding compliance..." },
    { key: "status", label: "Status Badge", type: "text", placeholder: "Verified / In progress" },
  ],

  // Investor Relations Quick Access
  "investor-relations.quick_access.items": [
    { key: "title", label: "Action Title", type: "text", placeholder: "e.g. Investor Login" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Action explanation..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-lock-2-line" },
    { key: "action_label", label: "Button Label", type: "text", placeholder: "Sign in" },
    { key: "action_url", label: "Target URL", type: "text", placeholder: "/investor-login" },
  ],

  // Investor Relations Commitments
  "investor-relations.commitments.items": [
    { key: "title", label: "Commitment Title", type: "text", placeholder: "e.g. Transparent disclosure" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Commitment details..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-eye-line" },
  ],

  // Investor Login Benefits
  "investor-login.benefits.items": [
    { key: "title", label: "Feature / Benefit Title", type: "text", placeholder: "e.g. Investment summaries" },
    { key: "body", label: "Description", type: "textarea", placeholder: "Feature description..." },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-line-chart-line" },
  ],

  // Legal Documents
  "legal.legal_docs.items": [
    { key: "name", label: "Document Name", type: "text", placeholder: "e.g. Certificate of Incorporation" },
    { key: "status", label: "Availability Status", type: "text", placeholder: "Available on request / [VERIFY]" },
    { key: "icon", label: "Icon Class", type: "text", placeholder: "e.g. ri-file-paper-2-line" },
  ],

  // Contact Department Inquiries
  "contact.departments.items": [
    { key: "department", label: "Department Name", type: "text", placeholder: "e.g. Agronomy & Plantation Management" },
    { key: "email", label: "Email Address", type: "text", placeholder: "agronomy@cdp.lk" },
    { key: "phone", label: "Phone Hotline", type: "text", placeholder: "+94 11 234 5678" },
    { key: "hours", label: "Operating Hours", type: "text", placeholder: "Mon – Fri: 8:30 AM – 5:00 PM" },
  ],

  // Branch & Warehouse Locations Explorer
  "home.branch_preview.locations": [
    { key: "name", label: "Facility Name", type: "text", placeholder: "e.g. Colombo Head Office" },
    { key: "type", label: "Type (branch or warehouse)", type: "text", placeholder: "branch" },
    { key: "categoryLabel", label: "Category Label", type: "text", placeholder: "Branch Office" },
    { key: "district", label: "District", type: "text", placeholder: "Colombo" },
    { key: "city", label: "City", type: "text", placeholder: "Colombo 03" },
    { key: "address", label: "Address", type: "textarea", placeholder: "No. 42, Plantation Avenue" },
    { key: "phone", label: "Phone Hotline", type: "text", placeholder: "+94 11 234 5678" },
    { key: "email", label: "Email Address", type: "text", placeholder: "colombo@cdp.lk" },
    { key: "hours", label: "Operating Hours", type: "text", placeholder: "Mon – Fri: 8:30 AM – 5:00 PM" },
    { key: "lat", label: "Latitude", type: "text", placeholder: "6.9271" },
    { key: "lng", label: "Longitude", type: "text", placeholder: "79.8612" },
  ],
};

export const CMS_DEFAULT_TEMPLATES: Record<string, CmsTemplateField[]> = {
  home: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow Badge", type: "text", value: "Ceylon Development Plantation (Pvt) Ltd" },
    { section: "hero", key: "title", label: "Hero Main Title", type: "text", value: "Rooted in Sri Lankan soil. Built for long-term value." },
    { section: "hero", key: "subtitle", label: "Hero Subtitle", type: "textarea", value: "A professionally managed plantation and agro-investment company focused on sustainable agriculture, transparent participation structures and long-term wealth creation." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "stats", key: "stat_1_val", label: "Stat 1 Value", type: "text", value: "650+" },
    { section: "stats", key: "stat_1_label", label: "Stat 1 Label", type: "text", value: "Hectares under active cultivation" },
    { section: "stats", key: "stat_2_val", label: "Stat 2 Value", type: "text", value: "15+" },
    { section: "stats", key: "stat_2_label", label: "Stat 2 Label", type: "text", value: "Operational regional branches" },
    { section: "stats", key: "stat_3_val", label: "Stat 3 Value", type: "text", value: "850+" },
    { section: "stats", key: "stat_3_label", label: "Stat 3 Label", type: "text", value: "Registered agro investors" },
    { section: "stats", key: "stat_4_val", label: "Stat 4 Value", type: "text", value: "100%" },
    { section: "stats", key: "stat_4_label", label: "Stat 4 Label", type: "text", value: "Audited agricultural governance" },
    { section: "why_cdp", key: "heading", label: "Why CDP Section Heading", type: "text", value: "Why choose Ceylon Development Plantation" },
    { section: "why_cdp", key: "description", label: "Why CDP Overview Description", type: "textarea", value: "We bridge the gap between traditional agricultural expertise and modern institutional investment management." },
    { section: "why_cdp", key: "values", label: "Why CDP Core Value Cards", type: "textarea", value: "[]", isRepeater: true },
    { section: "investments_preview", key: "heading", label: "Investments Section Heading", type: "text", value: "Structures shaped around real agriculture" },
    { section: "investments_preview", key: "description", label: "Investments Section Description", type: "textarea", value: "From seasonal paddy cultivation and freshwater aquaculture to bio-fertilizer production and circular waste management." },
    { section: "testimonials", key: "eyebrow", label: "Testimonials Eyebrow", type: "text", value: "Testimonials" },
    { section: "testimonials", key: "heading", label: "Testimonials Section Heading", type: "text", value: "Voices from our community" },
    { section: "testimonials", key: "description", label: "Testimonials Section Description", type: "textarea", value: "Perspectives from across the CDP estate network — on transparency, documentation and agricultural discipline." },
    { section: "testimonials", key: "items", label: "Testimonial Cards Collection", type: "textarea", value: "[]", isRepeater: true },
    { section: "branch_preview", key: "eyebrow", label: "Branch Locator Eyebrow", type: "text", value: "Island-Wide Network" },
    { section: "branch_preview", key: "heading", label: "Branch Locator Heading", type: "text", value: "Find a Branch or Warehouse Near You" },
    { section: "branch_preview", key: "description", label: "Branch Locator Description", type: "textarea", value: "With operational branches and central agricultural warehouses across Sri Lanka, our agronomy teams are on the ground." },
    { section: "branch_preview", key: "locations", label: "Custom Branch / Warehouse Locations List", type: "textarea", value: "[]", isRepeater: true },
    { section: "insights_preview", key: "eyebrow", label: "Insights Eyebrow", type: "text", value: "Field Notes & Intelligence" },
    { section: "insights_preview", key: "heading", label: "Insights Section Heading", type: "text", value: "Agricultural insights, education and company updates" },
    { section: "insights_preview", key: "description", label: "Insights Section Description", type: "textarea", value: "Agronomy briefings, harvest reports and macroeconomic analyses from the field." },
    { section: "awards", key: "eyebrow", label: "Awards Eyebrow", type: "text", value: "Credibility & Standards" },
    { section: "awards", key: "heading", label: "Awards Section Heading", type: "text", value: "Awards & recognition worth standing behind" },
    { section: "awards", key: "description", label: "Awards Section Description", type: "textarea", value: "Recognition across national agricultural standards, export excellence and community contribution." },
    { section: "faq", key: "eyebrow", label: "FAQ Eyebrow", type: "text", value: "Clear Answers" },
    { section: "faq", key: "heading", label: "FAQ Section Heading", type: "text", value: "Straight answers to the questions that matter" },
    { section: "faq", key: "description", label: "FAQ Section Description", type: "textarea", value: "Everything you need to know about ownership, governance, risk and return disbursement." },
    { section: "faq", key: "items", label: "FAQ Accordion Questions & Answers", type: "textarea", value: "[]", isRepeater: true },
    { section: "cta", key: "heading", label: "CTA Banner Heading", type: "text", value: "Let's talk about what a responsible plantation partnership looks like" },
    { section: "cta", key: "subtitle", label: "CTA Banner Subtitle", type: "textarea", value: "Schedule a consultation with our plantation management team or visit any of our regional operating offices across Sri Lanka." },
    { section: "cta", key: "button_text", label: "CTA Button Text", type: "text", value: "Schedule Consultation" },
    { section: "cta", key: "button_url", label: "CTA Button URL", type: "text", value: "/contact" },
  ],

  about: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "About CDP" },
    { section: "hero", key: "title", label: "About Page Title", type: "text", value: "A Sri Lankan plantation company, professionally managed" },
    { section: "hero", key: "intro", label: "About Page Intro", type: "textarea", value: "Ceylon Development Plantation (Pvt) Ltd pairs traditional Sri Lankan agricultural knowledge with modern agronomy, documented governance and a long-term view." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "overview", key: "mission", label: "Mission Statement", type: "textarea", value: "To pioneer sustainable agro-investment models that enrich local farming communities, secure domestic food systems and cultivate verified wealth." },
    { section: "overview", key: "vision", label: "Vision Statement", type: "textarea", value: "To be the benchmark for agricultural excellence, transparency and stakeholder trust across South Asia." },
    { section: "overview", key: "philosophy", label: "Philosophy", type: "textarea", value: "Long-term agronomic health over short-term exploitation. Transparent documentation over unverified promises." },
    { section: "history", key: "founding_title", label: "Origin Story Title", type: "text", value: "Built on agriculture, governed like a serious company" },
    { section: "history", key: "founding_text", label: "Origin Story Text", type: "textarea", value: "CDP was founded to bring professional management and modern agronomy to Sri Lankan plantation agriculture." },
    { section: "operations", key: "regions", label: "Regional Operating Footprint", type: "textarea", value: "[]", isRepeater: true },
    { section: "timeline", key: "milestones", label: "Corporate Timeline Milestones", type: "textarea", value: "[]", isRepeater: true },
    { section: "partnerships", key: "items", label: "Strategic Partnerships", type: "textarea", value: "[]", isRepeater: true },
    { section: "chairman", key: "message_title", label: "Chairman Message Heading", type: "text", value: "Letter from the Chairman" },
    { section: "chairman", key: "quote", label: "Chairman Core Quote", type: "textarea", value: "We will always show you the whole picture — not just the promising part of it." },
    { section: "chairman", key: "paragraph_1", label: "Chairman Message Paragraph 1", type: "textarea", value: "At Ceylon Development Plantation, we believe Sri Lankan agriculture deserves the same discipline, transparency and long-term thinking as any serious industry. Our land has fed this nation for generations; our task is to steward it with modern agronomy, honest reporting and genuine respect for the people who work it." },
    { section: "chairman", key: "paragraph_2", label: "Chairman Message Paragraph 2", type: "textarea", value: "We are building CDP as far more than a plantation company. Every structure we offer is shaped around real agricultural cycles, real costs and real risks — because trust, once lost in agriculture, is very hard to regrow." },
    { section: "chairman", key: "paragraph_3", label: "Chairman Message Paragraph 3", type: "textarea", value: "To our partners, farmers and investors: our commitment is to clarity. You will know what is verified, what is assumed and where the risk sits — before you make any decision." },
    { section: "chairman", key: "author_name", label: "Chairman Name", type: "text", value: "Deshamanya Dr. Vernon Perera" },
    { section: "chairman", key: "designation", label: "Chairman Designation", type: "text", value: "Chairman & Independent Director" },
    { section: "chairman", key: "image", label: "Chairman Portrait Image URL", type: "image", value: "" },
    { section: "governance", key: "heading", label: "Governance Heading", type: "text", value: "Institutional oversight & statutory adherence" },
    { section: "governance", key: "description", label: "Governance Description", type: "textarea", value: "Every plantation unit operates within strict statutory compliance, annual third-party audits and formal environmental impact assessments." },
  ],

  leadership: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Leadership" },
    { section: "hero", key: "title", label: "Leadership Page Title", type: "text", value: "The people accountable for every estate" },
    { section: "hero", key: "intro", label: "Leadership Page Intro", type: "textarea", value: "CDP's leadership spans agronomy, operations, finance, investor relations and sustainability. Only verified profiles are published." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "board_header", key: "heading", label: "Board Section Heading", type: "text", value: "Executive Leadership & Board of Directors" },
    { section: "board_header", key: "description", label: "Board Section Description", type: "textarea", value: "Executive governance providing strategic direction, legal compliance and financial stewardship." },
    { section: "team", key: "members", label: "Leadership Profiles List", type: "textarea", value: "[]", isRepeater: true },
    { section: "advisors", key: "heading", label: "Agronomy Advisory Heading", type: "text", value: "Senior Agronomy Advisory Panel" },
    { section: "advisors", key: "description", label: "Agronomy Advisory Description", type: "textarea", value: "Independent university professors, soil researchers and plant pathologists guiding our field practices." },
    { section: "governance", key: "cards", label: "Governance Framework Cards", type: "textarea", value: "[]", isRepeater: true },
  ],

  "life-at-cdp": [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Life at CDP" },
    { section: "hero", key: "title", label: "Memory Book Page Title", type: "text", value: "The people, the seasons and the moments behind the numbers" },
    { section: "hero", key: "intro", label: "Memory Book Intro", type: "textarea", value: "A Memory Book of life on CDP estates — the teams who work the seasons, the communities we partner with, and the craft of Sri Lankan plantation agriculture." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "moments", key: "items", label: "Core Agricultural Moments Cards", type: "textarea", value: "[]", isRepeater: true },
    { section: "gallery", key: "items", label: "Photographic Lightbox Gallery", type: "textarea", value: "[]", isRepeater: true },
    { section: "quote", key: "body", label: "Featured Worker Quote", type: "textarea", value: "When the water is managed properly, the soil does not fail you." },
    { section: "quote", key: "author", label: "Quote Attribution", type: "text", value: "Gunapala Bandara — Senior Water Manager, Rajanganaya" },
  ],

  careers: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Careers at CDP" },
    { section: "hero", key: "title", label: "Careers Page Title", type: "text", value: "Grow your career in modern sustainable agriculture" },
    { section: "hero", key: "intro", label: "Careers Page Intro", type: "textarea", value: "Join an energetic, forward-thinking team dedicated to transforming Sri Lanka's plantation sector with technology, science and integrity." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "culture", key: "heading", label: "Culture Section Heading", type: "text", value: "Why build your career with Ceylon Development Plantation" },
    { section: "culture", key: "description", label: "Culture Section Description", type: "textarea", value: "We offer hands-on agronomic development, continuous learning, competitive compensation and meaningful community impact." },
  ],

  awards: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Recognition" },
    { section: "hero", key: "title", label: "Awards Page Title", type: "text", value: "Awards, certifications & the standard behind them" },
    { section: "hero", key: "intro", label: "Awards Page Intro", type: "textarea", value: "Recognition is worth publishing only when it can be verified. This is where CDP's awards and accreditations live — each one labelled honestly for what it is." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "showcase", key: "items", label: "Verified Awards & Certifications List", type: "textarea", value: "[]", isRepeater: true },
    { section: "standards", key: "step_1", label: "Standard Step 1 Title", type: "text", value: "Logged with evidence" },
    { section: "standards", key: "step_1_desc", label: "Standard Step 1 Description", type: "textarea", value: "Every award is recorded together with its awarding body, year and supporting documentation." },
    { section: "standards", key: "step_2", label: "Standard Step 2 Title", type: "text", value: "Independently checked" },
    { section: "standards", key: "step_2_desc", label: "Standard Step 2 Description", type: "textarea", value: "We confirm each entry against the issuing body's own records before publishing." },
    { section: "standards", key: "step_3", label: "Standard Step 3 Title", type: "text", value: "Published, or labelled" },
    { section: "standards", key: "step_3_desc", label: "Standard Step 3 Description", type: "textarea", value: "Entries we can evidence go live as Verified. Anything pending is clearly marked." },
  ],

  plantations: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Our Plantations" },
    { section: "hero", key: "title", label: "Plantations Page Title", type: "text", value: "An interactive explorer of every CDP estate" },
    { section: "hero", key: "intro", label: "Plantations Page Intro", type: "textarea", value: "Every block mapped, every soil profile documented, every crop cycle accounted for. Real estates under active cultivation across Sri Lanka." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "stats", key: "total_hectares", label: "Total Hectares", type: "text", value: "650+" },
    { section: "stats", key: "active_districts", label: "Active Districts", type: "text", value: "6" },
    { section: "stats", key: "cultivated_crops", label: "Cultivated Crops", type: "text", value: "4 Primary" },
    { section: "stats", key: "total_estates", label: "Total Estates", type: "text", value: "8 Estates" },
    { section: "estates", key: "items", label: "Plantation Estates Directory", type: "textarea", value: "[]", isRepeater: true },
  ],

  investments: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Investment Opportunities" },
    { section: "hero", key: "title", label: "Investments Page Title", type: "text", value: "Transparent plantation structures, explained in full" },
    { section: "hero", key: "intro", label: "Investments Page Intro", type: "textarea", value: "Every opportunity has its own structured documentation: tenure, harvest assumptions, fees, operational risks and legal exit mechanisms." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "assurance", key: "heading", label: "Assurance Heading", type: "text", value: "Agricultural participation horizons" },
    { section: "assurance", key: "description", label: "Assurance Description", type: "textarea", value: "Our participation structures map to verified harvest seasons and real commodity export demand." },
  ],

  "how-it-works": [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "How It Works" },
    { section: "hero", key: "title", label: "How It Works Page Title", type: "text", value: "From first question to final harvest — no black boxes" },
    { section: "hero", key: "intro", label: "How It Works Page Intro", type: "textarea", value: "We believe clarity builds confidence. Here is every stage of an agricultural partnership with Ceylon Development Plantation." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "journey", key: "heading", label: "Journey Section Heading", type: "text", value: "Eight stages, documented end to end" },
    { section: "journey", key: "description", label: "Journey Section Description", type: "textarea", value: "Each stage exists to reduce uncertainty — for you and for us." },
    { section: "journey", key: "steps", label: "Cultivation Journey Stages List", type: "textarea", value: "[]", isRepeater: true },
    { section: "advisory", key: "heading", label: "Advisory Desk Heading", type: "text", value: "Continuous agronomy updates & legal verification" },
    { section: "advisory", key: "description", label: "Advisory Desk Description", type: "textarea", value: "Quarterly field progress audits, high-resolution aerial surveys and transparent financial statements dispatched directly to partners." },
  ],

  calculator: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "ROI Estimator" },
    { section: "hero", key: "title", label: "Calculator Page Title", type: "text", value: "Explore scenarios — with the assumptions shown" },
    { section: "hero", key: "intro", label: "Calculator Page Intro", type: "textarea", value: "Adjust the project, amount and scenario to see an illustrative outcome. Every figure here is an estimate based on stated assumptions." },
    { section: "disclaimer", key: "warning_text", label: "Statutory Disclaimer Text", type: "textarea", value: "This tool is for education only. It is not financial advice and does not account for tax, inflation, crop failure or market downturns." },
  ],

  "profit-calculator": [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Profit Calculator" },
    { section: "hero", key: "title", label: "Profit Calculator Title", type: "text", value: "See your profits — on maturity or monthly" },
    { section: "hero", key: "intro", label: "Profit Calculator Intro", type: "textarea", value: "Select an account type and an investment amount to see an illustration of the profits paid on maturity and the profits paid monthly." },
    { section: "plans", key: "items", label: "Account Types & Rates Configuration", type: "textarea", value: "[]", isRepeater: true },
    { section: "rules", key: "payout_rule", label: "Monthly Payout Rule Note", type: "textarea", value: "Profits are credited to the investor's designated bank account on the 10th of every calendar month." },
  ],

  sustainability: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Sustainability & CSR" },
    { section: "hero", key: "title", label: "Sustainability Page Title", type: "text", value: "Environmental management, community and climate resilience" },
    { section: "hero", key: "intro", label: "Sustainability Page Intro", type: "textarea", value: "Agriculture cannot thrive by depleting the soil it depends on. Our sustainable practices protect both ecosystem biodiversity and farmer welfare." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "pillars", key: "heading", label: "Pillars Section Heading", type: "text", value: "Eight pillars of responsible plantation management" },
    { section: "pillars", key: "description", label: "Pillars Section Description", type: "textarea", value: "Every estate adheres to environmental safeguards, soil regeneration guidelines and water conservation protocols." },
    { section: "pillars", key: "items", label: "Sustainability Pillars Cards", type: "textarea", value: "[]", isRepeater: true },
    { section: "esg", key: "carbon_offset", label: "Carbon Offset Target", type: "text", value: "14,500 Tons CO2e" },
    { section: "esg", key: "trees_planted", label: "Trees Planted", type: "text", value: "120,000+ Native Trees" },
    { section: "esg", key: "farmer_families", label: "Smallholders Supported", type: "text", value: "450+ Families" },
    { section: "esg", key: "water_recycled", label: "Irrigation Efficiency", type: "text", value: "92% Water Conservation" },
  ],

  insights: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Insights & News" },
    { section: "hero", key: "title", label: "Insights Page Title", type: "text", value: "Agriculture, investment education and company updates" },
    { section: "hero", key: "intro", label: "Insights Page Intro", type: "textarea", value: "Plain-language writing from our agronomy, sustainability and investor relations teams — plus verified company and project updates." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
  ],

  legal: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Investor Relations · Legal & Compliance" },
    { section: "hero", key: "title", label: "Legal Page Title", type: "text", value: "Registration, compliance and how to read our disclosures" },
    { section: "hero", key: "intro", label: "Legal Page Intro", type: "textarea", value: "Trust starts with paperwork you can check. This section publishes CDP's registration details, documents and statutory disclosures." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "legal_docs", key: "items", label: "Statutory Legal Documents List", type: "textarea", value: "[]", isRepeater: true },
    { section: "terms", key: "title", label: "Terms Title", type: "text", value: "Terms & Conditions" },
    { section: "terms", key: "content", label: "Terms Content", type: "textarea", value: "Participation terms and agreement governance details." },
    { section: "privacy", key: "title", label: "Privacy Policy Title", type: "text", value: "Privacy Policy" },
    { section: "privacy", key: "content", label: "Privacy Policy Content", type: "textarea", value: "How investor information and user data is processed and protected." },
  ],

  contact: [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Contact & Inquiries" },
    { section: "hero", key: "title", label: "Contact Page Title", type: "text", value: "Direct lines to our plantation and investor desks" },
    { section: "hero", key: "intro", label: "Contact Page Intro", type: "textarea", value: "Whether you represent an institutional fund, an individual investor, or are seeking agronomy support, our offices are open." },
    { section: "headquarters", key: "title", label: "Headquarters Title", type: "text", value: "Corporate Headquarters" },
    { section: "headquarters", key: "address", label: "Headquarters Address", type: "textarea", value: "No. 42, Plantation Avenue, Colombo 03, Sri Lanka" },
    { section: "headquarters", key: "phone", label: "Headquarters Phone", type: "text", value: "+94 11 234 5678" },
    { section: "headquarters", key: "email", label: "Headquarters Email", type: "text", value: "info@cdp.lk" },
    { section: "headquarters", key: "hours", label: "Operating Hours", type: "text", value: "Monday – Friday: 8:30 AM – 5:00 PM" },
    { section: "departments", key: "items", label: "Department Directory", type: "textarea", value: "[]", isRepeater: true },
  ],

  "investor-login": [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Investor Portal" },
    { section: "hero", key: "title", label: "Portal Heading", type: "text", value: "Secure access to your plantation participations" },
    { section: "hero", key: "intro", label: "Portal Subtitle", type: "textarea", value: "A dedicated space for CDP investors — kept strictly separate from the public website." },
    { section: "notice", key: "preview_notice", label: "Demonstration Environment Notice", type: "textarea", value: "The investor portal is in preview mode. Please contact investor relations to request access, or reach us on WhatsApp." },
    { section: "benefits", key: "items", label: "Portal Benefits List", type: "textarea", value: "[]", isRepeater: true },
  ],

  "investor-relations": [
    { section: "hero", key: "eyebrow", label: "Hero Eyebrow", type: "text", value: "Investor Relations" },
    { section: "hero", key: "title", label: "Page Title", type: "text", value: "Clarity and accountability for every investor" },
    { section: "hero", key: "intro", label: "Page Intro", type: "textarea", value: "Where CDP investors find portal access, disclosures, reporting and the people responsible for answering their questions." },
    { section: "hero", key: "banner_image", label: "Hero Banner Image URL", type: "image", value: "" },
    { section: "quick_access", key: "items", label: "Quick Access Cards", type: "textarea", value: "[]", isRepeater: true },
    { section: "commitments", key: "items", label: "Investor Commitments List", type: "textarea", value: "[]", isRepeater: true },
  ],

  "my-investments": [
    { section: "hero", key: "badge", label: "Security Badge", type: "text", value: "Investor Security Portal" },
    { section: "hero", key: "title", label: "Lookup Heading", type: "text", value: "Check Your Investment Details" },
    { section: "hero", key: "intro", label: "Lookup Subtitle", type: "textarea", value: "Verify your active plantation portfolio, projected returns schedule and asset allocation with Ceylon Development Plantation (Pvt) Ltd." },
  ],

  global: [
    { section: "company", key: "name", label: "Company Legal Name", type: "text", value: "Ceylon Development Plantation (Pvt) Ltd" },
    { section: "company", key: "registration_number", label: "Registration Number", type: "text", value: "PV-00284719" },
    { section: "company", key: "description", label: "Brand Short Description", type: "textarea", value: "A professionally managed Sri Lankan plantation and agro-investment company focused on sustainable agriculture, transparent structures and long-term value creation." },
    { section: "contact", key: "primary_phone", label: "Primary Phone Number", type: "text", value: "+94 11 234 5678" },
    { section: "contact", key: "secondary_phone", label: "Secondary Hotline", type: "text", value: "+94 77 123 4567" },
    { section: "contact", key: "whatsapp_number", label: "Official WhatsApp Number", type: "text", value: "94744123087" },
    { section: "contact", key: "primary_email", label: "Primary Contact Email", type: "text", value: "info@cdp.lk" },
    { section: "contact", key: "careers_email", label: "Careers Inquiries Email", type: "text", value: "careers@cdp.lk" },
    { section: "contact", key: "address_line1", label: "Address Line 1", type: "text", value: "No. 42, Plantation Avenue" },
    { section: "contact", key: "address_city", label: "Address City", type: "text", value: "Colombo 03, Sri Lanka" },
    { section: "social", key: "linkedin_url", label: "LinkedIn URL", type: "link", value: "https://linkedin.com/company/ceylon-development-plantation" },
    { section: "social", key: "facebook_url", label: "Facebook URL", type: "link", value: "https://facebook.com/cdp.plantation" },
    { section: "social", key: "instagram_url", label: "Instagram URL", type: "link", value: "https://instagram.com/ceylondevelopment" },
    { section: "social", key: "youtube_url", label: "YouTube URL", type: "link", value: "https://youtube.com/@cdp-plantation" },
    { section: "footer", key: "copyright_text", label: "Footer Copyright Text", type: "text", value: "© 2026 Ceylon Development Plantation (Pvt) Ltd. All rights reserved." },
  ],
};
