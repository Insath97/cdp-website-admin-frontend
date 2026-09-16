"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { ContactType } from "@/types";

function EditContactTypeContent({ contactTypeId }: { contactTypeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchContactType = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/contact-types/${contactTypeId}`);
      const ct: ContactType = response.data.data;
      setFormData({
        name: ct.name || "",
        code: ct.code || "",
        description: ct.description || "",
        is_active: ct.is_active,
      });
    } catch {
      toast("Failed to load contact type", "error");
      router.push("/contact-types");
    }
  }, [contactTypeId, toast, router]);

  useEffect(() => {
    fetchContactType().then(() => setLoading(false));
  }, [fetchContactType]);

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      await apiClient.put(`/contact-types/${contactTypeId}`, {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      });
      toast("Contact type updated successfully", "success");
      router.push("/contact-types");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update contact type", "error");
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
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Edit Contact Type</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Update contact type information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/contact-types" className="hover:text-primary">Contact Types</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Edit</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Row 1: Name + Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter contact type name"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Enter contact type code"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.code && <p className="mt-1 text-xs text-red-500">{formErrors.code[0]}</p>}
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter description (optional, max 1024 characters)"
              maxLength={1024}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-text-muted dark:text-gray-500">{formData.description.length}/1024</p>
            {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description[0]}</p>}
          </div>

          {/* Row 3: Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span className="text-sm font-medium text-text-primary dark:text-gray-300">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/contact-types")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.name || !formData.code}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Update Contact Type
        </button>
      </div>
    </div>
  );
}

export default function EditContactTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Contact Type Update">
      <EditContactTypeContent contactTypeId={id} />
    </PermissionGuard>
  );
}
