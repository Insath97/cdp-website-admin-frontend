import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  ClipboardList,
  Settings,
  Globe,
  MessageSquare,
  Tag,
  Building2,
  Cpu,
  Calendar,
  Target,
  Briefcase,
  FileText,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "Dashboard Index",
      },
    ],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      {
        label: "CMS",
        href: "/cms",
        icon: Globe,
        permission: "CMS Index",
      },
    ],
  },
  {
    title: "ENGAGEMENT",
    items: [
      {
        label: "Blogs",
        href: "/blogs",
        icon: FileText,
        permission: "Blog Index",
      },
    ],
  },
  {
    title: "CAREERS",
    items: [
      {
        label: "Manage Jobs",
        href: "/careers",
        icon: Briefcase,
        permission: "Career Index",
      },
      {
        label: "Applications",
        href: "/career-applications",
        icon: FileText,
        permission: "Career Application Index",
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        label: "Contacts",
        href: "/contacts",
        icon: MessageSquare,
        permission: "Contact Index",
      },
    ],
  },
  {
    title: "ORGANIZATION",
    items: [
      {
        label: "Branches",
        href: "/branches",
        icon: Building2,
        permission: "Branch Index",
      },
      {
        label: "Services",
        href: "/services",
        icon: Cpu,
        permission: "Service Index",
      },
      {
        label: "Plans",
        href: "/plans",
        icon: Target,
        permission: "Plan Index",
      },
      {
        label: "Contact Types",
        href: "/contact-types",
        icon: Tag,
        permission: "Contact Type Index",
      },
    ],
  },
  {
    title: "ACCESS CONTROL",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        permission: "User Index",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: Shield,
        permission: "Role Index",
      },
      {
        label: "Permissions",
        href: "/permissions",
        icon: Key,
        permission: "Permission Index",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Activity Logs",
        href: "/audit-logs",
        icon: ClipboardList,
        permission: "Activity Log Index",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "Setting Index",
      },
    ],
  },
];
