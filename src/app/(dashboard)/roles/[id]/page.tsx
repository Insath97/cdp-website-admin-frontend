"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Role } from "@/types";

function ViewRoleContent({ roleId }: { roleId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/roles/${roleId}`);
      setRole(response.data.data);
    } catch {
      toast("Failed to load role", "error");
      router.push("/roles");
    } finally {
      setLoading(false);
    }
  }, [roleId, toast, router]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Role Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View role information and assigned permissions</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/roles" className="hover:text-primary">Roles</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Role Info */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Name</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{role.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Guard</span>
            <span className="text-sm font-medium text-text-primary dark:text-white">{role.guard_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted dark:text-gray-400">Permissions</span>
            <span className="text-sm font-medium text-primary">{role.permissions?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Assigned Permissions */}
      {role.permissions && role.permissions.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Assigned Permissions</h2>
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((p) => (
              <span key={p.id} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Role Index">
      <ViewRoleContent roleId={id} />
    </PermissionGuard>
  );
}
