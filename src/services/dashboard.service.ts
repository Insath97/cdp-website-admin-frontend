import apiClient from "@/lib/api-client";

export interface DashboardStats {
  users: number;
  roles: number;
  permissions: number;
  activityLogs: number;
}

export const dashboardService = {
  getDashboard: async () => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const [users, roles, permissions, activityLogs] = await Promise.all([
      apiClient.get("/users"),
      apiClient.get("/roles"),
      apiClient.get("/permissions"),
      apiClient.get("/activity-logs"),
    ]);

    return {
      users: users.data?.data?.length || 0,
      roles: roles.data?.data?.length || 0,
      permissions: permissions.data?.data?.length || 0,
      activityLogs: activityLogs.data?.data?.length || 0,
    };
  },
};

export default dashboardService;
