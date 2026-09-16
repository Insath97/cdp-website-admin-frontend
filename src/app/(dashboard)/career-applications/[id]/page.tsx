"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Download,
  ChevronDown,
} from "lucide-react";
import { careerApplicationService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { CareerApplication } from "@/services";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

const STATUS_OPTIONS = [
  { label: "Applied", value: "applied" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
  { label: "Offered", value: "offered" },
  { label: "Hired", value: "hired" },
];

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  reviewing: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  shortlisted: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  offered: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  hired: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function ViewApplicationContent({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [application, setApplication] = useState<CareerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const data = await careerApplicationService.getById(applicationId);
      setApplication(data);
    } catch {
      toast("Failed to load application", "error");
      router.push("/career-applications");
    } finally {
      setLoading(false);
    }
  }, [applicationId, toast, router]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;
    setUpdatingStatus(true);
    try {
      const updated = await careerApplicationService.updateStatus(application.id, newStatus);
      setApplication(updated);
      setStatusDropdownOpen(false);
      toast("Status updated successfully", "success");
    } catch {
      toast("Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Application Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View application information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/career-applications" className="hover:text-primary">Applications</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{application.fullname}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">
                Application Code: <span className="font-medium text-text-primary dark:text-white">{application.application_code}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                STATUS_STYLES[application.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
            {hasPermission("Career Application Update Status") && (
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  disabled={updatingStatus}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                  <ChevronDown className={`h-4 w-4 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusUpdate(opt.value)}
                        className={`flex w-full items-center px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          opt.value === application.status ? "bg-primary/10 text-primary font-medium" : "text-text-primary dark:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Application Info */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <FileText className="h-5 w-5 text-primary" />
            Application Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Application Code</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.application_code}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Applicant Name</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.fullname}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Email</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Phone</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.phone_number}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Position Applied</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.career?.title || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Department</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.career?.department || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Location</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{application.career?.location || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted dark:text-gray-400">Applied On</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Cover Letter + Resume */}
        <div className="space-y-6">
          {/* Cover Letter */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <FileText className="h-5 w-5 text-primary" />
              Cover Letter
            </h2>
            {application.cover_letter ? (
              <p className="text-sm text-text-muted dark:text-gray-400 whitespace-pre-wrap">{application.cover_letter}</p>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No cover letter provided</p>
            )}
          </div>

          {/* Resume */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <Download className="h-5 w-5 text-primary" />
              Resume
            </h2>
            {application.resume_path ? (
              <a
                href={`${IMAGE_URL}/${application.resume_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </a>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No resume uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <PermissionGuard permission="Career Application Show">
      <ViewApplicationContent applicationId={resolvedParams.id} />
    </PermissionGuard>
  );
}
