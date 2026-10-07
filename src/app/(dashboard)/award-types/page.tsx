"use client";

import { useState, useEffect, useCallback, useId } from "react";
import {
  Award,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  awardTypeService,
  type AwardType,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function AwardTypesPage() {
  const { toast } = useToast();
  const perPageSelectId = useId();

  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(15);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AwardType | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AwardType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchAwardTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await awardTypeService.getAll({
        page: currentPage,
        per_page: perPage,
        search: search || undefined,
      });
      setAwardTypes(res.data);
      setTotalPages(res.meta?.last_page || 1);
      setTotalCount(res.meta?.total || res.data.length);
    } catch {
      toast("Failed to load award categories", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) setSearch(searchParam);
  }, []);

  useEffect(() => {
    fetchAwardTypes();
  }, [fetchAwardTypes]);

  const handleToggleStatus = async (type: AwardType) => {
    try {
      await awardTypeService.toggleStatus(type.id);
      toast("Category status updated", "success");
      fetchAwardTypes();
    } catch {
      toast("Failed to update category status", "error");
    }
  };

  const openCreateModal = () => {
    setEditingType(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (type: AwardType) => {
    setEditingType(type);
    setForm({
      name: type.name,
      slug: type.slug,
      description: type.description || "",
      is_active: type.is_active,
    });
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Category name is required", "warning");
      return;
    }
    try {
      setSaving(true);
      if (editingType) {
        await awardTypeService.update(editingType.id, form);
        toast("Award category updated", "success");
      } else {
        await awardTypeService.create(form);
        toast("Award category created", "success");
      }
      setModalOpen(false);
      fetchAwardTypes();
    } catch {
      toast("Failed to save award category", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await awardTypeService.delete(deleteTarget.id);
      toast("Award category deleted", "success");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchAwardTypes();
    } catch {
      toast("Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-white">
            Award Categories
          </h1>
          <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
            Manage industry accreditations, certifications, and recognition categories.
          </p>
        </div>

        <PermissionGuard permission="Award Type Create">
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </PermissionGuard>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search award categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto touch-scroll">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50/75 dark:bg-gray-900/50 border-b border-border dark:border-gray-700 text-xs uppercase text-text-muted dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">Category Name</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Slug</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Description</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                    Loading award categories...
                  </td>
                </tr>
              ) : awardTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                    No award categories found. Create one with the Add Category button above.
                  </td>
                </tr>
              ) : (
                awardTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-primary dark:text-white flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>{type.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-muted dark:text-gray-400">
                      {type.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted dark:text-gray-400 max-w-xs truncate">
                      {type.description || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(type)}
                        aria-label={`Toggle category status for ${type.name}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          type.is_active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${type.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {type.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(openDropdownId === type.id ? null : type.id)}
                          aria-label={`Open actions for category ${type.name}`}
                          className="p-1.5 text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openDropdownId === type.id && (
                          <div
                            role="menu"
                            className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-border dark:border-gray-700 py-1 z-10"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => openEditModal(type)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setDeleteTarget(type);
                                setDeleteConfirmOpen(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border dark:border-gray-700 text-xs text-text-muted dark:text-gray-400">
          <div className="flex items-center gap-2">
            <label htmlFor={perPageSelectId}>Rows per page:</label>
            <select
              id={perPageSelectId}
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-border dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <span>Total: {totalCount}</span>
          </div>
          <nav aria-label="Award category pagination" className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="px-3 py-1 font-medium text-text-primary dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </nav>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingType ? "Edit Award Category" : "Add Award Category"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Category Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                setForm({ ...form, name, slug: editingType ? form.slug : slug });
              }}
              placeholder="e.g. Agricultural Standards & GAP"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Slug
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. agricultural-standards-gap"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description of this award type..."
              rows={3}
              className="w-full text-sm rounded-lg border border-border bg-white p-3 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="award-type-active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary dark:border-gray-700"
            />
            <label htmlFor="award-type-active" className="text-xs font-medium text-text-primary dark:text-gray-300">
              Active Category
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingType ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Award Category?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        danger={true}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
