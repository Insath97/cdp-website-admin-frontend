"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Edit, ArrowLeft, Calendar, Tag, FileText } from "lucide-react";
import { blogService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Blog } from "@/services/blog.service";

function ViewBlogContent({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogService.getById(Number(blogId));
      setBlog(response);
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) return null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      published: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      archived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Blog Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View blog post</p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("Blog Update") && (
            <button
              onClick={() => router.push(`/blogs/${blog.id}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
          <button
            onClick={() => router.push("/blogs")}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        {/* Meta Info */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {getStatusBadge(blog.status)}
          {blog.category && (
            <span className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-gray-400">
              <Tag className="h-4 w-4" />
              {blog.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm text-text-muted dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold text-text-primary dark:text-white">{blog.title}</h1>

        {/* Slug */}
        <p className="mb-4 text-sm text-text-muted dark:text-gray-400">
          Slug: <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">{blog.slug}</code>
        </p>

        {/* Excerpt */}
        {blog.excerpt && (
          <div className="mb-6 rounded-lg bg-background p-4 dark:bg-gray-900">
            <p className="text-sm text-text-muted dark:text-gray-400">{blog.excerpt}</p>
          </div>
        )}

        {/* Content */}
        <div className="border-t border-border pt-6 dark:border-gray-700">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <FileText className="h-5 w-5" />
            Content
          </h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-text-primary dark:text-gray-300">{blog.content}</div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-6 border-t border-border pt-6 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted dark:text-gray-400">Created:</span>{" "}
              <span className="text-text-primary dark:text-white">
                {new Date(blog.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-text-muted dark:text-gray-400">Updated:</span>{" "}
              <span className="text-text-primary dark:text-white">
                {new Date(blog.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Blog Index">
      <ViewBlogContent blogId={id} />
    </PermissionGuard>
  );
}
