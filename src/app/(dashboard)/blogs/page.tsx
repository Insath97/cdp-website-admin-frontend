"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import { blogService } from "@/services";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Blog } from "@/services/blog.service";

function BlogsContent() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blog: Blog | null }>({
    open: false,
    blog: null,
  });
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchBlogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page,
          per_page: pagination.perPage,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;

        const response = await blogService.getAll(params);

        if (Array.isArray(response.data)) {
          setBlogs(response.data);
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            lastPage: 1,
            total: response.data.length,
          }));
        } else if (response.data?.data) {
          setBlogs(response.data.data);
          setPagination({
            currentPage: response.meta?.current_page || 1,
            lastPage: response.meta?.last_page || 1,
            perPage: response.meta?.per_page || 15,
            total: response.meta?.total || 0,
          });
        } else {
          setBlogs([]);
        }
      } catch {
        toast("Failed to load blogs", "error");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, pagination.perPage, toast]
  );

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = () => setActionMenuId(null);
    if (actionMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuId]);

  const handleDelete = async () => {
    if (!deleteDialog.blog) return;
    setDeleting(true);
    try {
      await blogService.delete(deleteDialog.blog.id);
      fetchBlogs(pagination.currentPage);
      toast("Blog deleted successfully", "success");
      setDeleteDialog({ open: false, blog: null });
    } catch {
      toast("Failed to delete blog", "error");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      published: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      archived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Blogs</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage blog posts ({pagination.total} total)
          </p>
        </div>
        {hasPermission("Blog Create") && (
          <button
            onClick={() => router.push("/blogs/create")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Blog
          </button>
        )}
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search blogs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <FileText className="h-10 w-10 opacity-30" />
            <p>No blogs found</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Category</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {blog.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary dark:text-white">{blog.title}</p>
                          <p className="text-xs text-text-muted dark:text-gray-400 max-w-[200px] truncate">
                            {blog.excerpt || blog.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {blog.category ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {blog.category}
                        </span>
                      ) : (
                        <span className="text-text-muted dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted dark:text-gray-400">
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuId(actionMenuId === blog.id ? null : blog.id);
                          }}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === blog.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => {
                                router.push(`/blogs/${blog.id}`);
                                setActionMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            {hasPermission("Blog Update") && (
                              <button
                                onClick={() => {
                                  router.push(`/blogs/${blog.id}/edit`);
                                  setActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </button>
                            )}
                            {hasPermission("Blog Delete") && (
                              <button
                                onClick={() => {
                                  setDeleteDialog({ open: true, blog });
                                  setActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-text-primary dark:text-white">
          Displaying <span className="font-bold">{blogs.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> BLOGS
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchBlogs(1);
              }}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          {pagination.lastPage >= 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchBlogs(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                &laquo; Prev
              </button>
              {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                .filter((page) => {
                  const current = pagination.currentPage;
                  return page === 1 || page === pagination.lastPage || (page >= current - 1 && page <= current + 1);
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  typeof page === "string" ? (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-text-muted dark:text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchBlogs(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium ${
                        page === pagination.currentPage
                          ? "bg-primary text-white"
                          : "border border-border bg-surface text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                onClick={() => fetchBlogs(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteDialog.blog?.title}"?`}
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, blog: null })}
        loading={deleting}
      />
    </div>
  );
}

export default function BlogsPage() {
  return (
    <PermissionGuard permission="Blog Index">
      <BlogsContent />
    </PermissionGuard>
  );
}
