"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, RefreshCw, Key, X, ChevronDown } from "lucide-react";
import apiClient from "@/lib/api-client";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useToast } from "@/components/ui/toast";
import type { Permission } from "@/types";

function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
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

  const displayValue = value || "";

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
        <span className={displayValue ? "text-text-primary dark:text-white" : "text-text-muted dark:text-gray-400"}>
          {displayValue || placeholder}
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
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm ${
                    opt === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-primary hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionsContent() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { per_page: 200 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (groupFilter) params.group_name = groupFilter;

      const response = await apiClient.get("/permissions", { params });
      const resData = response.data.data;

      let items: Permission[] = [];
      if (Array.isArray(resData)) {
        items = resData;
      } else if (resData?.data) {
        items = resData.data;
      }

      setPermissions(items);
      setTotal(items.length);

      const groups = new Set(items.map((p) => p.group_name));
      setExpandedGroups(groups);
    } catch {
      toast("Failed to load permissions", "error");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, groupFilter, toast]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(groupedPermissions.map((g) => g.name));
    setExpandedGroups(all);
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const groupNames = [...new Set(permissions.map((p) => p.group_name))].sort();

  const groupedPermissions = permissions.reduce<{ name: string; permissions: Permission[] }[]>((acc, perm) => {
    const existing = acc.find((g) => g.name === perm.group_name);
    if (existing) {
      existing.permissions.push(perm);
    } else {
      acc.push({ name: perm.group_name, permissions: [perm] });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Permissions</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            System permissions organized by module ({total} total)
          </p>
        </div>
        <button
          onClick={fetchPermissions}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Search + Group Filter - 1 Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search permissions by name or description..."
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
          value={groupFilter}
          onChange={setGroupFilter}
          options={groupNames}
          placeholder="All Groups"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted dark:text-gray-400">
          {groupedPermissions.length} group{groupedPermissions.length !== 1 ? "s" : ""} &middot; {total} permission{total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Permission Groups */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : groupedPermissions.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
          <Key className="h-10 w-10 opacity-30" />
          <p>No permissions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedPermissions.map((group) => (
            <div
              key={group.name}
              className="overflow-hidden rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-xs text-text-muted dark:text-gray-400">
                      {group.permissions.length} permissions
                    </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-text-muted transition-transform ${
                    expandedGroups.has(group.name) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {expandedGroups.has(group.name) && (
                <div className="border-t border-border dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border dark:border-gray-700">
                        <th className="px-5 py-2.5 font-medium text-text-muted dark:text-gray-400">Permission</th>
                        <th className="px-5 py-2.5 font-medium text-text-muted dark:text-gray-400">Guard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-gray-700">
                      {group.permissions.map((perm) => (
                        <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-5 py-2.5">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {perm.name}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-text-muted dark:text-gray-400">
                            {perm.guard_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <PermissionGuard permission="Permission Index">
      <PermissionsContent />
    </PermissionGuard>
  );
}
