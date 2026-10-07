"use client";

import Link from "next/link";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, RefreshCw, Upload, X, Image as ImageIcon } from "lucide-react";
import { blogService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Blog } from "@/services/blog.service";

function EditBlogContent({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    status: "published" as "draft" | "published" | "archived",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogService.getById(Number(blogId));
      setBlog(response);
      setFormData({
        title: response.title || "",
        slug: response.slug || "",
        content: response.content || response.description || "",
        excerpt: response.excerpt || "",
        category: response.category || "",
        status: (response.status === "published" || response.status === "archived" ? response.status : "draft") as "draft" | "published" | "archived",
      });
      if (response.thumbnail_image || response.featured_image) {
        setImagePreview(response.thumbnail_image || response.featured_image || null);
      }
    } catch {
      toast("Failed to load blog", "error");
      router.push("/blogs");
    } finally {
      setLoading(false);
    }
  }, [blogId, toast, router]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

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

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      if (imageFile) {
        const payload = new FormData();
        payload.append("title", formData.title);
        payload.append("slug", formData.slug);
        payload.append("description", formData.content);
        payload.append("content", formData.content);
        payload.append("excerpt", formData.excerpt);
        payload.append("status", formData.status === "published" ? "approved" : "pending");
        if (formData.category) payload.append("tags", formData.category);
        payload.append("thumbnail_image", imageFile);
        await blogService.update(Number(blogId), payload);
      } else {
        await blogService.update(Number(blogId), formData);
      }
      toast("Blog updated successfully", "success");
      router.push(`/blogs/${blogId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast("Failed to update blog", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Edit Blog</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">Update article or event</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <Link href="/blogs" className="hover:text-primary">Blogs</Link>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Edit</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Row 1: Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title),
                  });
                }}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title[0]}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.slug && <p className="mt-1 text-xs text-red-500">{formErrors.slug[0]}</p>}
            </div>
          </div>

          {/* Row 2: Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Category / Tag</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Agronomy, Paddy, Governance"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "archived" })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="published">Published (Approved)</option>
                <option value="draft">Draft (Pending)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Row 3: Thumbnail Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">
              Featured / Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative h-28 w-44 overflow-hidden rounded-lg border border-border">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <Upload className="h-6 w-6 text-text-muted" />
                  <span className="mt-1 text-xs text-text-muted">Change cover image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-text-muted max-w-xs">
                Upload to replace existing cover image. Max size: 10MB.
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.content && <p className="mt-1 text-xs text-red-500">{formErrors.content[0]}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/blogs/${blogId}`)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.content}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Update Blog
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Event Update">
      <EditBlogContent blogId={id} />
    </PermissionGuard>
  );
}
