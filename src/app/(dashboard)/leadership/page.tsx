"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  GripVertical,
  CheckCircle2,
  EyeOff,
  UploadCloud,
  Globe,
  Layers,
  Crown,
  Briefcase,
  UserCheck,
  RefreshCw,
  User,
  Award,
  Quote,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import {
  leadershipService,
  type LeadershipMember,
  type LeadershipTier,
  type LeadershipCategory,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface SectionMeta {
  tier: LeadershipTier;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionMeta[] = [
  {
    tier: "executive",
    label: "Executive Team",
    description: "C-Suite directors directing group operations, domestic estate management, and digital agritech engineering.",
    icon: Briefcase,
  },
  {
    tier: "group_head",
    label: "Group Heads",
    description: "Functional directors commanding crop science, ecological standards, legal governance, and people welfare.",
    icon: Layers,
  },
  {
    tier: "founder",
    label: "Founder & Chairman",
    description: "Founding leadership, fiduciary stewardship, and long-term group governance.",
    icon: Crown,
  },
];

const CATEGORY_OPTIONS: LeadershipCategory[] = [
  "Board & Executive Leadership",
  "Group Functional Executives",
  "Legal, HR & People Development",
  "Sales & Business Leadership",
];

export const DEFAULT_LEADER_PLACEHOLDER_IMAGE = "/avatar-placeholder.png";

export default function LeadershipPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<"all" | LeadershipTier>("all");

  // Drag and drop state
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
  const [formTab, setFormTab] = useState<"basic" | "qualifications" | "editorial">("basic");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    role: string;
    tier: LeadershipTier;
    category: string;
    qualifications: string;
    credentials: string;
    image: string;
    bio: string;
    message: string;
    division: string;
    focus: string;
    linkedin: string;
    is_active: boolean;
  }>({
    name: "",
    role: "",
    tier: "executive",
    category: "Board & Executive Leadership",
    qualifications: "",
    credentials: "",
    image: "",
    bio: "",
    message: "",
    division: "",
    focus: "",
    linkedin: "",
    is_active: true,
  });

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<LeadershipMember | null>(null);

  // Load initial members from service
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await leadershipService.getMembers();
        setMembers(data);
      } catch (err) {
        console.error("Failed to load leadership data:", err);
        toast("Failed to load leadership directory. Using fallback data.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Save all changes to CMS & LocalStorage
  const handleSaveAllChanges = async (membersToSave = members) => {
    setSaving(true);
    try {
      await leadershipService.saveMembers(membersToSave);
      setHasUnsavedChanges(false);
      toast("Leadership directory updated successfully!", "success");
    } catch (err) {
      console.error("Save error:", err);
      toast("Failed to persist leadership changes to server.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Move member up/down within section
  const handleMove = (memberId: string, direction: "up" | "down") => {
    const reordered = leadershipService.moveMember(members, memberId, direction);
    setMembers(reordered);
    setHasUnsavedChanges(true);
    handleSaveAllChanges(reordered);
  };

  // Toggle active/hidden visibility
  const handleToggleStatus = (member: LeadershipMember) => {
    const updated = members.map((m) =>
      m.id === member.id ? { ...m, is_active: !m.is_active } : m
    );
    setMembers(updated);
    setHasUnsavedChanges(true);
    handleSaveAllChanges(updated);
    toast(
      `${member.name} is now ${!member.is_active ? "visible" : "hidden"} on the public website.`,
      "info"
    );
  };

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedMemberId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverMemberId !== targetId) {
      setDragOverMemberId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedMemberId;

    if (!sourceId || sourceId === targetId) {
      setDraggedMemberId(null);
      setDragOverMemberId(null);
      return;
    }

    const sourceMember = members.find((m) => m.id === sourceId);
    const targetMember = members.find((m) => m.id === targetId);

    if (sourceMember && targetMember && sourceMember.tier === targetMember.tier) {
      const reordered = leadershipService.reorderWithinTier(
        members,
        sourceMember.tier,
        sourceMember.id,
        targetMember.id
      );
      setMembers(reordered);
      setHasUnsavedChanges(true);
      handleSaveAllChanges(reordered);
    } else {
      toast("Members can only be reordered within the same category section.", "warning");
    }

    setDraggedMemberId(null);
    setDragOverMemberId(null);
  };

  const handleDragEnd = () => {
    setDraggedMemberId(null);
    setDragOverMemberId(null);
  };

  // Open modal for Create
  const handleOpenCreate = (tier?: LeadershipTier) => {
    setEditingMember(null);
    setFormTab("basic");
    setShowUrlInput(false);
    setForm({
      name: "",
      role: "",
      tier: tier || (selectedCategoryTab !== "all" ? selectedCategoryTab : "executive"),
      category: "Board & Executive Leadership",
      qualifications: "",
      credentials: "",
      image: DEFAULT_LEADER_PLACEHOLDER_IMAGE,
      bio: "",
      message: "",
      division: "",
      focus: "",
      linkedin: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (member: LeadershipMember) => {
    setEditingMember(member);
    setFormTab("basic");
    setShowUrlInput(false);
    setForm({
      name: member.name,
      role: member.role,
      tier: member.tier,
      category: member.category,
      qualifications: member.qualifications,
      credentials: member.credentials || "",
      image: member.image || DEFAULT_LEADER_PLACEHOLDER_IMAGE,
      bio: member.bio || "",
      message: member.message || "",
      division: member.division || "",
      focus: member.focus || "",
      linkedin: member.linkedin || "",
      is_active: member.is_active !== false,
    });
    setModalOpen(true);
  };

  // Photo file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file (PNG, JPG, WebP).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Form submit with smart tab navigation on validation error
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.role.trim()) {
      setFormTab("basic");
      toast("Full Name and Official Role are required in Tab 1.", "error");
      return;
    }

    // Image is mandatory: use uploaded image or ensure placeholder is set
    const finalImage = form.image.trim() || DEFAULT_LEADER_PLACEHOLDER_IMAGE;
    if (!finalImage) {
      setFormTab("basic");
      toast("Portrait photograph is required in Tab 1.", "error");
      return;
    }

    if (!form.qualifications.trim()) {
      setFormTab("qualifications");
      toast("Qualifications & Degrees are required in Tab 2.", "error");
      return;
    }

    let updated: LeadershipMember[];
    if (editingMember) {
      updated = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              ...form,
              image: finalImage,
              updated_at: new Date().toISOString(),
            }
          : m
      );
      toast(`Updated profile for ${form.name}.`, "success");
    } else {
      const newPerson: LeadershipMember = {
        id: `leader-${Date.now()}`,
        ...form,
        image: finalImage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      updated = [...members, newPerson];
      toast(`Added ${form.name} to the leadership directory.`, "success");
    }

    setMembers(updated);
    setHasUnsavedChanges(true);
    handleSaveAllChanges(updated);
    setModalOpen(false);
  };

  // Delete handlers
  const handleOpenDelete = (member: LeadershipMember) => {
    setDeletingMember(member);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    const updated = members.filter((m) => m.id !== deletingMember.id);
    setMembers(updated);
    setHasUnsavedChanges(true);
    handleSaveAllChanges(updated);
    toast(`Removed ${deletingMember.name} from the directory.`, "success");
    setDeleteConfirmOpen(false);
    setDeletingMember(null);
  };

  // Filter members by search
  const filteredMembers = members.filter((member) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.category.toLowerCase().includes(q) ||
      (member.division && member.division.toLowerCase().includes(q)) ||
      (member.qualifications && member.qualifications.toLowerCase().includes(q))
    );
  });

  // Visible sections based on active tab
  const activeSections = SECTIONS.filter(
    (s) => selectedCategoryTab === "all" || s.tier === selectedCategoryTab
  );

  const totalVisible = members.filter((m) => m.is_active !== false).length;

  return (
    <PermissionGuard permission="CMS Index">
      <div className="space-y-6">
        {/* Header matching CMS UI flow */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">
              Leadership Directory
            </h1>
            <p className="text-sm text-text-muted dark:text-gray-400">
              Manage executive profiles, statement quotes, visibility status, and presentation order within categories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5173/leadership"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-primary hover:bg-background-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
              View Live Page
            </a>

            <button
              onClick={() => handleOpenCreate()}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <Plus className="h-4 w-4" />
              Add Person
            </button>

            <button
              onClick={() => handleSaveAllChanges()}
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {hasUnsavedChanges ? "Save Changes" : "Saved"}
            </button>
          </div>
        </div>

        {/* Category Pill Tabs matching CMS Page Tabs bar */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-2 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setSelectedCategoryTab("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              selectedCategoryTab === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:bg-background-50 hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            All Categories ({members.length})
          </button>

          {SECTIONS.map((sec) => {
            const count = members.filter((m) => m.tier === sec.tier).length;
            const Icon = sec.icon;
            return (
              <button
                key={sec.tier}
                onClick={() => setSelectedCategoryTab(sec.tier)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  selectedCategoryTab === sec.tier
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:bg-background-50 hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {sec.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search members by name, role, division..."
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="text-xs text-text-muted">
            Showing {filteredMembers.length} of {members.length} leaders · {totalVisible} visible on site
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredMembers.length === 0 ? (
          /* Empty Search State */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center dark:border-gray-700">
            <Users className="h-10 w-10 text-text-muted" />
            <h3 className="mt-3 text-base font-semibold text-text-primary dark:text-white">
              {searchFilter ? "No leadership profiles match your search" : "No members in this category"}
            </h3>
            <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
              {searchFilter
                ? "Try adjusting your search terms or clear the filter."
                : 'Click "+ Add Person" to add the first profile to this category.'}
            </p>
            {searchFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchFilter("")}
                className="mt-4"
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        ) : (
          /* Section Containers matching CMS Flow */
          <div className="space-y-6">
            {activeSections.map((sectionMeta) => {
              const sectionItems = filteredMembers.filter(
                (m) => m.tier === sectionMeta.tier
              );

              return (
                <div
                  key={sectionMeta.tier}
                  className="overflow-hidden rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800 shadow-xs"
                >
                  {/* Section Header Banner */}
                  <div className="border-b border-border bg-background-50/50 px-6 py-3.5 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                          Section
                        </span>
                        <h3 className="text-sm font-bold text-text-primary dark:text-white">
                          {sectionMeta.label}
                        </h3>
                        <span className="text-xs text-text-muted">
                          ({sectionItems.length} people)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted hidden md:inline">
                          Drag handle <GripVertical className="inline h-3 w-3" /> or use arrows to reorder
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenCreate(sectionMeta.tier)}
                          className="flex items-center gap-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-medium transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Add to {sectionMeta.label}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {sectionMeta.description}
                    </p>
                  </div>

                  {/* Section Items (CMS Repeater Row Style) */}
                  <div className="p-4 sm:p-6 space-y-2.5">
                    {sectionItems.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border py-8 text-center text-text-muted text-xs dark:border-gray-700">
                        No members currently in this category. Click &quot;Add to {sectionMeta.label}&quot; to create one.
                      </div>
                    ) : (
                      sectionItems.map((item, idx) => {
                        const isHidden = item.is_active === false;
                        const isDragTarget = dragOverMemberId === item.id;
                        const isBeingDragged = draggedMemberId === item.id;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDrop={(e) => handleDrop(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 text-sm shadow-xs transition-all duration-150 ${
                              isDragTarget
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-surface hover:border-primary/40 dark:border-gray-700 dark:bg-gray-800"
                            } ${
                              isBeingDragged ? "opacity-40" : ""
                            } ${
                              isHidden ? "bg-muted/30 opacity-75 border-dashed" : ""
                            }`}
                          >
                            {/* Left: Drag Handle, Number, Portrait, Info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Grab Handle */}
                              <span
                                className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1 rounded hover:bg-background-50 shrink-0"
                                title="Drag to reorder within this category"
                              >
                                <GripVertical className="h-4 w-4" />
                              </span>

                              {/* Order Badge (matching CMS Repeater index) */}
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                {idx + 1}
                              </span>

                              {/* Photo Thumbnail */}
                              <div className="relative h-12 w-10 shrink-0 rounded overflow-hidden border border-border bg-background-100">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  draggable={false}
                                  className="h-full w-full object-cover object-top pointer-events-none"
                                />
                                {isHidden && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <EyeOff className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-text-primary dark:text-white truncate">
                                    {item.name}
                                  </p>
                                  {item.credentials && (
                                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-text-muted">
                                      {item.credentials}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-primary font-medium truncate">
                                  {item.role}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] text-text-muted">
                                  <span>{item.qualifications}</span>
                                </div>

                                {item.message && (
                                  <p className="text-[11px] italic text-text-muted mt-1 line-clamp-1">
                                    &ldquo;{item.message}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Visibility Pill & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                              {/* Visibility Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item)}
                                title={isHidden ? "Click to show on public site" : "Click to hide from public site"}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  isHidden
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                    : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isHidden ? "bg-gray-400" : "bg-emerald-500"
                                  }`}
                                />
                                {isHidden ? "Hidden" : "Active"}
                              </button>

                              {/* Up / Down Reorder Arrows */}
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  title="Move up"
                                  disabled={idx === 0}
                                  onClick={() => handleMove(item.id, "up")}
                                  className="p-1 text-text-muted hover:text-text-primary disabled:opacity-25"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Move down"
                                  disabled={idx === sectionItems.length - 1}
                                  onClick={() => handleMove(item.id, "down")}
                                  className="p-1 text-text-muted hover:text-text-primary disabled:opacity-25"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Edit & Delete Actions */}
                              <button
                                type="button"
                                title="Edit leader profile"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Remove person"
                                onClick={() => handleOpenDelete(item)}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add / Edit Leader Profile (Spacious Tabbed Form) */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingMember ? "Edit Leadership Profile" : "Add New Leader"}
          className="max-w-2xl sm:max-w-3xl"
        >
          <div className="flex flex-col">
            {/* Modal Subtitle */}
            <p className="text-xs text-text-muted -mt-2 mb-4">
              Configure personal identity, academic credentials, portrait photography, and executive statements.
            </p>

            {/* Interactive Tab Navigation */}
            <div
              role="tablist"
              aria-label="Leadership form sections"
              className="flex border-b border-border dark:border-gray-700 mb-5 gap-1"
            >
              <button
                type="button"
                role="tab"
                id="tab-btn-basic"
                aria-selected={formTab === "basic"}
                aria-controls="tab-panel-basic"
                onClick={() => setFormTab("basic")}
                className={`flex items-center gap-2 pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                  formTab === "basic"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>1. Identity & Role</span>
                {form.name && form.role && form.image ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Section completed" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Required fields pending" />
                )}
              </button>

              <button
                type="button"
                role="tab"
                id="tab-btn-qualifications"
                aria-selected={formTab === "qualifications"}
                aria-controls="tab-panel-qualifications"
                onClick={() => setFormTab("qualifications")}
                className={`flex items-center gap-2 pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                  formTab === "qualifications"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>2. Qualifications</span>
                {form.qualifications ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Section completed" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Required field pending" />
                )}
              </button>

              <button
                type="button"
                role="tab"
                id="tab-btn-editorial"
                aria-selected={formTab === "editorial"}
                aria-controls="tab-panel-editorial"
                onClick={() => setFormTab("editorial")}
                className={`flex items-center gap-2 pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                  formTab === "editorial"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Quote className="h-3.5 w-3.5" />
                <span>
                  {form.tier === "founder" ? "3. Statement & Message" : "3. Statement & Biography"}
                </span>
                {(form.message || form.bio) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Content provided" />
                )}
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Form Body - comfortably scrollable if screen is compact */}
              <div className="max-h-[58vh] overflow-y-auto pr-1">
                {/* TAB 1: IDENTITY & ROLE */}
                {formTab === "basic" && (
                  <div
                    role="tabpanel"
                    id="tab-panel-basic"
                    aria-labelledby="tab-btn-basic"
                    className="grid grid-cols-1 md:grid-cols-12 gap-5"
                  >
                    {/* Left Column: Portrait & Visibility (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Portrait Card */}
                      <div className="rounded-xl border border-border p-3.5 bg-background-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-text-primary dark:text-white">
                            Portrait Photograph <span className="text-red-500" aria-hidden="true">*</span>
                          </label>
                          {form.image === DEFAULT_LEADER_PLACEHOLDER_IMAGE ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Placeholder Image
                            </span>
                          ) : form.image ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              Custom Photo
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-border bg-background shadow-xs mb-3 group">
                            {form.image ? (
                              <img
                                src={form.image}
                                alt="Preview"
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-2">
                                <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
                                <span className="text-[10px]">No photo</span>
                              </div>
                            )}
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageFileChange}
                            accept="image/*"
                            className="hidden"
                          />

                          <div className="w-full space-y-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-border bg-surface text-xs font-medium text-text-primary hover:bg-background-50 transition-colors shadow-2xs"
                            >
                              <UploadCloud className="h-3.5 w-3.5 text-primary" />
                              Upload From Computer
                            </button>

                            <div className="flex items-center justify-between gap-2 px-1">
                              <button
                                type="button"
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className="text-[11px] text-text-muted hover:text-primary transition-colors inline-block"
                              >
                                {showUrlInput ? "Hide image URL" : "Or paste image link"}
                              </button>

                              {form.image !== DEFAULT_LEADER_PLACEHOLDER_IMAGE && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm({ ...form, image: DEFAULT_LEADER_PLACEHOLDER_IMAGE })
                                  }
                                  className="text-[11px] text-primary hover:underline transition-colors inline-block"
                                >
                                  Use placeholder
                                </button>
                              )}
                            </div>

                            {showUrlInput && (
                              <Input
                                value={form.image}
                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="text-xs h-8 mt-1"
                              />
                            )}
                          </div>
                          <p className="text-[10px] text-text-muted mt-2">
                            Recommended: Vertical portrait (4:5 ratio)
                          </p>
                        </div>
                      </div>

                      {/* Active Visibility Switch */}
                      <div className="rounded-xl border border-border p-3.5 bg-background-50/50 dark:bg-gray-800/50 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-text-primary dark:text-white">
                            Active Visibility
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {form.is_active ? "Visible on public website" : "Hidden from public website"}
                          </p>
                        </div>
                        <Switch
                          checked={form.is_active}
                          onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                          aria-label="Toggle active visibility on website"
                        />
                      </div>
                    </div>

                    {/* Right Column: Name, Role, Category, Directorate (7 cols) */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div>
                        <label
                          htmlFor="leader-name"
                          className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5"
                        >
                          Full Name <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <Input
                          id="leader-name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Dr. Sanjeewa Bandara"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="leader-role"
                          className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5"
                        >
                          Official Role / Title <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <Input
                          id="leader-role"
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          placeholder="e.g. Group Chief Executive Officer & Managing Director"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="min-w-0">
                          <Select
                            id="leader-tier"
                            label="Category Section"
                            required
                            value={form.tier}
                            onChange={(e) =>
                              setForm({ ...form, tier: e.target.value as LeadershipTier })
                            }
                            selectSize="sm"
                            className="w-full min-w-0"
                          >
                            <option value="executive">Executive Team</option>
                            <option value="group_head">Group Heads</option>
                            <option value="founder">Founder & Chairman</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: QUALIFICATIONS & DOMAIN */}
                {formTab === "qualifications" && (
                  <div
                    role="tabpanel"
                    id="tab-panel-qualifications"
                    aria-labelledby="tab-btn-qualifications"
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="leader-qualifications"
                          className="block text-xs font-semibold text-text-primary dark:text-white mb-1"
                        >
                          Qualifications & Degrees <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <p className="text-[11px] text-text-muted mb-1.5">
                          Degrees, fellowships, and diplomas recognized on the leadership card
                        </p>
                        <Input
                          id="leader-qualifications"
                          value={form.qualifications}
                          onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                          placeholder="e.g. B.Sc. Agric (Hons) · M.Sc. · Ph.D. (Plantation Economics)"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="leader-credentials"
                          className="block text-xs font-semibold text-text-primary dark:text-white mb-1"
                        >
                          Credentials (Post-Nominals)
                        </label>
                        <p className="text-[11px] text-text-muted mb-1.5">
                          Short post-nominal abbreviations (e.g. Ph.D., M.Sc., PMP)
                        </p>
                        <Input
                          id="leader-credentials"
                          value={form.credentials}
                          onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                          placeholder="e.g. Ph.D., M.Sc., B.Sc. Agric"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: STATEMENT & BIOGRAPHY */}
                {formTab === "editorial" && (
                  <div
                    role="tabpanel"
                    id="tab-panel-editorial"
                    aria-labelledby="tab-btn-editorial"
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="leader-message"
                          className="block text-xs font-semibold text-text-primary dark:text-white"
                        >
                          {form.tier === "founder"
                            ? "Founder & Chairman Headline Quote / Core Statement"
                            : "Executive Statement / Quote (Shown on Card Hover)"}
                        </label>
                        <span className="text-[11px] text-text-muted">
                          {form.message ? `${form.message.length} characters` : "Optional"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mb-1.5">
                        {form.tier === "founder"
                          ? "Primary headline quote displayed prominently beneath 'A Message from Our Chairman' on the Leadership page."
                          : "Inspirational quote or vision statement revealed when visitors hover over this card on the public website."}
                      </p>
                      <textarea
                        id="leader-message"
                        rows={form.tier === "founder" ? 3 : 2}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={
                          form.tier === "founder"
                            ? "e.g. When we founded Ceylon Development Plantation, our conviction was rooted in a foundational truth..."
                            : "e.g. Translating board governance into operational rigor on every hectare..."
                        }
                        className="w-full text-xs rounded-lg border border-border bg-surface p-2.5 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      />

                      {/* Live Statement Card Preview */}
                      {form.message && (
                        <div className="mt-2.5 p-3 rounded-lg bg-emerald-950 text-white border border-emerald-800/80 shadow-xs">
                          <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-semibold uppercase tracking-wider mb-1">
                            <Quote className="h-3 w-3" />
                            <span>
                              {form.tier === "founder"
                                ? "Live Headline Quote Preview"
                                : "Live Card Hover Statement Preview"}
                            </span>
                          </div>
                          <p className="text-xs italic text-emerald-100 line-clamp-3 leading-relaxed">
                            &ldquo;{form.message}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="leader-bio"
                          className="block text-xs font-semibold text-text-primary dark:text-white"
                        >
                          {form.tier === "founder"
                            ? "Chairman's Official Message / Letter Paragraphs"
                            : "Professional Biography"}
                        </label>
                        <span className="text-[11px] text-text-muted">
                          {form.bio ? `${form.bio.length} characters` : "Optional"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mb-1.5">
                        {form.tier === "founder"
                          ? "Enter the body paragraphs for the Chairman's official statement on the Leadership page. Separate distinct paragraphs with a blank line (double enter). If left empty, only the headline quote above will be shown."
                          : "Comprehensive career track record, sector experience, and governance mandate."}
                      </p>
                      <textarea
                        id="leader-bio"
                        rows={form.tier === "founder" ? 6 : 3}
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder={
                          form.tier === "founder"
                            ? "Enter paragraph 1...\n\nEnter paragraph 2...\n\nEnter paragraph 3..."
                            : "Comprehensive overview of executive background and agricultural stewardship..."
                        }
                        className="w-full text-xs rounded-lg border border-border bg-surface p-2.5 text-text-primary focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      />

                      {form.tier === "founder" && form.bio && (
                        <div className="mt-2.5 p-3 rounded-lg bg-background-50 dark:bg-gray-800/80 border border-border text-text-primary text-xs space-y-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block">
                            Live Paragraphs Preview ({form.bio.split(/\n\s*\n/).filter(Boolean).length} paragraph{form.bio.split(/\n\s*\n/).filter(Boolean).length === 1 ? "" : "s"})
                          </span>
                          {form.bio.split(/\n\s*\n/).filter(Boolean).map((p, idx) => (
                            <p key={idx} className="text-text-muted text-[11px] leading-relaxed">
                              {p}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border dark:border-gray-700 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  {formTab !== "basic" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormTab(formTab === "editorial" ? "qualifications" : "basic")
                      }
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Back
                    </Button>
                  )}

                  {formTab !== "editorial" ? (
                    <Button
                      type="button"
                      onClick={() =>
                        setFormTab(formTab === "basic" ? "qualifications" : "editorial")
                      }
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  ) : null}

                  <Button type="submit">
                    {editingMember ? "Save Changes" : "Add Leader"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onCancel={() => setDeleteConfirmOpen(false)}
          title="Remove Leader Profile"
          message={`Are you sure you want to delete "${deletingMember?.name}" from the Leadership directory?`}
          confirmLabel="Delete Person"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PermissionGuard>
  );
}
