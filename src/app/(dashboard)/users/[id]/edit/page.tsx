"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, X, ChevronDown, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Role, User } from "@/types";

function RoleSelect({
  value,
  onChange,
  roles,
}: {
  value: string;
  onChange: (val: string) => void;
  roles: Role[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val === value ? "" : val);
    setOpen(false);
    setQuery("");
  };

  const displayRole = roles.find((r) => r.name === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        <span className={displayRole ? "text-text-primary dark:text-white" : "text-text-muted dark:text-gray-400"}>
          {displayRole?.name || "Select a role"}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search roles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {value && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear selection
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-text-muted dark:text-gray-400">No roles found</p>
            ) : (
              filtered.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelect(role.name)}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm ${
                    role.name === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-primary hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  }`}
                >
                  {role.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditUserContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
    is_active: true,
    can_login: true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}`);
      const user: User = response.data.data;
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        role: user.roles?.[0]?.name || "",
        is_active: user.is_active,
        can_login: user.can_login,
      });
      if (user.profile_image) {
        setImagePreview(user.profile_image.startsWith("http") ? user.profile_image : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/storage/${user.profile_image}`);
      }
    } catch {
      toast("Failed to load user", "error");
      router.push("/users");
    }
  }, [userId, toast, router]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiClient.get("/roles/list");
      const data = response.data.data;
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchUser(), fetchRoles()]).then(() => setLoading(false));
  }, [fetchUser, fetchRoles]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("role", formData.role);
      payload.append("is_active", formData.is_active ? "1" : "0");
      payload.append("can_login", formData.can_login ? "1" : "0");
      if (formData.password) {
        payload.append("password", formData.password);
        payload.append("password_confirmation", formData.password_confirmation);
      }
      if (profileImage) {
        payload.append("profile_image", profileImage);
      }
      payload.append("_method", "PUT");

      await apiClient.post(`/users/${userId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("User updated successfully", "success");
      router.push("/users");
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
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Edit User</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Update user information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/users" className="hover:text-primary">Users</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Edit</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.username && <p className="mt-1 text-xs text-red-500">{formErrors.username[0]}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email[0]}</p>}
          </div>

          {/* Password */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Confirm Password</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="Confirm new password"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Role *</label>
            <RoleSelect
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              roles={roles}
            />
            {formErrors.role && <p className="mt-1 text-xs text-red-500">{formErrors.role[0]}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Profile Image</label>
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary dark:border-gray-700"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-5 w-5 text-text-muted" />
                  <p className="mt-1 text-xs text-text-muted">Click to upload</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {formErrors.profile_image && <p className="mt-1 text-xs text-red-500">{formErrors.profile_image[0]}</p>}
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
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
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/users")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.name || !formData.username || !formData.email || !formData.role}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Update User
        </button>
      </div>
    </div>
  );
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="User Update">
      <EditUserContent userId={id} />
    </PermissionGuard>
  );
}
