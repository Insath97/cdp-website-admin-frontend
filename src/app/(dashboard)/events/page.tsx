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
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  X,
  ChevronDown,
  Calendar,
  RotateCcw,
  Trash,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { eventService } from "@/services";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Event } from "@/services";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val === value ? "" : val);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative shrink-0" style={{ width: 180 }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <span className={value ? "text-text-primary dark:text-white" : "text-text-muted dark:text-gray-400"}>
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {value && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear selection
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-text-muted dark:text-gray-400">No results found</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm ${
                    opt.value === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-primary hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function EventsContent() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [deleting, setDeleting] = useState(false);
  const [forceDeleteDialog, setForceDeleteDialog] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [forceDeleting, setForceDeleting] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchEvents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: pagination.perPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (activeFilter) params.is_active = activeFilter;

      const resData = await eventService.getAll(params);

      if (Array.isArray(resData)) {
        setEvents(resData);
        setPagination((prev) => ({ ...prev, currentPage: 1, lastPage: 1, total: resData.length }));
      } else if (resData?.data) {
        setEvents(resData.data);
        setPagination({
          currentPage: resData.current_page || 1,
          lastPage: resData.last_page || 1,
          perPage: resData.per_page || 15,
          total: resData.total || 0,
        });
      } else {
        setEvents([]);
      }
    } catch {
      toast("Failed to load events", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, activeFilter, pagination.perPage, toast]);

  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

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
    if (!deleteDialog.event) return;
    setDeleting(true);
    try {
      await eventService.delete(deleteDialog.event.id);
      fetchEvents(pagination.currentPage);
      toast("Event deleted successfully", "success");
      setDeleteDialog({ open: false, event: null });
    } catch {
      toast("Failed to delete event", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteDialog.event) return;
    setForceDeleting(true);
    try {
      await eventService.forceDelete(forceDeleteDialog.event.id);
      fetchEvents(pagination.currentPage);
      toast("Event permanently deleted", "success");
      setForceDeleteDialog({ open: false, event: null });
    } catch {
      toast("Failed to permanently delete event", "error");
    } finally {
      setForceDeleting(false);
    }
  };

  const handleToggleStatus = async (event: Event) => {
    try {
      await eventService.toggleStatus(event.id);
      fetchEvents(pagination.currentPage);
      toast(`Event ${event.is_active ? "deactivated" : "activated"} successfully`, "success");
    } catch {
      toast("Failed to update event status", "error");
    }
  };

  const handleRestore = async (event: Event) => {
    try {
      await eventService.restore(event.id);
      fetchEvents(pagination.currentPage);
      toast("Event restored successfully", "success");
    } catch {
      toast("Failed to restore event", "error");
    }
  };

  const handleApprove = async (event: Event) => {
    try {
      await eventService.approve(event.id);
      fetchEvents(pagination.currentPage);
      toast("Event approved successfully", "success");
    } catch {
      toast("Failed to approve event", "error");
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.event || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await eventService.reject(rejectDialog.event.id, rejectReason);
      fetchEvents(pagination.currentPage);
      toast("Event rejected successfully", "success");
      setRejectDialog({ open: false, event: null });
      setRejectReason("");
    } catch {
      toast("Failed to reject event", "error");
    } finally {
      setRejecting(false);
    }
  };

  const handleSubmitForReview = async (event: Event) => {
    try {
      await eventService.submitForReview(event.id);
      fetchEvents(pagination.currentPage);
      toast("Event submitted for review", "success");
    } catch {
      toast("Failed to submit event for review", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Events</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage events ({pagination.total} total)
          </p>
        </div>
        {hasPermission("Event Create") && (
          <button
            onClick={() => router.push("/events/create")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        )}
      </div>

      {/* Search + Filters - 1 Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
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
        <SearchSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Status", value: "" },
            { label: "Draft", value: "draft" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ]}
          placeholder="All Status"
        />
        <SearchSelect
          value={activeFilter}
          onChange={setActiveFilter}
          options={[
            { label: "All Active", value: "" },
            { label: "Active", value: "1" },
            { label: "Inactive", value: "0" },
          ]}
          placeholder="All Active"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <Calendar className="h-10 w-10 opacity-30" />
            <p>No events found</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Event</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Active</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.thumbnail_image ? (
                          <img
                            src={`${IMAGE_URL}/${event.thumbnail_image}`}
                            alt={event.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary dark:text-white">{event.title}</span>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.tags.slice(0, 3).map((tag) => (
                                <span key={tag.id} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  {tag.name}
                                </span>
                              ))}
                              {event.tags.length > 3 && (
                                <span className="text-xs text-text-muted">+{event.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400">
                      {event.created_date ? new Date(event.created_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[event.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {event.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === event.id ? null : event.id); }}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === event.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => { router.push(`/events/${event.id}`); setActionMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            {hasPermission("Event Update") && (
                              <button
                                onClick={() => { router.push(`/events/${event.id}/edit`); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </button>
                            )}
                            {hasPermission("Event Create") && event.status === "draft" && (
                              <button
                                onClick={() => { handleSubmitForReview(event); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              >
                                <Send className="h-4 w-4" /> Submit for Review
                              </button>
                            )}
                            {hasPermission("Event Toggle Active") && (
                              <button
                                onClick={() => { handleToggleStatus(event); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {event.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                                {event.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {hasPermission("Event Approve") && (event.status === "pending" || event.status === "draft") && (
                              <>
                                <button
                                  onClick={() => { handleApprove(event); setActionMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve
                                </button>
                                <button
                                  onClick={() => { setRejectDialog({ open: true, event }); setActionMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </button>
                              </>
                            )}
                            {hasPermission("Event Restore") && event.deleted_at && (
                              <button
                                onClick={() => { handleRestore(event); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <RotateCcw className="h-4 w-4" /> Restore
                              </button>
                            )}
                            {hasPermission("Event Delete") && !event.deleted_at && (
                              <button
                                onClick={() => { setDeleteDialog({ open: true, event }); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            )}
                            {hasPermission("Event Force Delete") && (
                              <button
                                onClick={() => { setForceDeleteDialog({ open: true, event }); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash className="h-4 w-4" /> Force Delete
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
          Displaying{" "}
          <span className="font-bold">{events.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> EVENTS
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchEvents(1);
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
                onClick={() => fetchEvents(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                « Prev
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
                    <span key={`dots-${idx}`} className="px-1 text-xs text-text-muted dark:text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchEvents(page)}
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
                onClick={() => fetchEvents(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteDialog.event?.title}"?`}
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, event: null })}
        loading={deleting}
      />

      {/* Force Delete Confirmation */}
      <ConfirmDialog
        open={forceDeleteDialog.open}
        title="Confirm Permanent Delete"
        message={`Are you sure you want to permanently delete "${forceDeleteDialog.event?.title}"? This action cannot be undone.`}
        confirmLabel={forceDeleting ? "Deleting..." : "Yes, Force Delete"}
        onConfirm={handleForceDelete}
        onCancel={() => setForceDeleteDialog({ open: false, event: null })}
        loading={forceDeleting}
      />

      {/* Reject Dialog */}
      {rejectDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-text-primary dark:text-white">Reject Event</h3>
            <p className="mt-3 text-sm text-text-muted dark:text-gray-400">
              Are you sure you want to reject &quot;{rejectDialog.event?.title}&quot;? Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => { setRejectDialog({ open: false, event: null }); setRejectReason(""); }}
                disabled={rejecting}
                className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <PermissionGuard permission="Event Index">
      <EventsContent />
    </PermissionGuard>
  );
}
