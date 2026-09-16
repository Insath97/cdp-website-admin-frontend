"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  X,
  ChevronDown,
  Tag,
  Save,
  Loader2,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { ContactType } from "@/types";

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

function ContactTypeModal({
  open,
  onClose,
  onSave,
  contactType,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  contactType?: ContactType | null;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!contactType;

  useEffect(() => {
    if (open) {
      if (contactType) {
        setFormData({
          name: contactType.name || "",
          code: contactType.code || "",
          description: contactType.description || "",
          is_active: contactType.is_active,
        });
      } else {
        setFormData({ name: "", code: "", description: "", is_active: true });
      }
      setFormErrors({});
    }
  }, [open, contactType]);

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await apiClient.put(`/contact-types/${contactType.id}`, {
          ...formData,
          is_active: formData.is_active ? 1 : 0,
        });
        toast("Contact type updated successfully", "success");
      } else {
        await apiClient.post("/contact-types", {
          ...formData,
          is_active: formData.is_active ? 1 : 0,
        });
        toast("Contact type created successfully", "success");
      }
      onSave();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
      toast(`Failed to ${isEdit ? "update" : "create"} contact type`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white">
            {isEdit ? "Edit Contact Type" : "Create Contact Type"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name + Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Enter code"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {formErrors.code && <p className="mt-1 text-xs text-red-500">{formErrors.code[0]}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter description (optional)"
              maxLength={1024}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-text-muted dark:text-gray-500">{formData.description.length}/1024</p>
            {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description[0]}</p>}
          </div>

          {/* Status */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className="text-sm font-medium text-text-primary dark:text-gray-300">Active</span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.name || !formData.code}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactTypesContent() {
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; contactType: ContactType | null }>({ open: false, contactType: null });
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContactType, setEditingContactType] = useState<ContactType | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchContactTypes = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: pagination.perPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.is_active = statusFilter;

      const response = await apiClient.get("/contact-types", { params });
      const resData = response.data.data;

      if (Array.isArray(resData)) {
        setContactTypes(resData);
        setPagination((prev) => ({ ...prev, currentPage: 1, lastPage: 1, total: resData.length }));
      } else if (resData?.data) {
        setContactTypes(resData.data);
        setPagination({
          currentPage: resData.current_page || 1,
          lastPage: resData.last_page || 1,
          perPage: resData.per_page || 15,
          total: resData.total || 0,
        });
      } else {
        setContactTypes([]);
      }
    } catch {
      toast("Failed to load contact types", "error");
      setContactTypes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, pagination.perPage, toast]);

  useEffect(() => {
    fetchContactTypes(1);
  }, [fetchContactTypes]);

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
    if (!deleteDialog.contactType) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/contact-types/${deleteDialog.contactType.id}`);
      fetchContactTypes(pagination.currentPage);
      toast("Contact type deleted successfully", "success");
      setDeleteDialog({ open: false, contactType: null });
    } catch {
      toast("Failed to delete contact type", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (contactType: ContactType) => {
    const endpoint = contactType.is_active
      ? `/contact-types/${contactType.id}/deactivate`
      : `/contact-types/${contactType.id}/activate`;
    try {
      await apiClient.patch(endpoint);
      fetchContactTypes(pagination.currentPage);
      toast(`Contact type ${contactType.is_active ? "deactivated" : "activated"} successfully`, "success");
    } catch {
      toast("Failed to update contact type status", "error");
    }
  };

  const openCreateModal = () => {
    setEditingContactType(null);
    setModalOpen(true);
  };

  const openEditModal = (ct: ContactType) => {
    setEditingContactType(ct);
    setModalOpen(true);
    setActionMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Contact Types</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage contact types ({pagination.total} total)
          </p>
        </div>
        {hasPermission("Contact Type Create") && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Contact Type
          </button>
        )}
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search contact types by name, code or slug..."
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
        ) : contactTypes.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-text-muted dark:text-gray-400">
            <Tag className="h-10 w-10 opacity-30" />
            <p>No contact types found</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-gray-700">
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Code</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Description</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {contactTypes.map((ct) => (
                  <tr key={ct.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {ct.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary dark:text-white">{ct.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {ct.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted dark:text-gray-400 max-w-[200px] truncate">
                      {ct.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ct.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {ct.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === ct.id ? null : ct.id); }}
                          className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {actionMenuId === ct.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            {hasPermission("Contact Type Update") && (
                              <button
                                onClick={() => openEditModal(ct)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </button>
                            )}
                            {hasPermission("Contact Type Toggle Active") && (
                              <button
                                onClick={() => { handleToggleStatus(ct); setActionMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {ct.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                                {ct.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {hasPermission("Contact Type Delete") && (
                              <button
                                onClick={() => { setDeleteDialog({ open: true, contactType: ct }); setActionMenuId(null); }}
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
          <span className="font-bold">{contactTypes.length}</span> of{" "}
          <span className="font-bold">{pagination.total}</span> CONTACT TYPES
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-gray-400">Show</span>
            <select
              value={pagination.perPage}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, perPage: Number(e.target.value) }));
                fetchContactTypes(1);
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
                onClick={() => fetchContactTypes(pagination.currentPage - 1)}
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
                      onClick={() => fetchContactTypes(page)}
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
                onClick={() => fetchContactTypes(pagination.currentPage + 1)}
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
        message={`Are you sure you want to delete "${deleteDialog.contactType?.name}"?`}
        confirmLabel={deleting ? "Deleting..." : "Yes, Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, contactType: null })}
        loading={deleting}
      />

      {/* Create/Edit Modal */}
      <ContactTypeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingContactType(null); }}
        onSave={() => fetchContactTypes(pagination.currentPage)}
        contactType={editingContactType}
      />
    </div>
  );
}

export default function ContactTypesPage() {
  return (
    <PermissionGuard permission="Contact Type Index">
      <ContactTypesContent />
    </PermissionGuard>
  );
}
