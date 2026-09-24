"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Upload, X, RefreshCw, Image as ImageIcon, Send, Plus, Trash2, Link as LinkIcon, Settings, FileText, Tag as TagIcon } from "lucide-react";
import { eventService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuthStore } from "@/lib/auth";
import { TagSelect } from "@/components/ui/tag-select";
import type { Event, Tag } from "@/services";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function EditEventContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, hasPermission } = useAuthStore();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    created_date: "",
    description: "",
    status: "draft",
    is_active: true,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([""]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isSuperAdmin = user?.roles?.some((r: { name: string }) => r.name === "Super Admin");
  const canApprove = isSuperAdmin || user?.permissions?.includes("Event Approve");

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(eventId);
      setEvent(data);
      setFormData({
        title: data.title || "",
        created_date: data.created_date ? data.created_date.split("T")[0] : "",
        description: data.description || "",
        status: data.status || "draft",
        is_active: data.is_active ?? true,
      });
      setSelectedTags(data.tags?.map((t) => t.name) || []);
      if (data.urls && data.urls.length > 0) {
        setUrls(data.urls.map((u) => u.url));
      } else {
        setUrls([""]);
      }
      if (data.thumbnail_image) {
        setThumbnailPreview(`${IMAGE_URL}/${data.thumbnail_image}`);
      }
      if (data.galleries && data.galleries.length > 0) {
        setGalleryPreviews(data.galleries.map((g) => `${IMAGE_URL}/${g.image_path}`));
      }
    } catch {
      toast("Failed to load event", "error");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  }, [eventId, toast, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await eventService.getAvailableTags();
        setAvailableTags(tags);
      } catch {
        // silent
      }
    };
    fetchTags();
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast("Only PNG, JPG, JPEG files are allowed", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast("File size must be less than 10MB", "error");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast(`Skipping ${file.name}: Only PNG, JPG, JPEG allowed`, "error");
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast(`Skipping ${file.name}: File size must be less than 100MB`, "error");
        continue;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result as string);
        if (validPreviews.length === validFiles.length) {
          setGalleryFiles((prev) => [...prev, ...validFiles]);
          setGalleryPreviews((prev) => [...prev, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const handleSubmit = async () => {
    if (!event) return;
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("title", formData.title);
      payload.append("created_date", formData.created_date);
      payload.append("is_active", formData.is_active ? "1" : "0");
      payload.append("description", formData.description);
      payload.append("status", formData.status);
      if (thumbnailFile) {
        payload.append("thumbnail_image", thumbnailFile);
      }
      galleryFiles.forEach((file) => {
        if (!file.name) return;
        payload.append("galleries[]", file);
      });
      const validUrls = urls.filter((u) => u.trim() !== "");
      validUrls.forEach((url, index) => {
        payload.append(`urls[${index}]`, url);
      });
      if (validUrls.length === 0) {
        payload.append("urls", JSON.stringify([]));
      }
      if (selectedTags.length > 0) {
        payload.append("tags", selectedTags.join(", "));
      }

      await eventService.update(event.id, payload);
      toast("Event updated successfully", "success");
      router.push("/events");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update event", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!event) return;
    setSubmittingReview(true);
    try {
      await eventService.submitForReview(event.id);
      toast("Event submitted for review", "success");
      fetchEvent();
    } catch {
      toast("Failed to submit event for review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col">
      <div className="flex-1 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Edit Event</h1>
            <p className="text-sm text-text-muted dark:text-gray-400">Update event information</p>
          </div>
          <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
            <a href="/events" className="hover:text-primary">Events</a>
            <span>/</span>
            <span className="text-text-primary dark:text-white">Edit</span>
          </nav>
        </div>

        {/* Content Card */}
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-border px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">Content</h3>
                <p className="text-xs text-text-muted dark:text-gray-500">Event title and description</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.title && <p className="mt-1.5 text-xs text-red-500">{formErrors.title[0]}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Description</label>
              <div className="rounded-lg border border-border bg-background dark:border-gray-700 dark:bg-gray-900">
                <style>{`.ql-editor { min-height: 250px; }`}</style>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter event description"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
              {formErrors.description && <p className="mt-1.5 text-xs text-red-500">{formErrors.description[0]}</p>}
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-border px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">Media</h3>
                <p className="text-xs text-text-muted dark:text-gray-500">Upload thumbnail and gallery images</p>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-6">
            {/* Thumbnail */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Thumbnail Image</label>
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary dark:border-gray-700 dark:bg-gray-900"
              >
                {thumbnailPreview ? (
                  <div className="relative h-full w-full">
                    <img src={thumbnailPreview} alt="Preview" className="h-full w-full rounded-xl object-contain p-2" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeThumbnail(); }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-text-muted dark:text-gray-500" />
                    <p className="text-sm font-medium text-text-muted dark:text-gray-400">Click to upload</p>
                    <p className="text-xs text-text-muted dark:text-gray-500">PNG, JPG, JPEG (max 10MB)</p>
                  </>
                )}
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              {formErrors.thumbnail_image && <p className="mt-1.5 text-xs text-red-500">{formErrors.thumbnail_image[0]}</p>}
            </div>

            {/* Gallery */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Gallery Images</label>
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary dark:border-gray-700 dark:bg-gray-900"
              >
                <ImageIcon className="mb-2 h-8 w-8 text-text-muted dark:text-gray-500" />
                <p className="text-sm font-medium text-text-muted dark:text-gray-400">Click to upload</p>
                <p className="text-xs text-text-muted dark:text-gray-500">PNG, JPG, JPEG (max 100MB each)</p>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
              {galleryPreviews.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-border p-2 dark:border-gray-700">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img src={preview} alt={`Gallery ${index + 1}`} className="h-full w-full rounded-lg object-cover" />
                        <button
                          onClick={() => removeGalleryImage(index)}
                          className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formErrors.galleries && <p className="mt-1.5 text-xs text-red-500">{formErrors.galleries[0]}</p>}
            </div>
          </div>
        </div>

        {/* Links Card */}
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-border px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                  <LinkIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary dark:text-white">Links</h3>
                  <p className="text-xs text-text-muted dark:text-gray-500">Add related URLs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addUrl}
                className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                <Plus className="h-3.5 w-3.5" /> Add URL
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/40 dark:text-green-400">
                    {index + 1}
                  </span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://example.com"
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-4 text-sm focus:border-green-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeUrl(index)}
                    className="shrink-0 rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {formErrors.urls && <p className="mt-2 text-xs text-red-500">{formErrors.urls[0]}</p>}
          </div>
        </div>

        {/* Metadata Card */}
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-border px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <TagIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">Metadata</h3>
                <p className="text-xs text-text-muted dark:text-gray-500">Tags and date</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Tags</label>
              <TagSelect
                value={selectedTags}
                onChange={setSelectedTags}
                availableTags={availableTags}
                placeholder="Search or create tags..."
                error={formErrors.tags?.[0]}
              />
            </div>

            {/* Created Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Created Date *</label>
              <input
                type="date"
                value={formData.created_date}
                onChange={(e) => setFormData({ ...formData, created_date: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.created_date && <p className="mt-1.5 text-xs text-red-500">{formErrors.created_date[0]}</p>}
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-border px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">Settings</h3>
                <p className="text-xs text-text-muted dark:text-gray-500">Status and visibility</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={!canApprove && formData.status !== "draft" && formData.status !== "pending"}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  {canApprove && (
                    <>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
                {formErrors.status && <p className="mt-1.5 text-xs text-red-500">{formErrors.status[0]}</p>}
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 pb-1">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary dark:text-gray-300">Active</span>
                    <p className="text-xs text-text-muted dark:text-gray-500">Event is visible on the website</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-40 -mx-6 -mb-6 mt-6 border-t border-border bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/events")}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          {event.status === "draft" && hasPermission("Event Create") && (
            <button
              onClick={handleSubmitForReview}
              disabled={submittingReview}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              Submit for Review
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.created_date}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Update Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <PermissionGuard permission="Event Update">
      <EditEventContent eventId={resolvedParams.id} />
    </PermissionGuard>
  );
}
