"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Shield,
  Key,
  ClipboardList,
  TrendingUp,
  Activity,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/types";

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_roles: number;
  total_permissions: number;
  recent_activity_logs: ActivityLog[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await apiClient.get("/dashboard");
        if (response.data.status === "success") {
          const d = response.data.data;
          const cards = d?.cards || d || {};
          setStats({
            total_users: cards.total_users ?? d?.total_users ?? 0,
            active_users: cards.active_users ?? d?.active_users ?? 0,
            total_roles: cards.total_roles ?? d?.total_roles ?? 0,
            total_permissions: cards.total_permissions ?? d?.total_permissions ?? 0,
            recent_activity_logs: d?.recent_activity_logs || [],
          });
        }
      } catch {
        // Fallback: try individual endpoints
        try {
          const [usersRes, rolesRes, permRes, logsRes] = await Promise.allSettled([
            apiClient.get("/users"),
            apiClient.get("/roles"),
            apiClient.get("/permissions"),
            apiClient.get("/activity-logs"),
          ]);

          const totalUsers = usersRes.status === "fulfilled" ? (usersRes.value.data.data?.data?.length || usersRes.value.data.data?.length || 0) : 0;
          const totalRoles = rolesRes.status === "fulfilled" ? (rolesRes.value.data.data?.data?.length || rolesRes.value.data.data?.length || 0) : 0;
          const totalPerms = permRes.status === "fulfilled" ? (permRes.value.data.data?.data?.length || permRes.value.data.data?.length || 0) : 0;
          const logs = logsRes.status === "fulfilled" ? (logsRes.value.data.data?.data || logsRes.value.data.data || []) : [];

          setStats({
            total_users: totalUsers,
            active_users: totalUsers,
            total_roles: totalRoles,
            total_permissions: totalPerms,
            recent_activity_logs: Array.isArray(logs) ? logs.slice(0, 5) : [],
          });
        } catch {
          // Keep null stats
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const statCards = useMemo(() => [
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Users",
      value: stats?.active_users ?? 0,
      icon: Activity,
      color: "bg-green-50 dark:bg-green-900/30",
      iconColor: "text-green-600",
    },
    {
      label: "Total Roles",
      value: stats?.total_roles ?? 0,
      icon: Shield,
      color: "bg-violet-50 dark:bg-violet-900/30",
      iconColor: "text-violet-600",
    },
    {
      label: "Permissions",
      value: stats?.total_permissions ?? 0,
      icon: Key,
      color: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Welcome back, {user?.name || "Administrator"}
          </p>
        </div>
        <div className="hidden items-center sm:flex">
          <div className="rounded-lg border border-border bg-surface px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-text-muted dark:text-gray-400">
                  {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-lg font-bold tabular-nums text-primary">
                  {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
              <div className="h-8 w-px bg-border dark:bg-gray-700" />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  Active
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-text-primary dark:text-white">
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-text-primary dark:text-white">
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hasPermission("User Index") && (
              <button
                onClick={() => router.push("/users")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Users</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Manage users</p>
                </div>
              </button>
            )}
            {hasPermission("Role Index") && (
              <button
                onClick={() => router.push("/roles")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
                  <Shield className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Roles</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Manage roles</p>
                </div>
              </button>
            )}
            {hasPermission("Permission Index") && (
              <button
                onClick={() => router.push("/permissions")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Key className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Permissions</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">View permissions</p>
                </div>
              </button>
            )}
            {hasPermission("Activity Log Index") && (
              <button
                onClick={() => router.push("/audit-logs")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30">
                  <ClipboardList className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Activity Logs</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">View system logs</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary dark:text-white">
              Recent Activity
            </h3>
            {hasPermission("Activity Log Index") && (
              <button
                onClick={() => router.push("/audit-logs")}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {stats?.recent_activity_logs && stats.recent_activity_logs.length > 0 ? (
              stats.recent_activity_logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-text-primary dark:text-white">
                      {log.description}
                    </p>
                    <p className="text-[10px] text-text-muted dark:text-gray-500">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted dark:text-gray-500">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
