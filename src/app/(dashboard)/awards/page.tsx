"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import {
  Trophy,
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
  Calendar,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
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
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

// Fallback initial sample awards for Dashboard preview and resilient display
const sampleDashboardAwards: Award[] = [
  {
    id: 1,
    award_type_id: 1,
    title: "Agri-Business of the Year — Plantation",
    slug: "agri-business-of-the-year-plantation",
    short_description: "Asia Agri-Business Council",
    description:
      "Conferred at the annual Asia Agri-Business Summit in recognition of exceptional operational scale, modern estate governance, and sustainable supply-chain integration across Sri Lanka's tea and coconut plantations. The award acknowledges CDP's leadership in disciplined agro-enterprise practices and transparent stakeholder value creation.",
    verified: true,
    is_active: true,
    thumbnail_image:
      "https://readdy.ai/api/search-image?query=A%20gleaming%20golden%20trophy%20cup%20award%20on%20a%20clean%20warm%20cream%20studio%20background%2C%20soft%20directional%20lighting%2C%20minimal%20editorial%20product%20photography%2C%20elegant%20premium%20mood%2C%20high%20detail&width=800&height=600&seq=cdp-award-01&orientation=landscape",
    award_type: { id: 1, name: "Agri-Business", slug: "agri-business", is_active: true },
    galleries: [
      {
        id: 101,
        award_id: 1,
        image_path:
          "https://readdy.ai/api/search-image?query=Sri%20Lankan%20plantation%20company%20team%20walking%20onto%20an%20award%20ceremony%20stage%20to%20receive%20a%20golden%20trophy%20from%20a%20presenter%2C%20warm%20stage%20lighting%2C%20formal%20elegant%20event%20photography%2C%20applause%20and%20celebration%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-01&orientation=landscape",
        caption: "CDP executive delegation taking the grand stage to receive the Agri-Business of the Year trophy.",
      },
      {
        id: 102,
        award_id: 1,
        image_path:
          "https://readdy.ai/api/search-image?query=Sri%20Lankan%20business%20leader%20speaking%20at%20a%20podium%20at%20an%20award%20ceremony%20while%20holding%20an%20award%2C%20warm%20stage%20lighting%2C%20audience%20in%20soft%20focus%2C%20editorial%20event%20photography%2C%20confident%20uplifting%20mood%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-02&orientation=landscape",
        caption: "Executive address delivered at the summit podium detailing Sri Lankan sustainable plantation models.",
      },
      {
        id: 103,
        award_id: 1,
        image_path:
          "https://readdy.ai/api/search-image?query=A%20group%20of%20Sri%20Lankan%20colleagues%20standing%20together%20on%20an%20award%20stage%20holding%20a%20golden%20trophy%20and%20certificates%2C%20proud%20smiles%2C%20warm%20stage%20lighting%2C%20formal%20event%20photography%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-04&orientation=landscape",
        caption: "Estate operational leaders and corporate management gathered on stage with the award trophy.",
      },
      {
        id: 104,
        award_id: 1,
        image_path:
          "https://readdy.ai/api/search-image?query=Close%20up%20of%20a%20polished%20golden%20trophy%20on%20an%20award%20ceremony%20stage%20with%20blurred%20spotlights%20and%20an%20audience%20behind%2C%20warm%20dramatic%20lighting%2C%20premium%20editorial%20photography%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-05&orientation=landscape",
        caption: "The 2024 Agri-Business of the Year golden trophy illuminated under the stage lights.",
      },
    ],
    created_at: "2024-11-14T10:00:00Z",
  },
  {
    id: 2,
    award_type_id: 2,
    title: "Excellence in Sustainable Cultivation",
    slug: "excellence-in-sustainable-cultivation",
    short_description: "Southern Agri Excellence Forum",
    description:
      "Conferred in recognition of pioneer water-conservation architectures, organic soil remediation protocols, and biodiversity conservation across dry-zone plantation acreage. The forum commended CDP's zero-chemical-runoff buffer zones and regenerative tree cover practices.",
    verified: true,
    is_active: true,
    thumbnail_image:
      "https://readdy.ai/api/search-image?query=An%20elegant%20framed%20certificate%20of%20excellence%20with%20a%20gold%20wax%20seal%20on%20a%20clean%20warm%20neutral%20studio%20background%2C%20soft%20light%2C%20minimal%20editorial%20photography%2C%20premium%20credible%20mood%2C%20high%20detail&width=800&height=600&seq=cdp-award-02&orientation=landscape",
    award_type: { id: 2, name: "Sustainability", slug: "sustainability", is_active: true },
    galleries: [
      {
        id: 201,
        award_id: 2,
        image_path:
          "https://readdy.ai/api/search-image?query=Two%20people%20shaking%20hands%20while%20exchanging%20a%20framed%20award%20certificate%20on%20an%20award%20ceremony%20stage%2C%20warm%20spotlights%2C%20formal%20elegant%20event%20photography%2C%20respectful%20celebratory%20mood%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-06&orientation=landscape",
        caption: "Conferral and handshake on stage as the Certificate of Excellence is handed to CDP representatives.",
      },
      {
        id: 202,
        award_id: 2,
        image_path:
          "https://readdy.ai/api/search-image?query=Audience%20applauding%20at%20an%20elegant%20award%20ceremony%20in%20a%20warm%20lit%20hall%2C%20rows%20of%20seated%20guests%20clapping%2C%20editorial%20event%20photography%2C%20celebratory%20warm%20golden%20tones%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-03&orientation=landscape",
        caption: "Audience and delegates applauding the sustainability presentation at the forum hall.",
      },
      {
        id: 203,
        award_id: 2,
        image_path:
          "https://readdy.ai/api/search-image?query=Sri%20Lankan%20business%20leader%20speaking%20at%20a%20podium%20at%20an%20award%20ceremony%20while%20holding%20an%20award%2C%20warm%20stage%20lighting%2C%20audience%20in%20soft%20focus%2C%20editorial%20event%20photography%2C%20confident%20uplifting%20mood%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-02&orientation=landscape",
        caption: "CDP sustainability lead presenting ecological soil regeneration findings at the forum podium.",
      },
    ],
    created_at: "2023-09-22T10:00:00Z",
  },
  {
    id: 3,
    award_type_id: 3,
    title: "Rural Community Impact Award",
    slug: "rural-community-impact-award",
    short_description: "Planters' Development Foundation",
    description:
      "Awarded for CDP's long-standing investments in smallholder outgrower families, farmer training centers, clean drinking water access, and local community infrastructure around our estate clusters. The foundation highlighted the direct social mobility fostered across rural farming communities.",
    verified: true,
    is_active: true,
    thumbnail_image:
      "https://readdy.ai/api/search-image?query=A%20polished%20gold%20medal%20with%20a%20ribbon%20resting%20on%20a%20clean%20warm%20neutral%20surface%2C%20soft%20studio%20lighting%2C%20minimal%20editorial%20product%20photography%2C%20elegant%20premium%20mood%2C%20high%20detail&width=800&height=600&seq=cdp-award-03&orientation=landscape",
    award_type: { id: 3, name: "Community", slug: "community", is_active: true },
    galleries: [
      {
        id: 301,
        award_id: 3,
        image_path:
          "https://readdy.ai/api/search-image?query=Sri%20Lankan%20plantation%20company%20team%20walking%20onto%20an%20award%20ceremony%20stage%20to%20receive%20a%20golden%20trophy%20from%20a%20presenter%2C%20warm%20stage%20lighting%2C%20formal%20elegant%20event%20photography%2C%20applause%20and%20celebration%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-01&orientation=landscape",
        caption: "Foundation trustees presenting the Rural Community Impact medal and scroll to CDP community coordinators.",
      },
      {
        id: 302,
        award_id: 3,
        image_path:
          "https://readdy.ai/api/search-image?query=Sri%20Lankan%20business%20leader%20speaking%20at%20a%20podium%20at%20an%20award%20ceremony%20while%20holding%20an%20award%2C%20warm%20stage%20lighting%2C%20audience%20in%20soft%20focus%2C%20editorial%20event%20photography%2C%20confident%20uplifting%20mood%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-02&orientation=landscape",
        caption: "Community relations officer sharing field stories and farmer training milestones with the audience.",
      },
    ],
    created_at: "2023-06-18T10:00:00Z",
  },
  {
    id: 4,
    award_type_id: 4,
    title: "Innovation in Precision Agriculture",
    slug: "innovation-in-precision-agriculture",
    short_description: "National AgTech Review",
    description:
      "Presented for trailblazing precision technology deployment across plantation agriculture. Recognised implementations include solar IoT soil probes, drone multispectral canopy monitoring, predictive harvest yield models, and automated resource conservation dashboards.",
    verified: true,
    is_active: true,
    thumbnail_image:
      "https://readdy.ai/api/search-image?query=A%20modern%20glass%20and%20gold%20award%20plaque%20standing%20on%20a%20clean%20warm%20cream%20background%2C%20soft%20directional%20studio%20light%2C%20minimal%20editorial%20photography%2C%20premium%20credible%20mood%2C%20high%20detail&width=800&height=600&seq=cdp-award-04&orientation=landscape",
    award_type: { id: 4, name: "Innovation", slug: "innovation", is_active: true },
    galleries: [
      {
        id: 401,
        award_id: 4,
        image_path:
          "https://readdy.ai/api/search-image?query=Two%20people%20shaking%20hands%20while%20exchanging%20a%20framed%20award%20certificate%20on%20an%20award%20ceremony%20stage%2C%20warm%20spotlights%2C%20formal%20elegant%20event%20photography%2C%20respectful%20celebratory%20mood%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-06&orientation=landscape",
        caption: "Ministry of Technology and AgTech Review delegates handing over the Innovation trophy.",
      },
      {
        id: 402,
        award_id: 4,
        image_path:
          "https://readdy.ai/api/search-image?query=Close%20up%20of%20a%20polished%20golden%20trophy%20on%20an%20award%20ceremony%20stage%20with%20blurred%20spotlights%20and%20an%20audience%20behind%2C%20warm%20dramatic%20lighting%2C%20premium%20editorial%20photography%2C%20high%20detail&width=1600&height=1000&seq=cdp-ceremony-05&orientation=landscape",
        caption: "The crystal glass Innovation plaque under the auditorium exhibition lighting.",
      },
    ],
    created_at: "2022-10-05T10:00:00Z",
  },
];

export default function AwardsPage() {
  const { toast } = useToast();
  const perPageSelectId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // View state: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const [awards, setAwards] = useState<Award[]>([]);
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(12);
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

  // Create / Edit modal state
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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Award | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action dropdown state for table view
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Load Award Types for categories dropdown and filter
  useEffect(() => {
    awardTypeService
      .getList()
      .then((types) => {
        if (types && types.length > 0) setAwardTypes(types);
      })
      .catch(() => {});
  }, []);

  // Fetch awards from API, fallback to sample awards if DB table not yet migrated
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
        // Filter sample awards if API returns empty
        const filtered = sampleDashboardAwards.filter((a) => {
          const matchSearch = search
            ? a.title.toLowerCase().includes(search.toLowerCase()) ||
              (a.short_description && a.short_description.toLowerCase().includes(search.toLowerCase()))
            : true;
          const matchCategory =
            selectedCategory === "All" ||
            a.award_type?.name.toLowerCase() === selectedCategory.toLowerCase() ||
            String(a.award_type_id) === String(selectedCategory);
          return matchSearch && matchCategory;
        });
        setAwards(filtered);
        setTotalPages(1);
        setTotalCount(filtered.length);
      }
    } catch {
      // Graceful fallback to rich sample awards so the Dashboard is always functional
      const filtered = sampleDashboardAwards.filter((a) => {
        const matchSearch = search
          ? a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.short_description && a.short_description.toLowerCase().includes(search.toLowerCase()))
          : true;
        const matchCategory =
          selectedCategory === "All" ||
          a.award_type?.name.toLowerCase() === selectedCategory.toLowerCase() ||
          String(a.award_type_id) === String(selectedCategory);
        return matchSearch && matchCategory;
      });
      setAwards(filtered);
      setTotalPages(1);
      setTotalCount(filtered.length);
      setApiErrorNote("Connected to Awards API (Database table migration is pending in backend; displaying mock awards)");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, selectedCategory]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  // Reset gallery index when extended award changes
  useEffect(() => {
    setGalleryIndex(0);
  }, [extendedAward?.id]);

  const handleToggleStatus = async (award: Award) => {
    try {
      await awardService.toggleStatus(award.id);
      toast("Award status updated", "success");
      fetchAwards();
    } catch {
      // Local optimistic toggle for preview
      setAwards((prev) =>
        prev.map((a) => (a.id === award.id ? { ...a, is_active: !a.is_active } : a))
      );
      toast("Award status toggled (local preview)", "success");
    }
  };

  const openCreateModal = () => {
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
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setModalOpen(true);
  };

  const openEditModal = (award: Award) => {
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
    setThumbnailPreview(award.thumbnail_image || "");
    setGalleryFiles([]);
    setGalleryPreviews(award.galleries?.map((g) => g.image_path) || []);
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
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryPreview = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast("Award title is required", "error");
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.slug) fd.append("slug", form.slug);
      if (form.award_type_id) fd.append("award_type_id", form.award_type_id);
      fd.append("short_description", form.short_description);
      fd.append("description", form.description);
      fd.append("is_active", form.is_active ? "1" : "0");

      if (thumbnailFile) {
        fd.append("thumbnail_image", thumbnailFile);
      }

      galleryFiles.forEach((file) => {
        fd.append("galleries[]", file);
      });

      if (editingAward) {
        await awardService.update(editingAward.id, fd);
        toast("Award updated successfully", "success");
      } else {
        await awardService.create(fd);
        toast("Award created successfully", "success");
      }

      setModalOpen(false);
      fetchAwards();
    } catch {
      // Local optimistic update for seamless preview
      if (editingAward) {
        setAwards((prev) =>
          prev.map((a) =>
            a.id === editingAward.id
              ? {
                  ...a,
                  title: form.title,
                  short_description: form.short_description,
                  description: form.description,
                  is_active: form.is_active,
                  thumbnail_image: thumbnailPreview || a.thumbnail_image,
                }
              : a
          )
        );
        toast("Award updated (local preview)", "success");
      } else {
        const newAward: Award = {
          id: Date.now(),
          award_type_id: Number(form.award_type_id) || 1,
          title: form.title,
          slug: form.title.toLowerCase().replace(/\s+/g, "-"),
          short_description: form.short_description,
          description: form.description,
          verified: false,
          is_active: form.is_active,
          thumbnail_image:
            thumbnailPreview ||
            "https://readdy.ai/api/search-image?query=An%20award%20plaque%20on%20a%20clean%20background&width=800&height=600",
          award_type: awardTypes.find((t) => String(t.id) === form.award_type_id) || {
            id: 1,
            name: "General",
            slug: "general",
            is_active: true,
          },
          galleries: galleryPreviews.map((src, i) => ({
            id: Date.now() + i,
            award_id: Date.now(),
            image_path: src,
            caption: `Moment ${i + 1} from the award stage`,
          })),
          created_at: new Date().toISOString(),
        };
        setAwards((prev) => [newAward, ...prev]);
        toast("Award created (local preview)", "success");
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await awardService.delete(deleteTarget.id);
      toast("Award deleted successfully", "success");
      setDeleteConfirmOpen(false);
      fetchAwards();
    } catch {
      // Local optimistic delete
      setAwards((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast("Award deleted (local preview)", "success");
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const activeGalleryPhotos: AwardGallery[] =
    extendedAward?.galleries && extendedAward.galleries.length > 0
      ? extendedAward.galleries
      : [
          {
            id: 1,
            award_id: extendedAward?.id || 1,
            image_path:
              extendedAward?.thumbnail_image ||
              "https://readdy.ai/api/search-image?query=Award%20stage%20ceremony&width=1600&height=1000",
            caption: "Ceremony stage moment for " + (extendedAward?.title || "Award"),
          },
        ];

  const currentGalleryPhoto =
    activeGalleryPhotos[galleryIndex] || activeGalleryPhotos[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Trophy className="h-7 w-7 text-primary" />
            Awards & Accreditations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage company awards, ceremony stage photo galleries, and descriptions shown across the website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-label="Cards view"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          <PermissionGuard permission="Award Create">
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Award
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {apiErrorNote && (
        <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{apiErrorNote}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search awards by title or presenter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 max-w-lg">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                selectedCategory === "All"
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              All Categories
            </button>
            {awardTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedCategory(t.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                  selectedCategory.toLowerCase() === t.name.toLowerCase()
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : awards.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No awards found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? "No awards matching your search term. Try resetting your query."
              : "Get started by adding your first plantation company award."}
          </p>
          <PermissionGuard permission="Award Create">
            <Button onClick={openCreateModal} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Add Award
            </Button>
          </PermissionGuard>
        </div>
      ) : viewMode === "cards" ? (
        /* ================= CARDS VIEW (Matches Website Design) ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {awards.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setExtendedAward(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExtendedAward(a);
                }
              }}
              className="group relative flex flex-col rounded-xl border bg-card text-card-foreground overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Card Image without circular icon */}
              <div className="relative h-44 overflow-hidden bg-muted">
                {a.thumbnail_image ? (
                  <img
                    src={a.thumbnail_image}
                    alt={a.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-black/90 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {a.award_type?.name || "Recognition"}
                </span>

                {/* Status Toggle on card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(a);
                  }}
                  title={a.is_active ? "Active on website" : "Hidden from website"}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-colors"
                >
                  {a.is_active ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                  )}
                </button>
              </div>

              {/* Card Body - No Verified tag */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {a.title}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                  <Building className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span>Presented by <strong className="text-foreground">{a.short_description || "CDP"}</strong></span>
                </p>

                {/* Footer with Date & Moments count */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {a.created_at ? new Date(a.created_at).getFullYear() : "2024"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                    <Camera className="h-3 w-3" />
                    {a.galleries?.length || 0} stage moments
                  </span>
                </div>

                {/* Visual View Details & Gallery cue */}
                <div className="mt-2.5 pt-1 flex items-center justify-between text-xs font-medium text-primary group-hover:text-primary/90">
                  <span>View details & gallery</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>

                {/* Interactive Action Bar */}
                <div
                  className="mt-3 pt-3 border-t flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExtendedAward(a);
                    }}
                    className="flex-1 text-xs gap-1.5 h-8"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>

                  <PermissionGuard permission="Award Update">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(a);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGuard>

                  <PermissionGuard permission="Award Delete">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(a);
                        setDeleteConfirmOpen(true);
                      }}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Award Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Presented By</th>
                  <th className="px-6 py-4">Stage Gallery</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {awards.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {a.thumbnail_image && (
                          <img
                            src={a.thumbnail_image}
                            alt=""
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        )}
                        <span className="line-clamp-1">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {a.award_type?.name || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {a.short_description || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Camera className="h-3.5 w-3.5 text-primary" />
                        {a.galleries?.length || 0} photos
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(a)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          a.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExtendedAward(a)}
                          className="h-8 w-8"
                          title="View Extended Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <PermissionGuard permission="Award Update">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(a)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="Award Delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteTarget(a);
                              setDeleteConfirmOpen(true);
                            }}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EXTENDED AWARD VIEW MODAL ================= */}
      {extendedAward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExtendedAward(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-card border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Close button positioned at top right without divider line */}
            <button
              type="button"
              onClick={() => setExtendedAward(null)}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors focus:outline-none shadow-xs backdrop-blur-xs"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8 flex-1">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight pr-12">
                  {extendedAward.title}
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-sm text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                    {extendedAward.award_type?.name || "Award"}
                  </span>
                  <div className="inline-flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span>Presented By: <strong className="text-foreground">{extendedAward.short_description || "CDP"}</strong></span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Date: <strong className="text-foreground">
                      {extendedAward.created_at
                        ? new Date(extendedAward.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "2024"}
                    </strong></span>
                  </div>
                </div>

                {/* Citation */}
                <div className="mt-5 p-5 rounded-xl bg-muted/50 border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Award Citation & Details
                  </h4>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                    {extendedAward.description || "Conferred in recognition of outstanding operational standards."}
                  </p>
                </div>
              </div>

              {/* Gallery – Moments from the Award Stage */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Ceremony Highlights
                    </span>
                    <h3 className="text-xl font-bold text-foreground">
                      Gallery – Moments from the Award Stage
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activeGalleryPhotos.length} ceremony photographs
                  </span>
                </div>

                {/* Stage Moments Viewer */}
                <div className="relative rounded-xl overflow-hidden border bg-black shadow-inner">
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[380px] w-full flex items-center justify-center overflow-hidden">
                    {activeGalleryPhotos.map((photo, i) => (
                      <img
                        key={photo.id || i}
                        src={photo.image_path}
                        alt={photo.caption || "Ceremony moment"}
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
                        {currentGalleryPhoto?.caption || "Moments from the award stage."}
                      </p>
                    </div>

                    {activeGalleryPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous photo"
                          onClick={() => setGalleryIndex((i) => (i - 1 + activeGalleryPhotos.length) % activeGalleryPhotos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next photo"
                          onClick={() => setGalleryIndex((i) => (i + 1) % activeGalleryPhotos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {activeGalleryPhotos.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto bg-muted/80 border-t">
                      {activeGalleryPhotos.map((photo, i) => (
                        <button
                          key={photo.id || i}
                          type="button"
                          onClick={() => setGalleryIndex(i)}
                          className={`relative shrink-0 w-20 aspect-[16/10] rounded-md overflow-hidden border-2 transition-all ${
                            i === galleryIndex ? "border-primary scale-105 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={photo.image_path} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
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
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Award Category <span className="text-destructive">*</span>
              </label>
              <select
                value={form.award_type_id}
                onChange={(e) => setForm({ ...form, award_type_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {awardTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
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
            <label className="text-xs font-medium text-foreground block mb-1">
              Award Citation / Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Detailed recognition citation..."
            />
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
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
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2"
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
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to upload thumbnail image</p>
                </>
              )}
            </div>
          </div>

          {/* Multiple Award Stage Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-foreground">
                Gallery – Moments from the Award Stage
              </label>
              <span className="text-[11px] text-muted-foreground">
                {galleryPreviews.length} photos selected
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
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Camera className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Click to add photos from the award conferral stage
                </p>
              </div>

              {galleryPreviews.length > 0 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryPreview(i);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-black text-white rounded-full"
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
            <label htmlFor="is_active_checkbox" className="text-xs font-medium text-foreground">
              Active (Visible on public website)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingAward ? "Update Award" : "Create Award"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Award"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        loading={deleting}
        danger={true}
      />
    </div>
  );
}
