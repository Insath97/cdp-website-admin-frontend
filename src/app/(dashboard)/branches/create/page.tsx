"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

function CreateBranchContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      await apiClient.post("/branches", {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      });
      toast("Branch created successfully", "success");
      router.push("/branches");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to create branch", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Create Branch</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Add a new organization branch</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/branches" className="hover:text-primary">Branches</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Create</span>
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
                placeholder="Enter branch name"
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
                placeholder="Enter branch code"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.code && <p className="mt-1 text-xs text-red-500">{formErrors.code[0]}</p>}
            </div>
          </div>

          {/* Row 2: City + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city[0]}</p>}
            </div>
            <div className="flex items-end pb-2">
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

          {/* Row 3: Address */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              placeholder="Enter full address"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address[0]}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/branches")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.name || !formData.code || !formData.city || !formData.address}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Create Branch
        </button>
      </div>
    </div>
  );
}

export default function CreateBranchPage() {
  return (
    <PermissionGuard permission="Branch Create">
      <CreateBranchContent />
    </PermissionGuard>
  );
}
