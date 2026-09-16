"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Edit, Building2, MapPin, Hash, CheckCircle2, XCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Branch } from "@/types";

function ViewBranchContent({ branchId }: { branchId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBranch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/branches/${branchId}`);
      setBranch(response.data.data);
    } catch {
      toast("Failed to load branch", "error");
      router.push("/branches");
    } finally {
      setLoading(false);
    }
  }, [branchId, toast, router]);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Branch Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View branch information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/branches" className="hover:text-primary">Branches</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{branch.name}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">Branch Code: {branch.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                branch.is_active
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {branch.is_active ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {branch.is_active ? "Active" : "Inactive"}
            </span>
            {hasPermission("Branch Update") && (
              <button
                onClick={() => router.push(`/branches/${branch.id}/edit`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" />
                Edit Branch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Basic Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Branch Name</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{branch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Hash className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Branch Code</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{branch.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <MapPin className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">City</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{branch.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address & Status */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Address & Status</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Full Address</p>
              <p className="text-sm text-text-primary dark:text-white">{branch.address}</p>
            </div>
            <div className="border-t border-border pt-4 dark:border-gray-700">
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Status</p>
              <p className={`text-sm font-medium ${branch.is_active ? "text-green-600" : "text-gray-500"}`}>
                {branch.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="border-t border-border pt-4 dark:border-gray-700">
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Created At</p>
              <p className="text-sm text-text-primary dark:text-white">
                {new Date(branch.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Branch Index">
      <ViewBranchContent branchId={id} />
    </PermissionGuard>
  );
}
