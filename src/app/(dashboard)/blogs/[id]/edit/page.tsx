"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { blogService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Blog } from "@/services/blog.service";

function EditBlogContent({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft" as "draft" | "published" | "archived",
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
        content: response.content || "",
        excerpt: response.excerpt || "",
        category: response.category || "",
        status: response.status || "draft",
      });
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

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      await blogService.update(Number(blogId), formData);
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
          <p className="text-sm text-text-muted dark:text-gray-400">Update blog post</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/blogs" className="hover:text-primary">Blogs</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">Edit</span>
        </nav>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Title */}
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
              placeholder="Enter blog title"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title[0]}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="blog-slug"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.slug && <p className="mt-1 text-xs text-red-500">{formErrors.slug[0]}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter category (optional)"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              placeholder="Short description (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              placeholder="Enter blog content"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {formErrors.content && <p className="mt-1 text-xs text-red-500">{formErrors.content[0]}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "archived" })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push(`/blogs/${blogId}`)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.content}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
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
    <PermissionGuard permission="Blog Update">
      <EditBlogContent blogId={id} />
    </PermissionGuard>
  );
}
