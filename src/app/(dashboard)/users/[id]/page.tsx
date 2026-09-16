"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

function ViewUserContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}`);
      setUser(response.data.data);
    } catch {
      toast("Failed to load user", "error");
      router.push("/users");
    } finally {
      setLoading(false);
    }
  }, [userId, toast, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">User Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View user information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/users" className="hover:text-primary">Users</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* User Info */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Name</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Email</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Username</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Role</span>
            <span className="text-sm font-medium text-primary">{user.roles?.[0]?.name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Status</span>
            <span className={`text-sm font-medium ${user.is_active ? "text-green-600" : "text-gray-500"}`}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Can Login</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{user.can_login ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Last Login</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">
              {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="User Index">
      <ViewUserContent userId={id} />
    </PermissionGuard>
  );
}
