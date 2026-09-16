export { authService } from "./auth.service";
export { dashboardService } from "./dashboard.service";
export { branchService } from "./branch.service";
export { userService } from "./user.service";
export { roleService } from "./role.service";
export { permissionService } from "./permission.service";
export { contactTypeService } from "./contact-type.service";
export { contactService } from "./contact.service";
export { serviceService } from "./service.service";
export { planService } from "./plan.service";
export { activityLogService } from "./activity-log.service";

export type {
  Branch,
  BranchListResponse,
  BranchQueryParams,
} from "./branch.service";

export type {
  User,
  UserListResponse,
  UserQueryParams,
} from "./user.service";

export type {
  Role,
  RoleListResponse,
  RoleQueryParams,
} from "./role.service";

export type {
  Permission,
  PermissionListResponse,
  PermissionQueryParams,
} from "./permission.service";

export type {
  ContactType,
  ContactTypeListResponse,
  ContactTypeQueryParams,
} from "./contact-type.service";

export type {
  Contact,
  ContactListResponse,
  ContactQueryParams,
} from "./contact.service";

export type {
  Service,
  ServiceListResponse,
  ServiceQueryParams,
} from "./service.service";

export type {
  Plan,
  PlanListResponse,
  PlanQueryParams,
} from "./plan.service";

export type {
  ActivityLog,
  ActivityLogListResponse,
  ActivityLogQueryParams,
} from "./activity-log.service";
