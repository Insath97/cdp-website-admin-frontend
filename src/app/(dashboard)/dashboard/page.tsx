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
  MessageSquare,
  Briefcase,
  FileText,
  Newspaper,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Trophy,
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
  // Public website metrics
  total_inquiries: number;
  total_applications: number;
  total_careers: number;
  total_articles: number;
  total_branches: number;
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
        const [dashRes, contactsRes, appsRes, careersRes, eventsRes, branchesRes] =
          await Promise.allSettled([
            apiClient.get("/dashboard"),
            apiClient.get("/contacts"),
            apiClient.get("/career-applications"),
            apiClient.get("/careers"),
            apiClient.get("/events"),
            apiClient.get("/branches"),
          ]);

        let totalUsers = 0;
        let activeUsers = 0;
        let totalRoles = 0;
        let totalPerms = 0;
        let recentLogs: ActivityLog[] = [];

        if (dashRes.status === "fulfilled" && dashRes.value.data.status === "success") {
          const d = dashRes.value.data.data;
          const cards = d?.cards || d || {};
          totalUsers = cards.total_users ?? d?.total_users ?? 0;
          activeUsers = cards.active_users ?? d?.active_users ?? 0;
          totalRoles = cards.total_roles ?? d?.total_roles ?? 0;
          totalPerms = cards.total_permissions ?? d?.total_permissions ?? 0;
          recentLogs = d?.recent_activity_logs || [];
        }

        const countItems = (res: PromiseSettledResult<any>) => {
          if (res.status !== "fulfilled") return 0;
          const data = res.value.data?.data;
          if (Array.isArray(data)) return data.length;
          if (data && Array.isArray(data.data)) return data.data.length;
          if (typeof data?.total === "number") return data.total;
          return 0;
        };

        setStats({
          total_users: totalUsers,
          active_users: activeUsers,
          total_roles: totalRoles,
          total_permissions: totalPerms,
          recent_activity_logs: recentLogs,
          total_inquiries: countItems(contactsRes),
          total_applications: countItems(appsRes),
          total_careers: countItems(careersRes),
          total_articles: countItems(eventsRes),
          total_branches: countItems(branchesRes),
        });
      } catch {
        // Keep null stats
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

  const websiteEngagementCards = useMemo(() => [
    {
      label: "Inquiries Received",
      value: stats?.total_inquiries ?? 0,
      icon: MessageSquare,
      color: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600",
      path: "/contacts",
    },
    {
      label: "Job Applications",
      value: stats?.total_applications ?? 0,
      icon: FileText,
      color: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-600",
      path: "/career-applications",
    },
    {
      label: "Published Articles",
      value: stats?.total_articles ?? 0,
      icon: Newspaper,
      color: "bg-indigo-50 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600",
      path: "/blogs",
    },
    {
      label: "Active Branches",
      value: stats?.total_branches ?? 0,
      icon: MapPin,
      color: "bg-rose-50 dark:bg-rose-900/30",
      iconColor: "text-rose-600",
      path: "/branches",
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
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            Live Website Portal
          </a>
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
      </div>

      {/* Website Engagement Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400">
            Website Engagement & Content
          </h2>
          {hasPermission("CMS Index") && (
            <button
              onClick={() => router.push("/cms")}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              CMS Manager <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {websiteEngagementCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                onClick={() => router.push(card.path)}
                className="group cursor-pointer rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-3 text-2xl font-bold text-text-primary dark:text-white">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-text-muted dark:text-gray-400">{card.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-3">
          Access Control & System Overview
        </h2>
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
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-text-primary dark:text-white">
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hasPermission("CMS Index") && (
              <button
                onClick={() => router.push("/cms")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">CMS Content</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Edit all 20 pages</p>
                </div>
              </button>
            )}
            {hasPermission("Event Index") && (
              <button
                onClick={() => router.push("/blogs")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  <Newspaper className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Blogs / Insights</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Manage news articles</p>
                </div>
              </button>
            )}
            {hasPermission("Branch Index") && (
              <button
                onClick={() => router.push("/branches")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30">
                  <MapPin className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Branches</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Network locations</p>
                </div>
              </button>
            )}
            {hasPermission("Award Index") && (
              <button
                onClick={() => router.push("/awards")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Trophy className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Awards</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Recognition & stage</p>
                </div>
              </button>
            )}
            {hasPermission("Contact Index") && (
              <button
                onClick={() => router.push("/contacts")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/30">
                  <MessageSquare className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Inquiries</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Incoming inquiries</p>
                </div>
              </button>
            )}
            {hasPermission("Career Index") && (
              <button
                onClick={() => router.push("/careers")}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                  <Briefcase className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-white">Careers</p>
                  <p className="text-[10px] text-text-muted dark:text-gray-500">Job postings</p>
                </div>
              </button>
            )}
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
