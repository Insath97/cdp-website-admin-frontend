export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  is_active: boolean;
  can_login: boolean;
  profile_image: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  group_name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactType {
  id: number;
  name: string;
  code: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  contact_type_id: number;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  is_replied: boolean;
  replied_by: number | null;
  created_at: string;
  updated_at: string;
  contact_type?: ContactType;
}

export interface Service {
  id: number;
  imagepath: string | null;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  created_date: string;
  created_by: number;
  thumbnail_image: string | null;
  url: string | null;
  description: string;
  is_active: boolean;
  status: "pending" | "approved" | "rejected";
  decision_by: number | null;
  decision_at: string | null;
  rejected_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  galleries?: EventGallery[];
  tags?: Tag[];
  created_by_user?: User;
}

export interface EventGallery {
  id: number;
  event_id: number;
  image_path: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Plan {
  id: number;
  image: string | null;
  maintitle: string;
  subtitle: string;
  short_description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  features?: PlanFeature[];
}

export interface PlanFeature {
  id: number;
  plan_id: number;
  feature: string;
}

export interface Career {
  id: number;
  title: string;
  slug: string;
  description: string;
  poster_image: string | null;
  department: string;
  location: string;
  job_type: string;
  due_date: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  responsibilities?: { id: number; name: string }[];
  requirements?: { id: number; name: string }[];
  benefits?: { id: number; name: string }[];
  applications_count?: number;
}

export interface CareerApplication {
  id: number;
  application_code: string;
  career_id: number;
  fullname: string;
  email: string;
  phone_number: string;
  resume_path: string;
  cover_letter: string;
  status: string;
  created_at: string;
  updated_at: string;
  career?: Career;
}

export interface CmsContent {
  id: number;
  page: string;
  section: string;
  key: string;
  value: string;
  type: string;
  label: string;
  metadata: Record<string, unknown> | null;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  module: string;
  description: string;
  payload: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: User;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
}

export interface DashboardData {
  total_users: number;
  active_users: number;
  total_roles: number;
  total_permissions: number;
  recent_activity_logs: ActivityLog[];
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type Theme = "light" | "dark";

export interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}
