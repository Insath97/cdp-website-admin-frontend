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
  Target,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Plan } from "@/types";

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
    <div ref={ref} className="relative shrink-0" style={{ width: 220 }}>
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

function PlansContent() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; plan: Plan | null }>({ open: false, plan: null });
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchPlans = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: pagination.perPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.is_active = statusFilter;

      const response = await apiClient.get("/plans", { params });
      const resData = response.data.data;

      if (Array.isArray(resData)) {
        setPlans(resData);
        setPagination((prev) => ({ ...prev, currentPage: 1, lastPage: 1, total: resData.length }));
      } else if (resData?.data) {
        setPlans(resData.data);
        setPagination({
          currentPage: resData.current_page || 1,
          lastPage: resData.last_page || 1,
          perPage: resData.per_page || 15,
          total: resData.total || 0,
        });
      } else {
        setPlans([]);
      }
    } catch {
      toast("Failed to load plans", "error");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, pagination.perPage, toast]);

  useEffect(() => {
    fetchPlans(1);
  }, [fetchPlans]);

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
    if (!deleteDialog.plan) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/plans/${deleteDialog.plan.id}`);
      fetchPlans(pagination.currentPage);
      toast("Plan deleted successfully", "success");
      setDeleteDialog({ open: false, plan: null });
    } catch {
      toast("Failed to delete plan", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await apiClient.patch(`/plans/${plan.id}/toggle-status`);
      fetchPlans(pagination.currentPage);
      toast(`Plan ${plan.is_active ? "deactivated" : "activated"} successfully`, "success");
    } catch {
      toast("Failed to update plan status", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Plans</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage organization plans ({pagination.total} total)
          </p>
        </div>
        {hasPermission("Plan Create") && (
          <button
            onClick={() => router.push("/plans/create")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </button>
        )}
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search plans by title or description..."
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
            { label: "Active", value: "1" },
            { label: "Inactive", value: "0" },
          ]}
          placeholder="All Status"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <Target className="h-10 w-10 opacity-30" />
            <p>No plans found</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Plan</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Subtitle</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Features</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {plan.image ? (
                          <img
                            src={`${IMAGE_URL}/${plan.image}`}
                            alt={plan.maintitle}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                            <Target className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-text-primary dark:text-white">{plan.maintitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400 max-w-[200px] truncate">
                      {plan.subtitle}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {plan.features?.length || 0} features
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          plan.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === plan.id ? null : plan.id); }}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === plan.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => { router.push(`/plans/${plan.id}`); setActionMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            {hasPermission("Plan Update") && (
                              <button
                                onClick={() => { router.push(`/plans/${plan.id}/edit`); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </button>
                            )}
                            {hasPermission("Plan Toggle Active") && (
                              <button
                                onClick={() => { handleToggleStatus(plan); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {plan.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                                {plan.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {hasPermission("Plan Delete") && (
                              <button
                                onClick={() => { setDeleteDialog({ open: true, plan }); setActionMenuId(null); }}
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
          Displaying{" "}
          <span className="font-bold">{plans.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> PLANS
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchPlans(1);
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
                onClick={() => fetchPlans(pagination.currentPage - 1)}
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
                      onClick={() => fetchPlans(page)}
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
                onClick={() => fetchPlans(pagination.currentPage + 1)}
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
        message={`Are you sure you want to delete "${deleteDialog.plan?.maintitle}"? This will also delete all associated features and the plan image.`}
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, plan: null })}
        loading={deleting}
      />
    </div>
  );
}

export default function PlansPage() {
  return (
    <PermissionGuard permission="Plan Index">
      <PlansContent />
    </PermissionGuard>
  );
}
