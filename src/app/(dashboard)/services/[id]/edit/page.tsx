"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Upload, X, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Service } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function EditServiceContent({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/services/${serviceId}`);
      const service: Service = response.data.data;
      setFormData({
        title: service.title || "",
        description: service.description || "",
        is_active: service.is_active,
      });
      if (service.imagepath) {
        setExistingImage(service.imagepath);
      }
    } catch {
      toast("Failed to load service", "error");
      router.push("/services");
    }
  }, [serviceId, toast, router]);

  useEffect(() => {
    fetchService().then(() => setLoading(false));
  }, [fetchService]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast("Only PNG, JPG, JPEG files are allowed", "error");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast("File size must be less than 100MB", "error");
        return;
      }
      setImageFile(file);
      setExistingImage(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("is_active", formData.is_active ? "1" : "0");
      if (imageFile) {
        payload.append("imagepath", imageFile);
      }

      await apiClient.post(`/services/${serviceId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { _method: "PUT" },
      });
      toast("Service updated successfully", "success");
      router.push("/services");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update service", "error");
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
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Edit Service</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Update service information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/services" className="hover:text-primary">Services</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Edit</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Row 1: Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter service title"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title[0]}</p>}
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter service description (max 1000 characters)"
              maxLength={1000}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-text-muted dark:text-gray-500">{formData.description.length}/1000</p>
            {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description[0]}</p>}
          </div>

          {/* Row 3: Image Upload + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Image Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background transition-colors hover:border-primary dark:border-gray-700 dark:bg-gray-900"
              >
                {imagePreview || existingImage ? (
                  <div className="relative h-full w-full">
                    <img
                      src={imagePreview || (existingImage ? `${IMAGE_URL}/${existingImage}` : "")}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-contain"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-text-muted dark:text-gray-500" />
                    <p className="text-sm text-text-muted dark:text-gray-400">Click to upload image</p>
                    <p className="text-xs text-text-muted dark:text-gray-500">PNG, JPG, JPEG (max 100MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
              {formErrors.imagepath && <p className="mt-1 text-xs text-red-500">{formErrors.imagepath[0]}</p>}
            </div>

            {/* Status */}
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
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/services")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.title || !formData.description}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Update Service
        </button>
      </div>
    </div>
  );
}

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Service Update">
      <EditServiceContent serviceId={id} />
    </PermissionGuard>
  );
}
