export const PERMISSIONS = {
  DASHBOARD: {
    INDEX: "Dashboard Index",
  },
  USER: {
    INDEX: "User Index",
    CREATE: "User Create",
    UPDATE: "User Update",
    DELETE: "User Delete",
  },
  ROLE: {
    INDEX: "Role Index",
    CREATE: "Role Create",
    UPDATE: "Role Update",
    DELETE: "Role Delete",
  },
  PERMISSION: {
    INDEX: "Permission Index",
    CREATE: "Permission Create",
    UPDATE: "Permission Update",
    DELETE: "Permission Delete",
  },
  ACTIVITY_LOG: {
    INDEX: "Activity Log Index",
    SHOW: "Activity Log Show",
  },
  CMS: {
    INDEX: "CMS Index",
    UPDATE: "CMS Update",
  },
  CONTACT: {
    INDEX: "Contact Index",
    SHOW: "Contact Show",
    REPLY: "Contact Reply",
    DELETE: "Contact Delete",
  },
  CONTACT_TYPE: {
    INDEX: "Contact Type Index",
    CREATE: "Contact Type Create",
    UPDATE: "Contact Type Update",
    DELETE: "Contact Type Delete",
  },
  BRANCH: {
    INDEX: "Branch Index",
    CREATE: "Branch Create",
    UPDATE: "Branch Update",
    DELETE: "Branch Delete",
  },
  SETTING: {
    INDEX: "Setting Index",
    UPDATE: "Setting Update",
    EXPORT: "Database Export",
  },
  SERVICE: {
    INDEX: "Service Index",
    CREATE: "Service Create",
    UPDATE: "Service Update",
    DELETE: "Service Delete",
    TOGGLE: "Service Toggle Active",
  },
  EVENT: {
    INDEX: "Event Index",
    CREATE: "Event Create",
    UPDATE: "Event Update",
    DELETE: "Event Delete",
    SOFT_DELETE: "Event Soft Delete",
    FORCE_DELETE: "Event Force Delete",
    RESTORE: "Event Restore",
    TOGGLE: "Event Toggle Active",
    APPROVE: "Event Approve",
  },
  PLAN: {
    INDEX: "Plan Index",
    CREATE: "Plan Create",
    UPDATE: "Plan Update",
    DELETE: "Plan Delete",
    TOGGLE: "Plan Toggle Active",
  },
  CAREER: {
    INDEX: "Career Index",
    CREATE: "Career Create",
    UPDATE: "Career Update",
    DELETE: "Career Delete",
    SOFT_DELETE: "Career Soft Delete",
    FORCE_DELETE: "Career Force Delete",
    RESTORE: "Career Restore",
    TOGGLE: "Career Toggle Active",
  },
  CAREER_APPLICATION: {
    INDEX: "Career Application Index",
    SHOW: "Career Application Show",
    UPDATE_STATUS: "Career Application Update Status",
  },
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((module) =>
  Object.values(module)
);

export const PERMISSION_GROUPS = [
  {
    name: "Access Management Permissions",
    permissions: [
      { id: "Permission Index", name: "Permission Index", description: "View permissions", group: "Access Management Permissions" },
      { id: "Permission Create", name: "Permission Create", description: "Create permissions", group: "Access Management Permissions" },
      { id: "Permission Update", name: "Permission Update", description: "Update permissions", group: "Access Management Permissions" },
      { id: "Permission Delete", name: "Permission Delete", description: "Delete permissions", group: "Access Management Permissions" },
      { id: "Role Index", name: "Role Index", description: "View roles", group: "Access Management Permissions" },
      { id: "Role Create", name: "Role Create", description: "Create roles", group: "Access Management Permissions" },
      { id: "Role Update", name: "Role Update", description: "Update roles", group: "Access Management Permissions" },
      { id: "Role Delete", name: "Role Delete", description: "Delete roles", group: "Access Management Permissions" },
      { id: "Dashboard Index", name: "Dashboard Index", description: "View dashboard", group: "Access Management Permissions" },
    ],
  },
  {
    name: "User Permissions",
    permissions: [
      { id: "User Index", name: "User Index", description: "View users", group: "User Permissions" },
      { id: "User Create", name: "User Create", description: "Create users", group: "User Permissions" },
      { id: "User Update", name: "User Update", description: "Update users", group: "User Permissions" },
      { id: "User Delete", name: "User Delete", description: "Delete users", group: "User Permissions" },
    ],
  },
  {
    name: "Activity Log Permissions",
    permissions: [
      { id: "Activity Log Index", name: "Activity Log Index", description: "View activity logs", group: "Activity Log Permissions" },
      { id: "Activity Log Show", name: "Activity Log Show", description: "View activity log details", group: "Activity Log Permissions" },
    ],
  },
  {
    name: "CMS Management Permissions",
    permissions: [
      { id: "CMS Index", name: "CMS Index", description: "View CMS content", group: "CMS Management Permissions" },
      { id: "CMS Update", name: "CMS Update", description: "Update CMS content", group: "CMS Management Permissions" },
    ],
  },
  {
    name: "Contact Permissions",
    permissions: [
      { id: "Contact Index", name: "Contact Index", description: "View contacts", group: "Contact Permissions" },
      { id: "Contact Show", name: "Contact Show", description: "View contact details", group: "Contact Permissions" },
      { id: "Contact Reply", name: "Contact Reply", description: "Reply to contacts", group: "Contact Permissions" },
      { id: "Contact Delete", name: "Contact Delete", description: "Delete contacts", group: "Contact Permissions" },
    ],
  },
  {
    name: "Contact Type Permissions",
    permissions: [
      { id: "Contact Type Index", name: "Contact Type Index", description: "View contact types", group: "Contact Type Permissions" },
      { id: "Contact Type Create", name: "Contact Type Create", description: "Create contact types", group: "Contact Type Permissions" },
      { id: "Contact Type Update", name: "Contact Type Update", description: "Update contact types", group: "Contact Type Permissions" },
      { id: "Contact Type Delete", name: "Contact Type Delete", description: "Delete contact types", group: "Contact Type Permissions" },
    ],
  },
  {
    name: "Branch Permissions",
    permissions: [
      { id: "Branch Index", name: "Branch Index", description: "View branches", group: "Branch Permissions" },
      { id: "Branch Create", name: "Branch Create", description: "Create branches", group: "Branch Permissions" },
      { id: "Branch Update", name: "Branch Update", description: "Update branches", group: "Branch Permissions" },
      { id: "Branch Delete", name: "Branch Delete", description: "Delete branches", group: "Branch Permissions" },
    ],
  },
  {
    name: "Setting Permissions",
    permissions: [
      { id: "Setting Index", name: "Setting Index", description: "View settings", group: "Setting Permissions" },
      { id: "Setting Update", name: "Setting Update", description: "Update settings", group: "Setting Permissions" },
      { id: "Database Export", name: "Database Export", description: "Export database", group: "Setting Permissions" },
    ],
  },
  {
    name: "Service Permissions",
    permissions: [
      { id: "Service Index", name: "Service Index", description: "View services", group: "Service Permissions" },
      { id: "Service Create", name: "Service Create", description: "Create services", group: "Service Permissions" },
      { id: "Service Update", name: "Service Update", description: "Update services", group: "Service Permissions" },
      { id: "Service Delete", name: "Service Delete", description: "Delete services", group: "Service Permissions" },
      { id: "Service Toggle Active", name: "Service Toggle Active", description: "Toggle service status", group: "Service Permissions" },
    ],
  },
  {
    name: "Event Permissions",
    permissions: [
      { id: "Event Index", name: "Event Index", description: "View events", group: "Event Permissions" },
      { id: "Event Create", name: "Event Create", description: "Create events", group: "Event Permissions" },
      { id: "Event Update", name: "Event Update", description: "Update events", group: "Event Permissions" },
      { id: "Event Delete", name: "Event Delete", description: "Delete events", group: "Event Permissions" },
      { id: "Event Soft Delete", name: "Event Soft Delete", description: "Soft delete events", group: "Event Permissions" },
      { id: "Event Force Delete", name: "Event Force Delete", description: "Force delete events", group: "Event Permissions" },
      { id: "Event Restore", name: "Event Restore", description: "Restore deleted events", group: "Event Permissions" },
      { id: "Event Toggle Active", name: "Event Toggle Active", description: "Toggle event status", group: "Event Permissions" },
      { id: "Event Approve", name: "Event Approve", description: "Approve/reject events", group: "Event Permissions" },
    ],
  },
  {
    name: "Plan Permissions",
    permissions: [
      { id: "Plan Index", name: "Plan Index", description: "View plans", group: "Plan Permissions" },
      { id: "Plan Create", name: "Plan Create", description: "Create plans", group: "Plan Permissions" },
      { id: "Plan Update", name: "Plan Update", description: "Update plans", group: "Plan Permissions" },
      { id: "Plan Delete", name: "Plan Delete", description: "Delete plans", group: "Plan Permissions" },
      { id: "Plan Toggle Active", name: "Plan Toggle Active", description: "Toggle plan status", group: "Plan Permissions" },
    ],
  },
  {
    name: "Career Permissions",
    permissions: [
      { id: "Career Index", name: "Career Index", description: "View careers", group: "Career Permissions" },
      { id: "Career Create", name: "Career Create", description: "Create careers", group: "Career Permissions" },
      { id: "Career Update", name: "Career Update", description: "Update careers", group: "Career Permissions" },
      { id: "Career Delete", name: "Career Delete", description: "Delete careers", group: "Career Permissions" },
      { id: "Career Soft Delete", name: "Career Soft Delete", description: "Soft delete careers", group: "Career Permissions" },
      { id: "Career Force Delete", name: "Career Force Delete", description: "Force delete careers", group: "Career Permissions" },
      { id: "Career Restore", name: "Career Restore", description: "Restore deleted careers", group: "Career Permissions" },
      { id: "Career Toggle Active", name: "Career Toggle Active", description: "Toggle career status", group: "Career Permissions" },
    ],
  },
  {
    name: "Career Application Permissions",
    permissions: [
      { id: "Career Application Index", name: "Career Application Index", description: "View applications", group: "Career Application Permissions" },
      { id: "Career Application Show", name: "Career Application Show", description: "View application details", group: "Career Application Permissions" },
      { id: "Career Application Update Status", name: "Career Application Update Status", description: "Update application status", group: "Career Application Permissions" },
    ],
  },
];
