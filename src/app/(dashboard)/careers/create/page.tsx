"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Upload, X, Plus, Trash2, Briefcase } from "lucide-react";
import { careerService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

function CreateCareerContent() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    job_type: "",
    due_date: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
        toast("Only PNG, JPG, JPEG, WEBP files are allowed", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast("File size must be less than 10MB", "error");
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

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeListItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    if (list.length > 1) {
      setter(list.filter((_, i) => i !== index));
    }
  };

  const updateListItem = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("department", formData.department);
      payload.append("location", formData.location);
      payload.append("job_type", formData.job_type);
      if (formData.due_date) {
        payload.append("due_date", formData.due_date);
      }
      payload.append("is_active", formData.is_active ? "1" : "0");
      if (imageFile) {
        payload.append("poster_image", imageFile);
      }
      responsibilities.forEach((item, index) => {
        if (item.trim()) {
          payload.append(`key_responsibilities[${index}]`, item);
        }
      });
      requirements.forEach((item, index) => {
        if (item.trim()) {
          payload.append(`requirements[${index}]`, item);
        }
      });
      benefits.forEach((item, index) => {
        if (item.trim()) {
          payload.append(`benefits[${index}]`, item);
        }
      });

      await careerService.create(payload);
      toast("Career post created successfully", "success");
      router.push("/careers");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to create career post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderDynamicList = (
    label: string,
    required: boolean,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    errorKey: string
  ) => (
    <div className="rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary dark:text-gray-300">
          {label} {required && "*"}
        </label>
        <button
          onClick={() => addListItem(setter)}
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Add {label.replace("Key ", "")}
        </button>
      </div>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {index + 1}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateListItem(index, e.target.value, setter, list)}
              placeholder={`${label.replace("Key ", "")} ${index + 1}`}
              className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={() => removeListItem(index, setter, list)}
              disabled={list.length === 1}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-red-500 hover:bg-red-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {formErrors[errorKey] && <p className="mt-2 text-xs text-red-500">{formErrors[errorKey][0]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Create Job Posting</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Add a new job posting</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/careers" className="hover:text-primary">Manage Jobs</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Create</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Image Upload - Full Width */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Poster Image</label>
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
                  <p className="text-sm text-text-muted dark:text-gray-400">Click to upload poster image</p>
                  <p className="text-xs text-text-muted dark:text-gray-500">PNG, JPG, JPEG, WEBP (max 10MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            {formErrors.poster_image && <p className="mt-1 text-xs text-red-500">{formErrors.poster_image[0]}</p>}
          </div>

          {/* Row 1: Title + Slug (auto-generated) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter job title"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title[0]}</p>}
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Enter job description"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description[0]}</p>}
          </div>

          {/* Row 3: Department + Location + Job Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.department && <p className="mt-1 text-xs text-red-500">{formErrors.department[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Nairobi"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.location && <p className="mt-1 text-xs text-red-500">{formErrors.location[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Job Type</label>
              <input
                type="text"
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                placeholder="e.g. Full-time"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.job_type && <p className="mt-1 text-xs text-red-500">{formErrors.job_type[0]}</p>}
            </div>
          </div>

          {/* Row 4: Due Date + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.due_date && <p className="mt-1 text-xs text-red-500">{formErrors.due_date[0]}</p>}
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-1">
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

          {/* Dynamic Lists */}
          {renderDynamicList("Key Responsibilities", false, responsibilities, setResponsibilities, "key_responsibilities")}
          {renderDynamicList("Requirements", false, requirements, setRequirements, "requirements")}
          {renderDynamicList("Benefits", false, benefits, setBenefits, "benefits")}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/careers")}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.title}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Create Job
        </button>
      </div>
    </div>
  );
}

export default function CreateCareerPage() {
  return (
    <PermissionGuard permission="Career Create">
      <CreateCareerContent />
    </PermissionGuard>
  );
}
