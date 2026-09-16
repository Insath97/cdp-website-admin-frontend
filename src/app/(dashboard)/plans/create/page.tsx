"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

function CreatePlanContent() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    maintitle: "",
    subtitle: "",
    short_description: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>([""]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast("Only PNG, JPG, JPEG files are allowed", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast("File size must be less than 2MB", "error");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("maintitle", formData.maintitle);
      payload.append("subtitle", formData.subtitle);
      payload.append("short_description", formData.short_description);
      payload.append("is_active", formData.is_active ? "1" : "0");
      if (imageFile) {
        payload.append("image", imageFile);
      }
      features.forEach((feature, index) => {
        if (feature.trim()) {
          payload.append(`features[${index}][feature]`, feature);
        }
      });

      await apiClient.post("/plans", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("Plan created successfully", "success");
      router.push("/plans");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to create plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Create Plan</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Add a new plan</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/plans" className="hover:text-primary">Plans</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Create</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Image Upload - Full Width */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Image *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background transition-colors hover:border-primary dark:border-gray-700 dark:bg-gray-900"
            >
              {imagePreview ? (
                <div className="relative h-full w-full">
                  <img src={imagePreview} alt="Preview" className="h-full w-full rounded-lg object-contain" />
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
                  <p className="text-xs text-text-muted dark:text-gray-500">PNG, JPG, JPEG (max 2MB)</p>
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
            {formErrors.image && <p className="mt-1 text-xs text-red-500">{formErrors.image[0]}</p>}
          </div>

          {/* Row 1: Main Title + Subtitle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Main Title *</label>
              <input
                type="text"
                value={formData.maintitle}
                onChange={(e) => setFormData({ ...formData, maintitle: e.target.value })}
                placeholder="Enter main title"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.maintitle && <p className="mt-1 text-xs text-red-500">{formErrors.maintitle[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Subtitle *</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter subtitle"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.subtitle && <p className="mt-1 text-xs text-red-500">{formErrors.subtitle[0]}</p>}
            </div>
          </div>

          {/* Row 2: Short Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Short Description *</label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={3}
              placeholder="Enter short description"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.short_description && <p className="mt-1 text-xs text-red-500">{formErrors.short_description[0]}</p>}
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

          {/* Row 4: Features */}
          <div className="rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary dark:text-gray-300">Features * (required)</label>
              <button
                onClick={addFeature}
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => removeFeature(index)}
                    disabled={features.length === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-red-500 hover:bg-red-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {formErrors.features && <p className="mt-2 text-xs text-red-500">{formErrors.features[0]}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/plans")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.maintitle || !formData.subtitle || !formData.short_description}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Create Plan
        </button>
      </div>
    </div>
  );
}

export default function CreatePlanPage() {
  return (
    <PermissionGuard permission="Plan Create">
      <CreatePlanContent />
    </PermissionGuard>
  );
}
