"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  ClipboardList,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useToast } from "@/components/ui/toast";
import type { ActivityLog } from "@/types";

interface PaginatedData {
  data: ActivityLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function AuditLogsContent() {
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: pagination.perPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get("/activity-logs", { params });
      const result = response.data.data;

      setLogs(result.data || []);
      setPagination({
        currentPage: result.current_page || 1,
        lastPage: result.last_page || 1,
        perPage: result.per_page || 15,
        total: result.total || 0,
      });
    } catch {
      toast("Failed to load activity logs", "error");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, moduleFilter, actionFilter, startDate, endDate, pagination.perPage, toast]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Fetch when debounced search or filters change
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const clearFilters = () => {
    setSearchQuery("");
    setModuleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = searchQuery || moduleFilter || actionFilter || startDate || endDate;

  const viewDetail = async (log: ActivityLog) => {
    if (!hasPermission("Activity Log Show")) {
      toast("You don't have permission to view log details", "error");
      return;
    }
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const response = await apiClient.get(`/activity-logs/${log.id}`);
      setSelectedLog(response.data.data);
    } catch {
      toast("Failed to load log details", "error");
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const modules = [
    "User", "Role", "Permission", "CMS", "Contact", "ContactType",
    "Branch", "Service", "Event", "Plan", "Career", "CareerApplication",
    "Setting", "ActivityLog",
  ];

  const actions = [
    "created", "updated", "deleted",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Activity Logs</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            System activity audit trail ({pagination.total} total)
          </p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.currentPage)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by description, user name, email..."
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shrink-0 ${
            showFilters || hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-surface text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {[moduleFilter, actionFilter, startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted dark:text-gray-400">Module</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Modules</option>
                {modules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted dark:text-gray-400">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Actions</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted dark:text-gray-400">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted dark:text-gray-400">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end border-t border-border pt-3 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <ClipboardList className="h-10 w-10 opacity-30" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Date/Time</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">User</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Action</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Module</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Description</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">IP Address</th>
                  {hasPermission("Activity Log Show") && (
                    <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Details</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-xs text-text-muted dark:text-gray-400 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {(log.user?.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary dark:text-white">
                            {log.user?.name || `User #${log.user_id}`}
                          </p>
                          {log.user?.email && (
                            <p className="text-[10px] text-text-muted dark:text-gray-500">{log.user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.action.includes("created")
                          ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : log.action.includes("deleted")
                          ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary dark:text-white max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted dark:text-gray-400 font-mono">
                      {log.ip_address}
                    </td>
                    {hasPermission("Activity Log Show") && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewDetail(log)}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-700"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Left - Info */}
        <p className="text-sm font-medium text-text-primary dark:text-white">
          Displaying{" "}
          <span className="font-bold">{logs.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> ACTIVITY LOGS
        </p>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchLogs(1);
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
                onClick={() => fetchLogs(pagination.currentPage - 1)}
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
                  if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  typeof page === "string" ? (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-text-muted dark:text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchLogs(page)}
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
                onClick={() => fetchLogs(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                Activity Log Details
              </h3>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : selectedLog ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">Date/Time</p>
                    <p className="mt-1 text-sm text-text-primary dark:text-white">
                      {formatDate(selectedLog.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">User</p>
                    <p className="mt-1 text-sm text-text-primary dark:text-white">
                      {selectedLog.user?.name || `User #${selectedLog.user_id}`}
                    </p>
                    {selectedLog.user?.email && (
                      <p className="text-xs text-text-muted dark:text-gray-500">{selectedLog.user.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">Action</p>
                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      selectedLog.action.includes("created")
                        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : selectedLog.action.includes("deleted")
                        ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">Module</p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {selectedLog.module}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-text-muted dark:text-gray-400">Description</p>
                  <p className="mt-1 text-sm text-text-primary dark:text-white">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">IP Address</p>
                    <p className="mt-1 font-mono text-sm text-text-primary dark:text-white">{selectedLog.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">User Agent</p>
                    <p className="mt-1 text-xs text-text-muted dark:text-gray-400 break-all">{selectedLog.user_agent}</p>
                  </div>
                </div>

                {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted dark:text-gray-400">Payload</p>
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-text-primary dark:bg-gray-900 dark:text-gray-300">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-6">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <PermissionGuard permission="Activity Log Index">
      <AuditLogsContent />
    </PermissionGuard>
  );
}
