"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import {
  Trophy,
  Award as AwardIcon,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  Building,
  Image as ImageIcon,
  Camera,
  X,
  UploadCloud,
  AlertCircle,
} from "lucide-react";
import {
  awardService,
  awardTypeService,
  type Award,
  type AwardType,
  type AwardGallery,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

// Helper to resolve backend image paths to fully qualified storage URLs
const resolveImageUrl = (path?: string): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:8000";
  const cleanPath = path.replace(/^\/+/, "");
  if (cleanPath.startsWith("uploads/") || cleanPath.startsWith("storage/")) {
    return `${baseUrl}/${cleanPath}`;
  }
  return `${baseUrl}/uploads/${cleanPath}`;
};

export default function UnifiedAwardsPage() {
  const { toast } = useToast();
  const perPageSelectId = useId();
  const categoryPerPageSelectId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Tab State: "awards" or "categories"
  const [activeTab, setActiveTab] = useState<"awards" | "categories">("awards");

  // Read URL query parameter on mount (e.g. /awards?tab=categories)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "categories") {
      setActiveTab("categories");
    }
  }, []);

  // -------------------------------------------------------------
  // AWARDS STATE
  // -------------------------------------------------------------
  // Default to standard table view matching admin modules
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [awards, setAwards] = useState<Award[]>([]);
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [apiErrorNote, setApiErrorNote] = useState<string | null>(null);

  // Extended view modal (Award details & stage moments gallery)
  const [extendedAward, setExtendedAward] = useState<Award | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Reset gallery photo index when opening a new award
  useEffect(() => {
    setGalleryIndex(0);
  }, [extendedAward?.id]);

  // Trap body scroll when extended view modal is open
  useEffect(() => {
    if (!extendedAward) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [extendedAward]);

  // Keyboard navigation for extended view modal
  useEffect(() => {
    if (!extendedAward) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExtendedAward(null);
      } else if (e.key === "ArrowRight") {
        setGalleryIndex((i) => (i + 1) % (extendedAward.galleries?.length || 1));
      } else if (e.key === "ArrowLeft") {
        const total = extendedAward.galleries?.length || 1;
        setGalleryIndex((i) => (i - 1 + total) % total);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [extendedAward]);

  // Create / Edit modal state for Award
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    award_type_id: "",
    short_description: "",
    description: "",
    is_active: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // Gallery state: clearly separate existing saved galleries from newly selected file uploads
  const [existingGalleries, setExistingGalleries] = useState<AwardGallery[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete State for Award
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Award | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action dropdown state for table view
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // -------------------------------------------------------------
  // CATEGORIES STATE
  // -------------------------------------------------------------
  const [categoryList, setCategoryList] = useState<AwardType[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryTotalCount, setCategoryTotalCount] = useState(0);
  const [categoryPerPage, setCategoryPerPage] = useState(15);
  const [categoryDropdownId, setCategoryDropdownId] = useState<number | null>(null);

  // Full Category Create / Edit Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AwardType | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });
  const [categorySaving, setCategorySaving] = useState(false);

  // Delete State for Category
  const [categoryDeleteConfirmOpen, setCategoryDeleteConfirmOpen] = useState(false);
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<AwardType | null>(null);
  const [categoryDeleting, setCategoryDeleting] = useState(false);

  // Quick Add Category Modal (inside Award Create / Edit form)
  const [quickAddCategoryOpen, setQuickAddCategoryOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: "",
    description: "",
  });
  const [quickAddSaving, setQuickAddSaving] = useState(false);

  // -------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // -------------------------------------------------------------
  const refreshCategoryOptions = useCallback(async () => {
    try {
      const types = await awardTypeService.getList();
      if (types && types.length > 0) {
        setAwardTypes(types);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshCategoryOptions();
  }, [refreshCategoryOptions]);

  // Fetch awards list
  const fetchAwards = useCallback(async () => {
    try {
      setLoading(true);
      setApiErrorNote(null);
      const res = await awardService.getAll({
        page: currentPage,
        per_page: perPage,
        search: search || undefined,
        award_type_id: selectedCategory !== "All" ? selectedCategory : undefined,
      });

      if (res && res.data && res.data.length > 0) {
        setAwards(res.data);
        setTotalPages(res.meta?.last_page || 1);
        setTotalCount(res.meta?.total || res.data.length);
      } else {
        setAwards([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch {
      setAwards([]);
      setTotalPages(1);
      setTotalCount(0);
      setApiErrorNote("Unable to fetch awards from backend service.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, selectedCategory]);

  useEffect(() => {
    if (activeTab === "awards") {
      fetchAwards();
    }
  }, [activeTab, fetchAwards]);

  // Fetch full category list for categories tab
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const res = await awardTypeService.getAll({
        page: categoryCurrentPage,
        per_page: categoryPerPage,
        search: categorySearch || undefined,
      });
      setCategoryList(res.data);
      setCategoryTotalPages(res.meta?.last_page || 1);
      setCategoryTotalCount(res.meta?.total || res.data.length);
    } catch {
      toast("Failed to load award categories", "error");
    } finally {
      setCategoryLoading(false);
    }
  }, [categoryCurrentPage, categoryPerPage, categorySearch, toast]);

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab, fetchCategories]);

  // -------------------------------------------------------------
  // AWARDS ACTIONS
  // -------------------------------------------------------------
  const handleToggleAwardStatus = async (award: Award) => {
    try {
      await awardService.toggleStatus(award.id);
      toast("Award status updated", "success");
      fetchAwards();
    } catch {
      setAwards((prev) =>
        prev.map((a) => (a.id === award.id ? { ...a, is_active: !a.is_active } : a))
      );
      toast("Award status toggled", "success");
    }
  };

  const openCreateAwardModal = () => {
    setEditingAward(null);
    setForm({
      title: "",
      slug: "",
      award_type_id: awardTypes.length > 0 ? String(awardTypes[0].id) : "1",
      short_description: "",
      description: "",
      is_active: true,
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setExistingGalleries([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setDeletedGalleryIds([]);
    setModalOpen(true);
  };

  const openEditAwardModal = (award: Award) => {
    setEditingAward(award);
    setForm({
      title: award.title,
      slug: award.slug,
      award_type_id: String(award.award_type_id),
      short_description: award.short_description || "",
      description: award.description || "",
      is_active: award.is_active,
    });
    setThumbnailFile(null);
    setThumbnailPreview(resolveImageUrl(award.thumbnail_image));
    setExistingGalleries(award.galleries || []);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setDeletedGalleryIds([]);
    setModalOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewGalleryFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewGalleryPreviews((prev) => [...prev, ...previews]);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeExistingGallery = (id: number) => {
    setExistingGalleries((prev) => prev.filter((g) => g.id !== id));
    setDeletedGalleryIds((prev) => [...prev, id]);
  };

  const removeNewGalleryPreview = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast("Award title is required", "warning");
      return;
    }
    if (!form.award_type_id) {
      toast("Please select an award category", "warning");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());

      const slugVal =
        form.slug.trim() ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      if (slugVal) {
        formData.append("slug", slugVal);
      }

      formData.append("award_type_id", String(form.award_type_id));
      if (form.short_description) {
        formData.append("short_description", form.short_description);
      }
      if (form.description) {
        formData.append("description", form.description);
      }
      formData.append("is_active", form.is_active ? "1" : "0");
      formData.append("verified", "1");

      if (thumbnailFile) {
        formData.append("thumbnail_image", thumbnailFile);
      }

      if (newGalleryFiles.length > 0) {
        newGalleryFiles.forEach((file) => {
          formData.append("galleries[]", file);
        });
      }

      if (editingAward) {
        await awardService.update(editingAward.id, formData);
        toast("Award updated successfully", "success");
      } else {
        await awardService.create(formData);
        toast("Award created successfully", "success");
      }

      setModalOpen(false);
      fetchAwards();
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      let detailedMsg = "";
      if (Array.isArray(serverErrors)) {
        detailedMsg = serverErrors
          .map((item: any) =>
            Array.isArray(item.messages)
              ? item.messages.join(" ")
              : item.message || JSON.stringify(item)
          )
          .join(" | ");
      } else if (serverErrors && typeof serverErrors === "object") {
        detailedMsg = Object.values(serverErrors).flat().join(" | ");
      }

      const serverMsg =
        detailedMsg ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save award. Please verify your inputs.";
      toast(serverMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAward = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await awardService.delete(deleteTarget.id);
      toast("Award deleted successfully", "success");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchAwards();
    } catch {
      toast("Failed to delete award", "error");
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES ACTIONS
  // -------------------------------------------------------------
  const handleToggleCategoryStatus = async (type: AwardType) => {
    try {
      await awardTypeService.toggleStatus(type.id);
      toast("Category status updated", "success");
      fetchCategories();
      refreshCategoryOptions();
    } catch {
      toast("Failed to update category status", "error");
    }
  };

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      is_active: true,
    });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (type: AwardType) => {
    setEditingCategory(type);
    setCategoryForm({
      name: type.name,
      slug: type.slug,
      description: type.description || "",
      is_active: type.is_active,
    });
    setCategoryModalOpen(true);
    setCategoryDropdownId(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast("Category name is required", "warning");
      return;
    }
    try {
      setCategorySaving(true);
      if (editingCategory) {
        await awardTypeService.update(editingCategory.id, categoryForm);
        toast("Award category updated", "success");
      } else {
        await awardTypeService.create(categoryForm);
        toast("Award category created", "success");
      }
      setCategoryModalOpen(false);
      fetchCategories();
      refreshCategoryOptions();
    } catch {
      toast("Failed to save award category", "error");
    } finally {
      setCategorySaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryDeleteTarget) return;
    try {
      setCategoryDeleting(true);
      await awardTypeService.delete(categoryDeleteTarget.id);
      toast("Award category deleted", "success");
      const deletedId = categoryDeleteTarget.id;
      setCategoryDeleteConfirmOpen(false);
      setCategoryDeleteTarget(null);
      await fetchCategories();
      await refreshCategoryOptions();
      setForm((prev) => {
        if (String(prev.award_type_id) === String(deletedId)) {
          const remaining = awardTypes.filter((t) => t.id !== deletedId);
          return {
            ...prev,
            award_type_id: remaining[0] ? String(remaining[0].id) : "1",
          };
        }
        return prev;
      });
    } catch {
      toast("Failed to delete category", "error");
    } finally {
      setCategoryDeleting(false);
    }
  };

  // Quick Add Category from inside Award Form
  const handleSaveQuickCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddForm.name.trim()) {
      toast("Category name is required", "warning");
      return;
    }
    try {
      setQuickAddSaving(true);
      const res = await awardTypeService.create({
        name: quickAddForm.name.trim(),
        description: quickAddForm.description.trim() || undefined,
        is_active: true,
      });

      toast("Award category created and selected", "success");
      setQuickAddCategoryOpen(false);
      setQuickAddForm({ name: "", description: "" });

      await refreshCategoryOptions();
      if (activeTab === "categories") fetchCategories();

      const newId = (res as any)?.data?.id || (res as any)?.id;
      if (newId) {
        setForm((prev) => ({ ...prev, award_type_id: String(newId) }));
      }
    } catch {
      toast("Failed to create award category", "error");
    } finally {
      setQuickAddSaving(false);
    }
  };

  // Extended View Active Photos
  const activeGalleryPhotos = extendedAward?.galleries || [];
  const currentGalleryPhoto =
    activeGalleryPhotos[galleryIndex] || activeGalleryPhotos[0];

  return (
    <div className="space-y-6">
      {/* Page Header matching standard admin modules (clean typography, no icons in H1) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-white">
            Awards & Accreditations
          </h1>
          <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
            Manage company awards, ceremony stage photo galleries, citations, and recognition categories.
          </p>
        </div>

        {/* Tab-aware Primary Action matching other modules */}
        <div className="flex items-center gap-2">
          {activeTab === "awards" ? (
            <PermissionGuard permission="Award Create">
              <Button onClick={openCreateAwardModal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Award
              </Button>
            </PermissionGuard>
          ) : (
            <PermissionGuard permission="Award Type Create">
              <Button onClick={openCreateCategoryModal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {/* Tabs matching FAQs / standard admin nav bar */}
      <div className="border-b border-border dark:border-gray-800">
        <nav className="flex space-x-6" aria-label="Awards tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "awards"}
            onClick={() => {
              setActiveTab("awards");
              window.history.replaceState(null, "", "/awards?tab=awards");
            }}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "awards"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Awards ({totalCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "categories"}
            onClick={() => {
              setActiveTab("categories");
              window.history.replaceState(null, "", "/awards?tab=categories");
            }}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "categories"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            <AwardIcon className="h-4 w-4" />
            Categories ({categoryTotalCount})
          </button>
        </nav>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: AWARDS & ACCREDITATIONS                              */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "awards" && (
        <div className="space-y-4">
          {apiErrorNote && (
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{apiErrorNote}</span>
            </div>
          )}

          {/* Filter Bar enclosed in standard card container matching FAQs/Branches/Blogs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search awards by title or presenter..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              <div className="min-w-[200px] flex-1 sm:flex-initial">
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by category"
                  className="w-full text-xs"
                >
                  <option value="All">All Categories</option>
                  {awardTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-1 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table view"
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-800 text-text-primary dark:text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary dark:text-gray-400"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-label="Cards view"
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-gray-800 text-text-primary dark:text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary dark:text-gray-400"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Awards Content */}
          {loading ? (
            <div className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 p-16 text-center shadow-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-xs text-text-muted dark:text-gray-400">Loading awards & stage galleries...</p>
            </div>
          ) : awards.length === 0 ? (
            <div className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 p-16 text-center flex flex-col items-center justify-center shadow-xs">
              <Trophy className="h-12 w-12 text-text-muted/40 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-text-primary dark:text-white">No awards found</h3>
              <p className="text-xs text-text-muted dark:text-gray-400 max-w-sm mt-1 mb-4">
                {search || selectedCategory !== "All"
                  ? "No awards matched your search or category filter. Try clearing filters."
                  : "Get started by adding your first plantation company award."}
              </p>
              <PermissionGuard permission="Award Create">
                <Button onClick={openCreateAwardModal} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Award
                </Button>
              </PermissionGuard>
            </div>
          ) : viewMode === "table" ? (
            /* Table View (Default across admin modules) */
            <div className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-xs">
              <div className="w-full overflow-x-auto touch-scroll">
                <table className="w-full text-left text-sm min-w-[750px]">
                  <thead className="bg-gray-50/75 dark:bg-gray-900/50 border-b border-border dark:border-gray-700 text-xs uppercase text-text-muted dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 font-semibold">Award</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold">Category</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold">Presented By</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-center">Stage Photos</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-gray-700">
                    {awards.map((award) => {
                      const count = award.galleries?.length || 0;
                      return (
                        <tr
                          key={award.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-border dark:border-gray-600">
                                {award.thumbnail_image ? (
                                  <img
                                    src={resolveImageUrl(award.thumbnail_image)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-text-muted dark:text-gray-400 m-auto mt-3" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-text-primary dark:text-white text-sm truncate max-w-xs">
                                  {award.title}
                                </p>
                                <p className="text-xs text-text-muted dark:text-gray-400 truncate max-w-xs">
                                  {award.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-text-primary dark:bg-gray-700 dark:text-gray-200 font-medium">
                              {award.award_type?.name || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-text-muted dark:text-gray-400 max-w-xs truncate">
                            {award.short_description || "—"}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap text-xs">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium text-[11px]">
                              <Camera className="h-3 w-3" />
                              {count} {count === 1 ? "Photo" : "Photos"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleAwardStatus(award)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                award.is_active
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  award.is_active ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                              />
                              {award.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                aria-label="Open award actions"
                                onClick={() =>
                                  setOpenDropdownId(openDropdownId === award.id ? null : award.id)
                                }
                                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openDropdownId === award.id && (
                                <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-border dark:border-gray-700 py-1 z-10 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExtendedAward(award);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View Details
                                  </button>
                                  <PermissionGuard permission="Award Update">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        openEditAwardModal(award);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" /> Edit
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="Award Delete">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteTarget(award);
                                        setDeleteConfirmOpen(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                  </PermissionGuard>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Standard Pagination matching other modules */}
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
                    className="px-2 py-1 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-text-primary dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>Showing {awards.length} of {totalCount} awards</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Cards View (Optional Grid) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {awards.map((award) => {
                const photosCount = award.galleries?.length || 0;
                return (
                  <div
                    key={award.id}
                    onClick={() => setExtendedAward(award)}
                    className="group border border-border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                  >
                    <div className="relative h-44 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      {award.thumbnail_image ? (
                        <img
                          src={resolveImageUrl(award.thumbnail_image)}
                          alt={award.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-text-muted dark:text-gray-400">
                          <ImageIcon className="h-10 w-10 mb-1 opacity-40" />
                          <span className="text-[11px]">No Thumbnail</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/95 text-black text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                        {award.award_type?.name || "General"}
                      </span>

                      {photosCount > 0 ? (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                          <Camera className="h-3 w-3" />
                          {photosCount} {photosCount === 1 ? "Photo" : "Photos"}
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white/80 text-[10px] font-medium flex items-center gap-1">
                          <Camera className="h-3 w-3" /> 0 Photos
                        </span>
                      )}

                      {award.short_description && (
                        <p className="absolute bottom-2.5 left-3 right-3 text-xs text-white/90 font-medium line-clamp-1 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                          <span>{award.short_description}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-text-primary dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                          {award.title}
                        </h4>
                        {award.description && (
                          <p className="text-xs text-text-muted dark:text-gray-400 mt-2 line-clamp-2">
                            {award.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-border dark:border-gray-700 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAwardStatus(award);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            award.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              award.is_active ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {award.is_active ? "Active" : "Inactive"}
                        </button>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            aria-label={`View details for ${award.title}`}
                            onClick={() => setExtendedAward(award)}
                            className="p-1.5 text-text-muted hover:text-text-primary dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <PermissionGuard permission="Award Update">
                            <button
                              type="button"
                              aria-label={`Edit ${award.title}`}
                              onClick={() => openEditAwardModal(award)}
                              className="p-1.5 text-text-muted hover:text-primary dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="Award Delete">
                            <button
                              type="button"
                              aria-label={`Delete ${award.title}`}
                              onClick={() => {
                                setDeleteTarget(award);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-text-muted hover:text-red-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: AWARD CATEGORIES (TYPES)                             */}
      {/* ----------------------------------------------------------- */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {/* Categories Search Bar */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search award categories..."
                value={categorySearch}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setCategoryCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Categories Table */}
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
                  {categoryLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                        Loading award categories...
                      </td>
                    </tr>
                  ) : categoryList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted dark:text-gray-400">
                        No award categories found. Create one with the Add Category button above.
                      </td>
                    </tr>
                  ) : (
                    categoryList.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary dark:text-white flex items-center gap-2">
                          <AwardIcon className="h-4 w-4 text-amber-500 shrink-0" />
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
                            onClick={() => handleToggleCategoryStatus(type)}
                            aria-label={`Toggle status for ${type.name}`}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionGuard permission="Award Type Update">
                              <button
                                type="button"
                                onClick={() => openEditCategoryModal(type)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-text-primary dark:text-white font-medium transition-colors cursor-pointer"
                                title={`Edit category ${type.name}`}
                              >
                                <Edit2 className="h-3.5 w-3.5 text-primary" />
                                <span>Edit</span>
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="Award Type Delete">
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryDeleteTarget(type);
                                  setCategoryDeleteConfirmOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-medium transition-colors cursor-pointer"
                                title={`Delete category ${type.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Category Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border dark:border-gray-700 text-xs text-text-muted dark:text-gray-400">
              <div className="flex items-center gap-2">
                <label htmlFor={categoryPerPageSelectId}>Rows per page:</label>
                <select
                  id={categoryPerPageSelectId}
                  value={categoryPerPage}
                  onChange={(e) => {
                    setCategoryPerPage(Number(e.target.value));
                    setCategoryCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-text-primary dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Showing {categoryList.length} of {categoryTotalCount} categories</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={categoryCurrentPage <= 1}
                  onClick={() => setCategoryCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3">
                  Page {categoryCurrentPage} of {categoryTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={categoryCurrentPage >= categoryTotalPages}
                  onClick={() => setCategoryCurrentPage((p) => Math.min(categoryTotalPages, p + 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXTENDED AWARD DETAIL & GALLERY MODAL ================= */}
      {extendedAward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-award-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setExtendedAward(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 shadow-2xl text-text-primary dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border dark:border-gray-700 px-6 py-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
                  {extendedAward.award_type?.name || "Recognition"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    extendedAward.is_active
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      extendedAward.is_active ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {extendedAward.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <PermissionGuard permission="Award Update">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const award = extendedAward;
                      setExtendedAward(null);
                      openEditAwardModal(award);
                    }}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                </PermissionGuard>
                <button
                  type="button"
                  aria-label="Close award modal"
                  onClick={() => setExtendedAward(null)}
                  className="rounded-full p-1.5 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h2 id="modal-award-title" className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
                  {extendedAward.title}
                </h2>
                {extendedAward.short_description && (
                  <p className="mt-1 text-sm font-medium text-primary flex items-center gap-1.5">
                    <Building className="h-4 w-4 shrink-0 text-primary" />
                    <span>Presented by: {extendedAward.short_description}</span>
                  </p>
                )}
              </div>

              {extendedAward.description && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-1">
                    Recognition Citation
                  </h3>
                  <p className="text-sm text-text-primary dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {extendedAward.description}
                  </p>
                </div>
              )}

              {extendedAward.thumbnail_image && (
                <div>
                  <h3 className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    Official Award Plaque / Certificate
                  </h3>
                  <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <img
                      src={resolveImageUrl(extendedAward.thumbnail_image)}
                      alt={extendedAward.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-primary" />
                    Moments from the Award Stage ({activeGalleryPhotos.length})
                  </h3>
                  <span className="text-[11px] text-text-muted dark:text-gray-400">
                    Captured during official conferral
                  </span>
                </div>

                {activeGalleryPhotos.length > 0 ? (
                  <div className="rounded-xl overflow-hidden border border-gray-800 bg-black/95">
                    <div className="relative aspect-[16/9] w-full overflow-hidden flex items-center justify-center">
                      {activeGalleryPhotos.map((photo: AwardGallery, i: number) => (
                        <img
                          key={photo.id || i}
                          src={resolveImageUrl(photo.image_path)}
                          alt={photo.caption || extendedAward.title}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                            i === galleryIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                          }`}
                        />
                      ))}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/90 text-black text-[10px] font-semibold uppercase tracking-wider mb-2">
                          <Camera className="h-3 w-3" />
                          {String(galleryIndex + 1).padStart(2, "0")} / {String(activeGalleryPhotos.length).padStart(2, "0")}
                        </span>
                        <p className="text-sm text-white font-medium line-clamp-2">
                          {currentGalleryPhoto?.caption || `Moments from the stage: ${extendedAward.title}`}
                        </p>
                      </div>

                      {activeGalleryPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous photo"
                            onClick={() => setGalleryIndex((i) => (i - 1 + activeGalleryPhotos.length) % activeGalleryPhotos.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next photo"
                            onClick={() => setGalleryIndex((i) => (i + 1) % activeGalleryPhotos.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {activeGalleryPhotos.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto bg-gray-900 border-t border-gray-800">
                        {activeGalleryPhotos.map((photo: AwardGallery, i: number) => (
                          <button
                            key={photo.id || i}
                            type="button"
                            onClick={() => setGalleryIndex(i)}
                            className={`relative shrink-0 w-20 aspect-[16/10] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                              i === galleryIndex ? "border-primary scale-105 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={resolveImageUrl(photo.image_path)} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-border dark:border-gray-700 text-center">
                    <Camera className="h-10 w-10 mx-auto text-text-muted/40 dark:text-gray-600 mb-2" />
                    <p className="text-sm font-medium text-text-primary dark:text-white">No ceremony photographs uploaded yet</p>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                      Edit this award to attach photos from the stage conferral ceremony.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT AWARD MODAL ================= */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAward ? "Edit Award" : "Add New Award"}
      >
        <form onSubmit={handleSubmitAward} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Award Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Agri-Business of the Year — Plantation"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              {(() => {
                const selectedCat = awardTypes.find(
                  (t) => String(t.id) === String(form.award_type_id)
                );
                return (
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-text-primary dark:text-white">
                      Award Category <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAddForm({ name: "", description: "" });
                        setQuickAddCategoryOpen(true);
                      }}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Quick Add
                    </button>
                  </div>
                );
              })()}
              <Select
                required
                value={form.award_type_id}
                onChange={(e) => setForm({ ...form, award_type_id: e.target.value })}
                className="w-full min-w-0 text-xs"
              >
                {awardTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
                Presented By / Organization
              </label>
              <Input
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="e.g. Asia Agri-Business Council"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Award Citation / Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Detailed recognition citation..."
            />
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Award Trophy / Plaque Thumbnail Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleThumbnailChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              {thumbnailPreview ? (
                <div className="relative w-32 h-20 rounded-md overflow-hidden">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity">
                    Change
                  </span>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-text-muted dark:text-gray-400" />
                  <p className="text-xs text-text-muted dark:text-gray-400">Click to upload thumbnail image</p>
                </>
              )}
            </div>
          </div>

          {/* Multiple Award Stage Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-primary dark:text-white">
                Gallery – Moments from the Award Stage
              </label>
              <span className="text-[11px] text-text-muted dark:text-gray-400">
                {existingGalleries.length + newGalleryPreviews.length} photos selected
              </span>
            </div>
            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleGalleryChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="space-y-3">
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-border dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Camera className="h-6 w-6 text-text-muted dark:text-gray-400" />
                <p className="text-xs text-text-muted dark:text-gray-400">
                  Click to add photos from the award conferral stage
                </p>
              </div>

              {(existingGalleries.length > 0 || newGalleryPreviews.length > 0) && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {existingGalleries.map((g) => (
                    <div key={`existing-${g.id}`} className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden border border-border dark:border-gray-700 group">
                      <img src={resolveImageUrl(g.image_path)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        title="Remove photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingGallery(g.id);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-destructive text-white rounded-full transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {newGalleryPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden border border-primary/50 group ring-1 ring-primary/40">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-primary text-[9px] font-semibold text-white">
                        New
                      </span>
                      <button
                        type="button"
                        title="Remove photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNewGalleryPreview(i);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-destructive text-white rounded-full transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active_checkbox" className="text-xs font-medium text-text-primary dark:text-white cursor-pointer">
              Active (Visible on public website)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingAward ? "Update Award" : "Create Award"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ================= FULL CREATE / EDIT CATEGORY MODAL ================= */}
      <Dialog
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? "Edit Award Category" : "Add Award Category"}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  name: e.target.value,
                  slug: editingCategory
                    ? categoryForm.slug
                    : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                })
              }
              placeholder="e.g. Sustainable Agronomy"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Slug
            </label>
            <Input
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              placeholder="e.g. sustainable-agronomy"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Description
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief summary of what this recognition category represents..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cat_is_active"
              checked={categoryForm.is_active}
              onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="cat_is_active" className="text-xs font-medium text-text-primary dark:text-white cursor-pointer">
              Active Category
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={categorySaving}>
              {categorySaving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ================= QUICK ADD CATEGORY MODAL (INLINE) ================= */}
      <Dialog
        open={quickAddCategoryOpen}
        onClose={() => setQuickAddCategoryOpen(false)}
        title="Quick Add Award Category"
      >
        <form onSubmit={handleSaveQuickCategory} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={quickAddForm.name}
              onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
              placeholder="e.g. Organic Certification"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-primary dark:text-white block mb-1">
              Description (Optional)
            </label>
            <textarea
              value={quickAddForm.description}
              onChange={(e) => setQuickAddForm({ ...quickAddForm, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setQuickAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={quickAddSaving}>
              {quickAddSaving ? "Creating..." : "Create & Select"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ================= DELETE AWARD CONFIRMATION ================= */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAward}
        title="Delete Award"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        loading={deleting}
        danger={true}
      />

      {/* ================= DELETE CATEGORY CONFIRMATION ================= */}
      <ConfirmDialog
        open={categoryDeleteConfirmOpen}
        onCancel={() => setCategoryDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteCategory}
        title="Delete Award Category"
        message={`Are you sure you want to delete category "${categoryDeleteTarget?.name}"?`}
        confirmLabel={categoryDeleting ? "Deleting..." : "Delete Category"}
        loading={categoryDeleting}
        danger={true}
      />
    </div>
  );
}
