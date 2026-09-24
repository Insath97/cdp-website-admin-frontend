"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Edit,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  User,
  Image as ImageIcon,
  Send,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { eventService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Event } from "@/services";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function ViewEventContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission, user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isSuperAdmin = user?.roles?.some((r: { name: string }) => r.name === "Super Admin");
  const canApprove = isSuperAdmin || user?.permissions?.includes("Event Approve");

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(eventId);
      setEvent(data);
    } catch {
      toast("Failed to load event", "error");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  }, [eventId, toast, router]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleApprove = async () => {
    if (!event) return;
    try {
      await eventService.approve(event.id);
      toast("Event approved successfully", "success");
      fetchEvent();
    } catch {
      toast("Failed to approve event", "error");
    }
  };

  const handleReject = async () => {
    if (!event || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await eventService.reject(event.id, rejectReason);
      toast("Event rejected successfully", "success");
      setRejectDialog(false);
      setRejectReason("");
      fetchEvent();
    } catch {
      toast("Failed to reject event", "error");
    } finally {
      setRejecting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!event) return;
    setSubmittingReview(true);
    try {
      await eventService.submitForReview(event.id);
      toast("Event submitted for review", "success");
      fetchEvent();
    } catch {
      toast("Failed to submit event for review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Event Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View event information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/events" className="hover:text-primary">Events</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {event.thumbnail_image ? (
              <img
                src={`${IMAGE_URL}/${event.thumbnail_image}`}
                alt={event.title}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{event.title}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">Slug: {event.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                STATUS_STYLES[event.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                event.is_active
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {event.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {event.is_active ? "Active" : "Inactive"}
            </span>
            {hasPermission("Event Update") && (
              <button
                onClick={() => router.push(`/events/${event.id}/edit`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
            {event.status === "draft" && hasPermission("Event Create") && (
              <button
                onClick={handleSubmitForReview}
                disabled={submittingReview}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Submit for Review
              </button>
            )}
            {canApprove && (event.status === "pending" || event.status === "draft") && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setRejectDialog(true)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Event Information */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Calendar className="h-5 w-5 text-primary" />
            Event Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Title</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{event.title}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Created Date</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">
                {event.created_date ? new Date(event.created_date).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400 block mb-1">URLs</span>
              {event.urls && event.urls.length > 0 ? (
                <div className="space-y-1">
                  {event.urls.map((urlObj) => (
                    <a
                      key={urlObj.id}
                      href={urlObj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {urlObj.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              ) : (
                <span className="text-sm font-medium text-text-primary dark:text-white">-</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Status</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[event.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Created By</span>
              <span className="text-sm font-medium text-text-primary dark:text-white flex items-center gap-1">
                <User className="h-3 w-3" /> {event.created_by?.name || "-"}
              </span>
            </div>
            {event.decision_by && (
              <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
                <span className="text-sm text-text-muted dark:text-gray-400">Decision By</span>
                <span className="text-sm font-medium text-text-primary dark:text-white flex items-center gap-1">
                  <User className="h-3 w-3" /> {(event.decision_by as { name: string })?.name}
                </span>
              </div>
            )}
            {event.rejected_reason && (
              <div className="py-2 border-b border-border dark:border-gray-700">
                <span className="text-sm text-text-muted dark:text-gray-400 block mb-1">Rejection Reason</span>
                <p className="text-sm text-red-600 dark:text-red-400">{event.rejected_reason}</p>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted dark:text-gray-400">Created At</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">
                {new Date(event.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Description + Tags + Gallery */}
        <div className="space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <FileText className="h-5 w-5 text-primary" />
              Description
            </h2>
            {event.description ? (
              <div
                className="prose prose-sm max-w-none text-text-muted dark:text-gray-400"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No description provided</p>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
                <Calendar className="h-5 w-5 text-primary" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {event.galleries && event.galleries.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
                <ImageIcon className="h-5 w-5 text-primary" />
                Gallery ({event.galleries.length} images)
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {event.galleries.map((gallery) => (
                  <button
                    key={gallery.id}
                    onClick={() => setLightboxImage(`${IMAGE_URL}/${gallery.image_path}`)}
                    className="block cursor-pointer"
                  >
                    <img
                      src={`${IMAGE_URL}/${gallery.image_path}`}
                      alt="Gallery"
                      className="h-32 w-full rounded-lg object-cover hover:opacity-80 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-text-primary dark:text-white">Reject Event</h3>
            <p className="mt-3 text-sm text-text-muted dark:text-gray-400">
              Are you sure you want to reject &quot;{event.title}&quot;? Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => { setRejectDialog(false); setRejectReason(""); }}
                disabled={rejecting}
                className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Gallery"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function ViewEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <PermissionGuard permission="Event Index">
      <ViewEventContent eventId={resolvedParams.id} />
    </PermissionGuard>
  );
}
