"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  X,
  ChevronDown,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { careerApplicationService, careerService } from "@/services";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { CareerApplication } from "@/services";

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

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Applied", value: "applied" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
  { label: "Offered", value: "offered" },
  { label: "Hired", value: "hired" },
];

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  reviewing: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  shortlisted: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  offered: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  hired: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function CareerApplicationsContent() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [careers, setCareers] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchApplications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: pagination.perPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (careerFilter) params.career_id = careerFilter;

      const resData = await careerApplicationService.getAll(params);

      if (Array.isArray(resData)) {
        setApplications(resData);
        setPagination((prev) => ({ ...prev, currentPage: 1, lastPage: 1, total: resData.length }));
      } else if (resData?.data) {
        setApplications(resData.data);
        setPagination({
          currentPage: resData.current_page || 1,
          lastPage: resData.last_page || 1,
          perPage: resData.per_page || 15,
          total: resData.total || 0,
        });
      } else {
        setApplications([]);
      }
    } catch {
      toast("Failed to load applications", "error");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, careerFilter, pagination.perPage, toast]);

  const fetchCareers = useCallback(async () => {
    try {
      const resData = await careerService.getAll({ per_page: 200 });
      if (resData?.data) {
        setCareers(resData.data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Applications</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage job applications ({pagination.total} total)
          </p>
        </div>
      </div>

      {/* Search + Filters - 1 Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, phone, code..."
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
          options={STATUS_OPTIONS}
          placeholder="All Status"
        />
        <SearchSelect
          value={careerFilter}
          onChange={setCareerFilter}
          options={[
            { label: "All Jobs", value: "" },
            ...careers.map((c) => ({ label: c.title, value: String(c.id) })),
          ]}
          placeholder="All Jobs"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <FileText className="h-10 w-10 opacity-30" />
            <p>No applications found</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Applicant</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Applied For</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary dark:text-white">{app.fullname}</span>
                        <span className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {app.email}
                        </span>
                        <span className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {app.phone_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400">
                      {app.career?.title || `-`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[app.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === app.id ? null : app.id); }}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === app.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => { router.push(`/career-applications/${app.id}`); setActionMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </button>
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
          <span className="font-bold">{applications.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> APPLICATIONS
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchApplications(1);
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
                onClick={() => fetchApplications(pagination.currentPage - 1)}
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
                      onClick={() => fetchApplications(page)}
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
                onClick={() => fetchApplications(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CareerApplicationsPage() {
  return (
    <PermissionGuard permission="Career Application Index">
      <CareerApplicationsContent />
    </PermissionGuard>
  );
}
