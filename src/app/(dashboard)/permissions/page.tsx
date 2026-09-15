"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Key } from "lucide-react";
import apiClient from "@/lib/api-client";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSION_GROUPS } from "@/lib/constants";
import type { Permission } from "@/types";

function PermissionsContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/permissions");
      const data = response.data.data;
      setPermissions(Array.isArray(data) ? data : data?.data || []);
      // Expand all groups by default
      const groups = new Set(PERMISSION_GROUPS.map((g) => g.name));
      setExpandedGroups(groups);
    } catch {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const groupedPermissions = PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: group.permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.permissions.length > 0 || !searchQuery);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Permissions</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            System permissions organized by module ({permissions.length} total)
          </p>
        </div>
        <button
          onClick={fetchPermissions}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Permission Groups */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : groupedPermissions.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-text-muted dark:text-gray-400">
          No permissions found
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
                        <th className="px-5 py-2.5 font-medium text-text-muted dark:text-gray-400">Description</th>
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
                            {perm.description}
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
