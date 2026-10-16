"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  Building,
  Image as ImageIcon,
  UploadCloud,
  X,
  Power,
  RefreshCw,
} from "lucide-react";
import {
  investorsService,
  type InvestorMember,
} from "@/services";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export const DEFAULT_INVESTOR_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80";

export default function InvestorsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data & loading states
  const [investors, setInvestors] = useState<InvestorMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters & display mode
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Action menu dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<InvestorMember | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    image: "",
    is_active: true,
  });

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteInvestor, setTargetDeleteInvestor] = useState<InvestorMember | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Fetch investors
  const fetchInvestors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await investorsService.getInvestors();
      setInvestors(data);
    } catch (err) {
      console.error("Failed to load investors:", err);
      toast("Failed to load investors.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  // Filtered investors
  const filteredInvestors = investors.filter((inv) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.company && inv.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && inv.is_active) ||
      (statusFilter === "inactive" && !inv.is_active);

    return matchesSearch && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingInvestor(null);
    setForm({
      name: "",
      role: "",
      company: "",
      image: DEFAULT_INVESTOR_PLACEHOLDER_IMAGE,
      is_active: true,
    });
    setShowUrlInput(false);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (inv: InvestorMember) => {
    setEditingInvestor(inv);
    setForm({
      name: inv.name,
      role: inv.role,
      company: inv.company || "",
      image: inv.image || DEFAULT_INVESTOR_PLACEHOLDER_IMAGE,
      is_active: inv.is_active,
    });
    setShowUrlInput(false);
    setModalOpen(true);
  };

  // Handle Photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please upload a valid image file (PNG, JPG, WebP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("Image size should be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm((prev) => ({ ...prev, image: result }));
        toast("Photo selected successfully", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Modal Form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("Investor name is required", "error");
      return;
    }
    if (!form.role.trim()) {
      toast("Role or designation is required", "error");
      return;
    }

    setSaving(true);
    try {
      let updatedList: InvestorMember[];

      if (editingInvestor) {
        updatedList = investors.map((item) =>
          item.id === editingInvestor.id
            ? {
                ...item,
                name: form.name.trim(),
                role: form.role.trim(),
                company: form.company.trim() || undefined,
                image: form.image || DEFAULT_INVESTOR_PLACEHOLDER_IMAGE,
                is_active: form.is_active,
                updated_at: new Date().toISOString(),
              }
            : item
        );
        toast("Investor updated successfully", "success");
      } else {
        const newInvestor: InvestorMember = {
          id: `inv-${Date.now()}`,
          name: form.name.trim(),
          role: form.role.trim(),
          company: form.company.trim() || undefined,
          image: form.image || DEFAULT_INVESTOR_PLACEHOLDER_IMAGE,
          is_active: form.is_active,
          order: investors.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        updatedList = [...investors, newInvestor];
        toast("Investor added successfully", "success");
      }

      setInvestors(updatedList);
      await investorsService.saveInvestors(updatedList);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save investor:", err);
      toast("Failed to save investor", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (inv: InvestorMember) => {
    try {
      const nextStatus = !inv.is_active;
      const updatedList = investors.map((item) =>
        item.id === inv.id
          ? { ...item, is_active: nextStatus, updated_at: new Date().toISOString() }
          : item
      );
      setInvestors(updatedList);
      await investorsService.saveInvestors(updatedList);
      toast(
        `Investor marked as ${nextStatus ? "active" : "inactive"}`,
        "success"
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      toast("Failed to update status", "error");
    }
  };

  // Reordering: Move Up or Down
  const handleMove = async (invId: string, direction: "up" | "down") => {
    const updated = investorsService.moveInvestor(investors, invId, direction);
    setInvestors(updated);
    try {
      await investorsService.saveInvestors(updated);
    } catch (err) {
      console.error("Failed to save new order:", err);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!targetDeleteInvestor) return;
    setDeleting(true);
    try {
      const updatedList = investors.filter((item) => item.id !== targetDeleteInvestor.id);
      setInvestors(updatedList);
      await investorsService.saveInvestors(updatedList);
      toast("Investor deleted successfully", "success");
      setDeleteConfirmOpen(false);
      setTargetDeleteInvestor(null);
    } catch (err) {
      console.error("Failed to delete investor:", err);
      toast("Failed to delete investor", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Our Investors</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage capital partners and investor profiles ({filteredInvestors.length} of {investors.length} total)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Investor
        </button>
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search investors by name, role, or company..."
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

        {/* Status Filter */}
        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-surface p-1 dark:border-gray-700 dark:bg-gray-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-white"
                : "text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"
            }`}
            title="Table view"
            aria-label="Table view"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "cards"
                ? "bg-gray-100 text-primary dark:bg-gray-700 dark:text-white"
                : "text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"
            }`}
            title="Card view"
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredInvestors.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface text-text-muted dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <Building className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No investors found</p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 text-xs font-semibold text-primary hover:underline"
          >
            Add an investor now
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-2xs">
          <div className="w-full overflow-x-auto touch-scroll">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400">Investor</th>
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400">Role / Designation</th>
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400">Organization / Fund</th>
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400 text-center">Order</th>
                  <th className="px-5 py-3 font-medium text-text-muted dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {filteredInvestors.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Investor Photo & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-border dark:border-gray-600">
                          {inv.image ? (
                            <img
                              src={inv.image}
                              alt={inv.name}
                              className="h-full w-full object-cover object-top"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_INVESTOR_PLACEHOLDER_IMAGE;
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-text-muted">
                              <ImageIcon className="h-5 w-5 opacity-40" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-text-primary dark:text-white">
                          {inv.name}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 text-text-primary dark:text-gray-200">
                      {inv.role}
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5 text-text-muted dark:text-gray-400">
                      {inv.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-text-muted shrink-0" />
                          <span className="truncate max-w-[220px]">{inv.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(inv)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          inv.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-500/20"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            inv.is_active ? "bg-green-600 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        <span>{inv.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Order Controls */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(inv.id, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(inv.id, "down")}
                          disabled={idx === filteredInvestors.length - 1}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="relative inline-block action-menu-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === inv.id ? null : inv.id);
                          }}
                          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`Actions for ${inv.name}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === inv.id && (
                          <div className="absolute right-0 mt-1 w-44 rounded-lg border border-border bg-surface text-text-primary shadow-lg z-30 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEdit(inv);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left font-medium"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-text-muted dark:text-gray-400" />
                              Edit Investor
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleToggleStatus(inv);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <Power className="h-3.5 w-3.5 text-text-muted dark:text-gray-400" />
                              {inv.is_active ? "Set Inactive" : "Set Active"}
                            </button>

                            <div className="border-t border-border dark:border-gray-700 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setTargetDeleteInvestor(inv);
                                setDeleteConfirmOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400 transition-colors text-left font-medium"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Investor
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
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredInvestors.map((inv, idx) => (
            <div
              key={inv.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                {/* Photo & Status */}
                <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 border border-border dark:border-gray-700">
                  <img
                    src={inv.image || DEFAULT_INVESTOR_PLACEHOLDER_IMAGE}
                    alt={inv.name}
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_INVESTOR_PLACEHOLDER_IMAGE;
                    }}
                  />
                  <span
                    className={`absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-xs ${
                      inv.is_active
                        ? "bg-green-100/90 text-green-800 border border-green-600/30"
                        : "bg-gray-200/90 text-gray-700 border border-gray-400/40"
                    }`}
                  >
                    {inv.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-base text-text-primary dark:text-white leading-snug">
                  {inv.name}
                </h3>

                {/* Role */}
                <p className="text-xs font-semibold text-primary dark:text-primary-light mt-1">
                  {inv.role}
                </p>

                {/* Company */}
                {inv.company && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-gray-400 mt-2">
                    <Building className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    <span className="truncate">{inv.company}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Reorder & Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(inv.id, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20"
                    title="Move earlier"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(inv.id, "down")}
                    disabled={idx === filteredInvestors.length - 1}
                    className="p-1 rounded text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20"
                    title="Move later"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(inv)}
                    className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetDeleteInvestor(inv);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT INVESTOR MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in-0"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Card - 100% Solid Opaque Background */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="investor-modal-title"
            className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800 text-text-primary dark:text-white animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border dark:border-gray-700">
              <div>
                <h2 id="investor-modal-title" className="text-lg font-semibold text-text-primary dark:text-white">
                  {editingInvestor ? `Edit Investor` : `Add New Investor`}
                </h2>
                <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                  Configure photo, name, role, and organization for this capital partner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto py-5 space-y-4 touch-scroll">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Manjula Senaratne"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-1.5">
                  Role / Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strategic Ag-Tech Venture Partner"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Organization / Fund */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-1.5">
                  Organization / Syndicate / Fund
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serendib Agri-Ventures & Seed Capital"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text-primary dark:text-gray-200">
                    Portrait Photograph
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {showUrlInput ? "Upload File" : "Enter Image URL"}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="h-16 w-14 rounded-lg overflow-hidden border border-border bg-gray-100 dark:border-gray-700 dark:bg-gray-700 shrink-0">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-full w-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_INVESTOR_PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-text-muted">
                        <ImageIcon className="h-6 w-6 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Input mode */}
                  <div className="flex-1">
                    {showUrlInput ? (
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                          <UploadCloud className="h-4 w-4 text-primary" />
                          Choose Photo
                        </button>
                        {form.image && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm({ ...form, image: DEFAULT_INVESTOR_PLACEHOLDER_IMAGE })
                            }
                            className="text-xs text-text-muted hover:text-red-500 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-text-muted dark:text-gray-400 mt-1">
                      Recommended 4:5 portrait aspect ratio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-3 border-t border-border dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-gray-200">
                    Publishing Status
                  </p>
                  <p className="text-xs text-text-muted dark:text-gray-400">
                    Visible immediately in the Our Investors section on the Our Story page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-primary dark:text-gray-300">
                    {form.is_active ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {editingInvestor ? "Update Investor" : "Save Investor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Investor"
        message={`Are you sure you want to delete ${
          targetDeleteInvestor ? `"${targetDeleteInvestor.name}"` : "this investor"
        }? This entry will be permanently removed from the website.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        danger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteInvestor(null);
        }}
      />
    </div>
  );
}
