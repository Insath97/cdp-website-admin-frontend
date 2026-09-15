"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Loader2,
  Check,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSION_GROUPS } from "@/lib/constants";
import type { Role, Permission } from "@/types";

function RolesContent() {
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/roles");
      const data = response.data.data;
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await apiClient.get("/permissions");
      const data = response.data.data;
      setAllPermissions(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setAllPermissions([]);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      await apiClient.post("/roles", {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });
      setShowCreateModal(false);
      resetForm();
      fetchRoles();
      toast("Role created successfully", "success");
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

  const handleUpdate = async () => {
    if (!selectedRole) return;
    setFormErrors({});
    setSubmitting(true);
    try {
      await apiClient.put(`/roles/${selectedRole.id}`, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });
      setShowEditModal(false);
      resetForm();
      fetchRoles();
      toast("Role updated successfully", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update role", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) return;
    try {
      await apiClient.delete(`/roles/${role.id}`);
      fetchRoles();
      toast("Role deleted successfully", "success");
    } catch {
      toast("Failed to delete role", "error");
    }
  };

  const openEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions?.map((p) => p.name) || [],
    });
    setShowEditModal(true);
    setActionMenuId(null);
  };

  const openView = (role: Role) => {
    setSelectedRole(role);
    setShowViewModal(true);
    setActionMenuId(null);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: [] });
    setFormErrors({});
    setSelectedRole(null);
  };

  const togglePermission = (permName: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter((p) => p !== permName)
        : [...prev.permissions, permName],
    }));
  };

  const toggleGroup = (groupPermissions: { name: string }[]) => {
    const names = groupPermissions.map((p) => p.name);
    const allSelected = names.every((n) => formData.permissions.includes(n));
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !names.includes(p))
        : [...new Set([...prev.permissions, ...names])],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Roles</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Manage roles and permission assignment</p>
        </div>
        {hasPermission("Role Create") && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={fetchRoles}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-text-muted dark:text-gray-400">
          No roles found
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-border bg-surface p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-white">{role.name}</h3>
                  <p className="mt-1 text-xs text-text-muted dark:text-gray-400">
                    {role.description || "No description"}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActionMenuId(actionMenuId === role.id ? null : role.id)}
                    className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {actionMenuId === role.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        onClick={() => openView(role)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {hasPermission("Role Update") && (
                        <button
                          onClick={() => openEdit(role)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                      )}
                      {hasPermission("Role Delete") && (
                        <button
                          onClick={() => { handleDelete(role); setActionMenuId(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-text-muted dark:text-gray-400">
                <span>{role.permissions?.length || 0} permissions</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                {showCreateModal ? "Create Role" : "Edit Role"}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Permissions</label>
                <div className="space-y-3">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPermNames = group.permissions.map((p) => p.name);
                    const allSelected = groupPermNames.every((n) => formData.permissions.includes(n));
                    const someSelected = groupPermNames.some((n) => formData.permissions.includes(n));
                    return (
                      <div key={group.name} className="rounded-lg border border-border p-3 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => toggleGroup(group.permissions)}
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
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.permissions.map((perm) => (
                            <button
                              key={perm.name}
                              onClick={() => togglePermission(perm.name)}
                              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                                formData.permissions.includes(perm.name)
                                  ? "bg-primary/10 text-primary border border-primary/30"
                                  : "bg-gray-100 text-gray-600 border border-transparent dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {formData.permissions.includes(perm.name) && <Check className="h-3 w-3" />}
                              {perm.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {showCreateModal ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Role Details</h3>
              <button onClick={() => setShowViewModal(false)} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Name</span><span className="font-medium text-text-primary dark:text-white">{selectedRole.name}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Description</span><span className="font-medium text-text-primary dark:text-white">{selectedRole.description || "—"}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Permissions</span><span className="font-medium text-primary">{selectedRole.permissions?.length || 0}</span></div>
            </div>
            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-text-muted dark:text-gray-400">Assigned Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.permissions.map((p) => (
                    <span key={p.id} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RolesPage() {
  return (
    <PermissionGuard permission="Role Index">
      <RolesContent />
    </PermissionGuard>
  );
}
