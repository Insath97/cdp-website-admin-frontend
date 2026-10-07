"use client";

import { useState, useEffect, useCallback, useId } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  faqService,
  faqTypeService,
  type Faq,
  type FaqType,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function FaqsPage() {
  const { toast } = useToast();
  const perPageSelectId = useId();

  // Active Tab: "faqs" | "types"
  const [activeTab, setActiveTab] = useState<"faqs" | "types">("faqs");

  // FAQs State
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqTypes, setFaqTypes] = useState<FaqType[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedFaqTypeFilter, setSelectedFaqTypeFilter] = useState<string>("");
  const [faqCurrentPage, setFaqCurrentPage] = useState(1);
  const [faqTotalPages, setFaqTotalPages] = useState(1);
  const [faqTotalCount, setFaqTotalCount] = useState(0);
  const [faqPerPage, setFaqPerPage] = useState(15);

  // FAQ Types State
  const [typesLoading, setTypesLoading] = useState(true);
  const [typeSearch, setTypeSearch] = useState("");
  const [typeCurrentPage, setTypeCurrentPage] = useState(1);
  const [typeTotalPages, setTypeTotalPages] = useState(1);
  const [typeTotalCount, setTypeTotalCount] = useState(0);
  const [typePerPage, setTypePerPage] = useState(15);

  // FAQ Modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqForm, setFaqForm] = useState({
    faq_type_id: 0,
    question: "",
    answers: "",
    is_active: true,
  });
  const [savingFaq, setSavingFaq] = useState(false);

  // FAQ Type Modal state
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<FaqType | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });
  const [savingType, setSavingType] = useState(false);

  // Delete Confirm Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string; type: "faq" | "type" } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Row dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Fetch FAQ Types for select dropdowns & categories tab
  const fetchFaqTypes = useCallback(async () => {
    try {
      setTypesLoading(true);
      const res = await faqTypeService.getAll({
        page: typeCurrentPage,
        per_page: typePerPage,
        search: typeSearch || undefined,
      });
      setFaqTypes(res.data);
      setTypeTotalPages(res.meta?.last_page || 1);
      setTypeTotalCount(res.meta?.total || res.data.length);
    } catch {
      toast("Failed to load FAQ categories", "error");
    } finally {
      setTypesLoading(false);
    }
  }, [typeCurrentPage, typePerPage, typeSearch, toast]);

  // Fetch FAQs
  const fetchFaqs = useCallback(async () => {
    try {
      setFaqLoading(true);
      const res = await faqService.getAll({
        page: faqCurrentPage,
        per_page: faqPerPage,
        search: faqSearch || undefined,
        faq_type_id: selectedFaqTypeFilter || undefined,
      });
      setFaqs(res.data);
      setFaqTotalPages(res.meta?.last_page || 1);
      setFaqTotalCount(res.meta?.total || res.data.length);
    } catch {
      toast("Failed to load FAQs", "error");
    } finally {
      setFaqLoading(false);
    }
  }, [faqCurrentPage, faqPerPage, faqSearch, selectedFaqTypeFilter, toast]);

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setFaqSearch(searchParam);
      setTypeSearch(searchParam);
    }
  }, []);

  useEffect(() => {
    fetchFaqTypes();
  }, [fetchFaqTypes]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Toggle FAQ active status
  const handleToggleFaqStatus = async (faq: Faq) => {
    try {
      await faqService.toggleStatus(faq.id);
      toast(`FAQ status updated`, "success");
      fetchFaqs();
    } catch {
      toast("Failed to update FAQ status", "error");
    }
  };

  // Toggle FAQ Type active status
  const handleToggleTypeStatus = async (type: FaqType) => {
    try {
      await faqTypeService.toggleStatus(type.id);
      toast(`Category status updated`, "success");
      fetchFaqTypes();
    } catch {
      toast("Failed to update category status", "error");
    }
  };

  // Open Create FAQ Modal
  const openCreateFaqModal = () => {
    setEditingFaq(null);
    setFaqForm({
      faq_type_id: faqTypes[0]?.id || 0,
      question: "",
      answers: "",
      is_active: true,
    });
    setFaqModalOpen(true);
  };

  // Open Edit FAQ Modal
  const openEditFaqModal = (faq: Faq) => {
    setEditingFaq(faq);
    setFaqForm({
      faq_type_id: faq.faq_type_id,
      question: faq.question,
      answers: faq.answers,
      is_active: faq.is_active,
    });
    setFaqModalOpen(true);
    setOpenDropdownId(null);
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answers.trim() || !faqForm.faq_type_id) {
      toast("Please fill all required fields", "warning");
      return;
    }
    try {
      setSavingFaq(true);
      if (editingFaq) {
        await faqService.update(editingFaq.id, faqForm);
        toast("FAQ updated successfully", "success");
      } else {
        await faqService.create(faqForm);
        toast("FAQ created successfully", "success");
      }
      setFaqModalOpen(false);
      fetchFaqs();
    } catch {
      toast("Failed to save FAQ", "error");
    } finally {
      setSavingFaq(false);
    }
  };

  // Open Create Type Modal
  const openCreateTypeModal = () => {
    setEditingType(null);
    setTypeForm({
      name: "",
      slug: "",
      description: "",
      is_active: true,
    });
    setTypeModalOpen(true);
  };

  // Open Edit Type Modal
  const openEditTypeModal = (type: FaqType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      slug: type.slug,
      description: type.description || "",
      is_active: type.is_active,
    });
    setTypeModalOpen(true);
    setOpenDropdownId(null);
  };

  // Save FAQ Type
  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.name.trim()) {
      toast("Category name is required", "warning");
      return;
    }
    try {
      setSavingType(true);
      if (editingType) {
        await faqTypeService.update(editingType.id, typeForm);
        toast("Category updated successfully", "success");
      } else {
        await faqTypeService.create(typeForm);
        toast("Category created successfully", "success");
      }
      setTypeModalOpen(false);
      fetchFaqTypes();
    } catch {
      toast("Failed to save category", "error");
    } finally {
      setSavingType(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      if (deleteTarget.type === "faq") {
        await faqService.delete(deleteTarget.id);
        toast("FAQ deleted successfully", "success");
        fetchFaqs();
      } else {
        await faqTypeService.delete(deleteTarget.id);
        toast("Category deleted successfully", "success");
        fetchFaqTypes();
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch {
      toast("Failed to delete item", "error");
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
            Frequently Asked Questions
          </h1>
          <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
            Manage public FAQs and categorization across Ceylon Development Plantation.
          </p>
        </div>

        {/* Tab-aware Primary Action */}
        <div className="flex items-center gap-2">
          {activeTab === "faqs" ? (
            <PermissionGuard permission="Faq Create">
              <Button onClick={openCreateFaqModal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add FAQ
              </Button>
            </PermissionGuard>
          ) : (
            <PermissionGuard permission="Faq Type Create">
              <Button onClick={openCreateTypeModal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border dark:border-gray-800">
        <nav className="flex space-x-6" aria-label="FAQ sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "faqs"}
            onClick={() => setActiveTab("faqs")}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "faqs"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Questions ({faqTotalCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "types"}
            onClick={() => setActiveTab("types")}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "types"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <Layers className="h-4 w-4" />
            Categories ({typeTotalCount})
          </button>
        </nav>
      </div>

      {/* FAQs Tab Content */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search questions or answers..."
                  value={faqSearch}
                  onChange={(e) => {
                    setFaqSearch(e.target.value);
                    setFaqCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Filter className="h-4 w-4 text-text-muted dark:text-gray-400 shrink-0" />
                <select
                  value={selectedFaqTypeFilter}
                  onChange={(e) => {
                    setSelectedFaqTypeFilter(e.target.value);
                    setFaqCurrentPage(1);
                  }}
                  className="w-full text-xs rounded-lg border border-border bg-white px-3 py-2 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {faqTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAQs Table */}
          <div className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-xs">
            <div className="w-full overflow-x-auto touch-scroll">
              <table className="w-full text-left text-sm min-w-[750px]">
                <thead className="bg-gray-50/75 dark:bg-gray-900/50 border-b border-border dark:border-gray-700 text-xs uppercase text-text-muted dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Question</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Category</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {faqLoading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-text-muted dark:text-gray-400">
                        Loading FAQs...
                      </td>
                    </tr>
                  ) : faqs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-text-muted dark:text-gray-400">
                        No FAQs found. Create your first question using the Add FAQ button above.
                      </td>
                    </tr>
                  ) : (
                    faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 max-w-md">
                          <p className="font-semibold text-text-primary dark:text-white line-clamp-1">
                            {faq.question}
                          </p>
                          <p className="text-xs text-text-muted dark:text-gray-400 mt-1 line-clamp-2">
                            {faq.answers}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                            {faq.faq_type?.name || faq.faqType?.name || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleFaqStatus(faq)}
                            aria-label={`Toggle status for ${faq.question}. Current status: ${faq.is_active ? "Active" : "Inactive"}`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              faq.is_active
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${faq.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                            {faq.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(openDropdownId === `faq-${faq.id}` ? null : `faq-${faq.id}`)}
                              aria-label={`Open actions for ${faq.question}`}
                              aria-expanded={openDropdownId === `faq-${faq.id}`}
                              aria-haspopup="menu"
                              className="p-1.5 text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openDropdownId === `faq-${faq.id}` && (
                              <div
                                role="menu"
                                className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-border dark:border-gray-700 py-1 z-10"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => openEditFaqModal(faq)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setDeleteTarget({ id: faq.id, title: faq.question, type: "faq" });
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
                  value={faqPerPage}
                  onChange={(e) => {
                    setFaqPerPage(Number(e.target.value));
                    setFaqCurrentPage(1);
                  }}
                  className="rounded-md border border-border dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Total: {faqTotalCount}</span>
              </div>
              <nav aria-label="FAQ pagination" className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={faqCurrentPage <= 1}
                  onClick={() => setFaqCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <span className="px-3 py-1 font-medium text-text-primary dark:text-white">
                  Page {faqCurrentPage} of {faqTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={faqCurrentPage >= faqTotalPages}
                  onClick={() => setFaqCurrentPage((p) => Math.min(faqTotalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab Content */}
      {activeTab === "types" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search FAQ categories..."
                value={typeSearch}
                onChange={(e) => {
                  setTypeSearch(e.target.value);
                  setTypeCurrentPage(1);
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
                    <th scope="col" className="px-6 py-3.5 font-semibold">Name</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Slug</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Description</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {typesLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                        Loading categories...
                      </td>
                    </tr>
                  ) : faqTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                        No categories found. Create a category using the Add Category button above.
                      </td>
                    </tr>
                  ) : (
                    faqTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary dark:text-white">
                          {type.name}
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
                            onClick={() => handleToggleTypeStatus(type)}
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
                              onClick={() => setOpenDropdownId(openDropdownId === `type-${type.id}` ? null : `type-${type.id}`)}
                              aria-label={`Open actions for category ${type.name}`}
                              className="p-1.5 text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openDropdownId === `type-${type.id}` && (
                              <div
                                role="menu"
                                className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-border dark:border-gray-700 py-1 z-10"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => openEditTypeModal(type)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setDeleteTarget({ id: type.id, title: type.name, type: "type" });
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
              <span>Total categories: {typeTotalCount}</span>
              <nav aria-label="Category pagination" className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={typeCurrentPage <= 1}
                  onClick={() => setTypeCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <span className="px-3 py-1 font-medium text-text-primary dark:text-white">
                  Page {typeCurrentPage} of {typeTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={typeCurrentPage >= typeTotalPages}
                  onClick={() => setTypeCurrentPage((p) => Math.min(typeTotalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit FAQ Dialog */}
      <Dialog
        open={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? "Edit FAQ" : "Add FAQ"}
      >
        <form onSubmit={handleSaveFaq} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Category *
            </label>
            <select
              value={faqForm.faq_type_id}
              onChange={(e) => setFaqForm({ ...faqForm, faq_type_id: Number(e.target.value) })}
              className="w-full text-sm rounded-lg border border-border bg-white px-3 py-2 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              required
            >
              <option value={0} disabled>Select a category</option>
              {faqTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Question *
            </label>
            <Input
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              placeholder="e.g. How are investment returns distributed?"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Answer *
            </label>
            <textarea
              value={faqForm.answers}
              onChange={(e) => setFaqForm({ ...faqForm, answers: e.target.value })}
              placeholder="Enter comprehensive answer text..."
              rows={4}
              required
              className="w-full text-sm rounded-lg border border-border bg-white p-3 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="faq-active-check"
              checked={faqForm.is_active}
              onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary dark:border-gray-700"
            />
            <label htmlFor="faq-active-check" className="text-xs font-medium text-text-primary dark:text-gray-300">
              Active / Visible on public website
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setFaqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingFaq}>
              {savingFaq ? "Saving..." : editingFaq ? "Update FAQ" : "Create FAQ"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create / Edit Category Dialog */}
      <Dialog
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        title={editingType ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSaveType} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Category Name *
            </label>
            <Input
              value={typeForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                setTypeForm({ ...typeForm, name, slug: editingType ? typeForm.slug : slug });
              }}
              placeholder="e.g. Agronomy & Cultivation"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Slug
            </label>
            <Input
              value={typeForm.slug}
              onChange={(e) => setTypeForm({ ...typeForm, slug: e.target.value })}
              placeholder="e.g. agronomy-cultivation"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
              Description
            </label>
            <textarea
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              placeholder="Optional brief description..."
              rows={2}
              className="w-full text-sm rounded-lg border border-border bg-white p-3 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="type-active-check"
              checked={typeForm.is_active}
              onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary dark:border-gray-700"
            />
            <label htmlFor="type-active-check" className="text-xs font-medium text-text-primary dark:text-gray-300">
              Active Category
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingType}>
              {savingType ? "Saving..." : editingType ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete ${deleteTarget?.type === "faq" ? "FAQ" : "Category"}?`}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
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
