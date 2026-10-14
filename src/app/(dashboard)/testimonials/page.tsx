"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import {
  MessageSquareQuote,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  X,
  UploadCloud,
  AlertCircle,
  MapPin,
  Briefcase,
  Power,
} from "lucide-react";
import {
  testimonialService,
  type Testimonial,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";


export default function TestimonialsPage() {
  const { toast } = useToast();
  const perPageSelectId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(15);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    designation: "",
    body: "",
    rating: 5,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Testimonial | null>(null);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status Toggle State
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".action-menu-container")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await testimonialService.getAll({
        page: currentPage,
        per_page: perPage,
        search: search.trim() || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        is_active: statusFilter !== "" ? statusFilter === "true" : undefined,
      });

      if (res && res.data && res.data.length > 0) {
        setTestimonials(res.data);
        setTotalPages(res.meta?.last_page || 1);
        setTotalCount(res.meta?.total || res.data.length);
      } else {
        setTestimonials([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch {
      setTestimonials([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, ratingFilter, statusFilter]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setForm({
      name: "",
      city: "",
      designation: "",
      body: "",
      rating: 5,
      is_active: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingTestimonial(item);
    setForm({
      name: item.name,
      city: item.city,
      designation: item.designation || "",
      body: item.body,
      rating: item.rating || 5,
      is_active: item.is_active,
    });
    setImageFile(null);
    setImagePreview(item.thumbnail_image || null);
    setModalOpen(true);
    setActiveMenuId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast("Image exceeds the 10MB file limit.", "error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Please enter the client's name.", "error");
      return;
    }
    if (!form.city.trim()) {
      toast("Please enter the client's city or location.", "error");
      return;
    }
    if (!form.body.trim()) {
      toast("Please enter the testimonial review text.", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("city", form.city.trim());
      if (form.designation.trim()) {
        formData.append("designation", form.designation.trim());
      }
      formData.append("body", form.body.trim());
      formData.append("rating", String(form.rating));
      formData.append("is_active", form.is_active ? "1" : "0");

      if (imageFile) {
        formData.append("thumbnail_image", imageFile);
      }

      if (editingTestimonial) {
        await testimonialService.update(editingTestimonial.id, formData);
        toast("Testimonial updated successfully.", "success");
      } else {
        await testimonialService.create(formData);
        toast("Testimonial created successfully.", "success");
      }

      setModalOpen(false);
      loadTestimonials();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to save testimonial. Please check your input.";
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: Testimonial) => {
    setTogglingId(item.id);
    try {
      await testimonialService.toggleStatus(item.id);
      toast(
        `Testimonial marked as ${!item.is_active ? "Active" : "Inactive"}.`,
        "success"
      );
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, is_active: !t.is_active } : t))
      );
    } catch {
      toast("Failed to update status. Please try again.", "error");
    } finally {
      setTogglingId(null);
      setActiveMenuId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await testimonialService.delete(deleteTarget.id);
      toast("Testimonial deleted successfully.", "success");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      loadTestimonials();
    } catch {
      toast("Failed to delete testimonial.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect && onSelect(star)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform p-0.5"
                : "cursor-default"
            }`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted/30 text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <PermissionGuard permission="Testimonial Index">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquareQuote className="h-7 w-7 text-primary" />
              Client Testimonials & Reviews
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage client feedback, investor satisfaction quotes, and star ratings published across the website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table view"
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Cards view"
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <PermissionGuard permission="Testimonial Create">
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Testimonial
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, city, designation or review text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              selectSize="sm"
              wrapperClassName="w-44"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars (Excellent)</option>
              <option value="4">4 Stars (Very Good)</option>
              <option value="3">3 Stars (Good)</option>
              <option value="2">2 Stars (Fair)</option>
              <option value="1">1 Star (Poor)</option>
            </Select>

            <Select
              selectSize="sm"
              wrapperClassName="w-36"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Select>

            {(search || ratingFilter || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setRatingFilter("");
                  setStatusFilter("");
                  setCurrentPage(1);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Testimonials Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
            <p className="text-sm">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border text-center p-6">
            <MessageSquareQuote className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No Testimonials Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {search || ratingFilter || statusFilter
                ? "No client testimonials match your current search criteria."
                : "No testimonials recorded in the database yet. Click below to add the first client review."}
            </p>
            <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Add Testimonial
            </Button>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Client</th>
                    <th className="px-4 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Testimonial Quote</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {testimonials.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                            {item.thumbnail_image ? (
                              <img
                                src={item.thumbnail_image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              item.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground leading-tight truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <MapPin className="h-3 w-3 text-muted-foreground/60" />
                              <span>{item.city}</span>
                              {item.designation && (
                                <>
                                  <span className="text-muted-foreground/40">•</span>
                                  <span>{item.designation}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {renderStars(item.rating)}
                          <span className="text-xs font-semibold text-foreground/80">
                            {item.rating}.0
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          "{item.body}"
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={togglingId === item.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            item.is_active
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                            }`}
                          />
                          <span>{item.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="relative inline-block action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item.id ? null : item.id);
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === item.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-lg border bg-popover text-popover-foreground shadow-lg z-30 py-1 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailItem(item);
                                  setDetailModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                View Details
                              </button>

                              <PermissionGuard permission="Testimonial Update">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  Edit Testimonial
                                </button>
                              </PermissionGuard>

                              <PermissionGuard permission="Testimonial Toggle Active">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                                >
                                  <Power className="h-3.5 w-3.5 text-muted-foreground" />
                                  {item.is_active ? "Set Inactive" : "Set Active"}
                                </button>
                              </PermissionGuard>

                              <PermissionGuard permission="Testimonial Delete">
                                <div className="border-t my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteTarget(item);
                                    setDeleteConfirmOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive transition-colors text-left font-medium"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </PermissionGuard>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border bg-card p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                        {item.thumbnail_image ? (
                          <img
                            src={item.thumbnail_image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{item.city}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.is_active
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mb-3">{renderStars(item.rating)}</div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-4 bg-muted/20 p-3 rounded-lg border border-border/50">
                    "{item.body}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-muted-foreground/60" />
                    <span>{item.designation || "Participant"}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 px-2 text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget(item);
                        setDeleteConfirmOpen(true);
                      }}
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card">
            <p className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{currentPage}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong> ({totalCount} total testimonials)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="gap-1 text-xs"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Create / Edit Dialog */}
        <Dialog
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            handleRemoveImage();
          }}
          title={editingTestimonial ? "Edit Client Testimonial" : "Add Client Testimonial"}
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Client Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Dr. Rohitha Senanayake"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  City / Location <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Colombo, Kandy, Gampaha"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Designation / Role <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Private Investor, Agri Entrepreneur"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                />
              </div>

              <div className="min-w-0">
                <Select
                  label="Rating Awarded"
                  required
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full min-w-0"
                >
                  <option value={5}>5 Stars (★★★★★) - Excellent</option>
                  <option value={4}>4 Stars (★★★★☆) - Very Good</option>
                  <option value={3}>3 Stars (★★★☆☆) - Good</option>
                  <option value={2}>2 Stars (★★☆☆☆) - Fair</option>
                  <option value={1}>1 Star (★☆☆☆☆) - Poor</option>
                </Select>
                <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/20 w-fit">
                  {renderStars(form.rating, true, (r) => setForm({ ...form, rating: r }))}
                  <span className="text-xs font-semibold text-primary ml-1">
                    {form.rating} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar / Thumbnail Upload */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Client Avatar Photo <span className="text-muted-foreground font-normal">(Optional, max 10MB)</span>
              </label>

              {imagePreview ? (
                <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-14 w-14 rounded-full object-cover border"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-medium text-foreground truncate">
                      {imageFile ? imageFile.name : "Current Photo"}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : "Stored on server"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed border-border hover:border-primary/60 cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all text-center"
                >
                  <UploadCloud className="h-7 w-7 text-muted-foreground mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">
                    Click to upload client portrait
                  </p>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG, or WEBP up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Testimonial Review Body */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Testimonial Review / Quote <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Enter client's testimonial statement..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-xs font-medium text-foreground cursor-pointer">
                Publish immediately (Active on public website)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingTestimonial ? "Save Changes" : "Create Testimonial"}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* View Details Modal */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Testimonial Details"
        >
          {detailItem && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                  {detailItem.thumbnail_image ? (
                    <img
                      src={detailItem.thumbnail_image}
                      alt={detailItem.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    detailItem.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">{detailItem.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span>{detailItem.city}</span>
                    {detailItem.designation && (
                      <>
                        <span>•</span>
                        <span>{detailItem.designation}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  {renderStars(detailItem.rating)}
                  <span className="text-xs font-bold text-foreground">
                    {detailItem.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Testimonial Quote</p>
                <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border italic">
                  "{detailItem.body}"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t text-muted-foreground">
                <span>
                  Status:{" "}
                  <strong className={detailItem.is_active ? "text-emerald-600" : "text-muted-foreground"}>
                    {detailItem.is_active ? "Active" : "Inactive"}
                  </strong>
                </span>
                <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          title="Delete Testimonial"
          message={`Are you sure you want to permanently delete the testimonial from "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel={deleting ? "Deleting..." : "Delete Testimonial"}
          danger={true}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      </div>
    </PermissionGuard>
  );
}
