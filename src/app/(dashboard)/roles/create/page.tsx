"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check, Search, X } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Permission } from "@/types";

function CreateRoleContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", permissions: [] as number[] });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permSearch, setPermSearch] = useState("");

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/permissions/list");
      const data = response.data.data;
      setAllPermissions(Array.isArray(data) ? data : []);
    } catch {
      toast("Failed to load permissions", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const groupNames = [...new Set(allPermissions.map((p) => p.group_name))].sort();

  const filteredPermissions = allPermissions.filter(
    (p) =>
      !permSearch ||
      p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.group_name.toLowerCase().includes(permSearch.toLowerCase())
  );

  const groupedPermissions = groupNames
    .map((name) => ({
      name,
      permissions: filteredPermissions.filter((p) => p.group_name === name),
    }))
    .filter((g) => g.permissions.length > 0);

  const togglePermission = (permId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const toggleGroup = (permIds: number[]) => {
    const allSelected = permIds.every((id) => formData.permissions.includes(id));
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((id) => !permIds.includes(id))
        : [...new Set([...prev.permissions, ...permIds])],
    }));
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      await apiClient.post("/roles", {
        name: formData.name,
        permissions: formData.permissions,
      });
      toast("Role created successfully", "success");
      router.push("/roles");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to create role", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Create Role</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Add a new role with permission assignment</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/roles" className="hover:text-primary">Roles</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Create</span>
        </nav>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter role name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
        </div>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white">Permissions</h2>
          <span className="text-xs text-text-muted dark:text-gray-400">
            {formData.permissions.length} selected
          </span>
        </div>

        {/* Permission Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={permSearch}
            onChange={(e) => setPermSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {permSearch && (
            <button
              onClick={() => setPermSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {groupedPermissions.map((group) => {
              const permIds = group.permissions.map((p) => p.id);
              const allSelected = permIds.every((id) => formData.permissions.includes(id));
              const someSelected = permIds.some((id) => formData.permissions.includes(id));
              return (
                <div key={group.name} className="rounded-lg border border-border p-3 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleGroup(permIds)}
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        allSelected
                          ? "border-primary bg-primary text-white"
                          : someSelected
                            ? "border-primary bg-primary/20"
                            : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {allSelected && <Check className="h-3 w-3" />}
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400">
                      {group.name}
                    </span>
                    <span className="text-xs text-text-muted dark:text-gray-500">
                      ({group.permissions.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.permissions.map((perm) => (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                          formData.permissions.includes(perm.id)
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-gray-100 text-gray-600 border border-transparent dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {formData.permissions.includes(perm.id) && <Check className="h-3 w-3" />}
                        {perm.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/roles")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.name}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Create Role
        </button>
      </div>
    </div>
  );
}

export default function CreateRolePage() {
  return (
    <PermissionGuard permission="Role Create">
      <CreateRoleContent />
    </PermissionGuard>
  );
}
