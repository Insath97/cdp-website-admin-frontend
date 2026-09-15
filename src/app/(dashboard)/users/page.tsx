"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { User, Role } from "@/types";

function UsersContent() {
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role_id: "",
    is_active: true,
    can_login: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/users");
      const data = response.data.data;
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiClient.get("/roles/list");
      const data = response.data.data;
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        role_id: Number(formData.role_id),
      };
      await apiClient.post("/users", payload);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      toast("User created successfully", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast(err.response?.data?.message || "Failed to create user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role_id: Number(formData.role_id),
        is_active: formData.is_active,
        can_login: formData.can_login,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await apiClient.put(`/users/${selectedUser.id}`, payload);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
      toast("User updated successfully", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.name}"?`)) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      fetchUsers();
      toast("User deleted successfully", "success");
    } catch {
      toast("Failed to delete user", "error");
    }
  };

  const handleToggleActive = async (user: User) => {
    const endpoint = user.is_active
      ? `/users/${user.id}/deactivate`
      : `/users/${user.id}/activate`;
    try {
      await apiClient.patch(endpoint);
      fetchUsers();
      toast(`User ${user.is_active ? "deactivated" : "activated"} successfully`, "success");
    } catch {
      toast("Failed to update user status", "error");
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      role_id: user.roles?.[0]?.id?.toString() || "",
      is_active: user.is_active,
      can_login: user.can_login,
    });
    setShowEditModal(true);
    setActionMenuId(null);
  };

  const openView = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setActionMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role_id: "",
      is_active: true,
      can_login: true,
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Users</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage system users and their access
          </p>
        </div>
        {hasPermission("User Create") && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-text-muted dark:text-gray-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Username</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Role</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Last Login</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium text-text-primary dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {user.roles?.[0]?.name || "No Role"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted dark:text-gray-400">
                      {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === user.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => openView(user)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            {hasPermission("User Update") && (
                              <button
                                onClick={() => openEdit(user)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </button>
                            )}
                            {hasPermission("User Update") && (
                              <button
                                onClick={() => { handleToggleActive(user); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                {user.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {hasPermission("User Delete") && (
                              <button
                                onClick={() => { handleDelete(user); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                {showCreateModal ? "Create User" : "Edit User"}
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
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {formErrors.username && <p className="mt-1 text-xs text-red-500">{formErrors.username[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">
                  Password {showEditModal && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                {formErrors.role_id && <p className="mt-1 text-xs text-red-500">{formErrors.role_id[0]}</p>}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-text-primary dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.can_login}
                    onChange={(e) => setFormData({ ...formData, can_login: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-text-primary dark:text-gray-300">Can Login</span>
                </label>
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
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">User Details</h3>
              <button onClick={() => setShowViewModal(false)} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Name</span><span className="font-medium text-text-primary dark:text-white">{selectedUser.name}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Email</span><span className="font-medium text-text-primary dark:text-white">{selectedUser.email}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Username</span><span className="font-medium text-text-primary dark:text-white">{selectedUser.username}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Role</span><span className="font-medium text-primary">{selectedUser.roles?.[0]?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Status</span><span className={`font-medium ${selectedUser.is_active ? "text-green-600" : "text-gray-500"}`}>{selectedUser.is_active ? "Active" : "Inactive"}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Can Login</span><span className="font-medium text-text-primary dark:text-white">{selectedUser.can_login ? "Yes" : "No"}</span></div>
              <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Last Login</span><span className="font-medium text-text-primary dark:text-white">{selectedUser.last_login_at ? formatDate(selectedUser.last_login_at) : "Never"}</span></div>
            </div>
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

export default function UsersPage() {
  return (
    <PermissionGuard permission="User Index">
      <UsersContent />
    </PermissionGuard>
  );
}
