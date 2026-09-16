"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Edit,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Building2,
  Clock,
  ToggleLeft,
  ToggleRight,
  List,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Career } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function ViewCareerContent({ careerId }: { careerId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCareer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/careers/${careerId}`);
      setCareer(response.data.data);
    } catch {
      toast("Failed to load career", "error");
      router.push("/careers");
    } finally {
      setLoading(false);
    }
  }, [careerId, toast, router]);

  useEffect(() => {
    fetchCareer();
  }, [fetchCareer]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!career) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Job Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View job posting information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/careers" className="hover:text-primary">Manage Jobs</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {career.poster_image ? (
              <img
                src={`${IMAGE_URL}/${career.poster_image}`}
                alt={career.title}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{career.title}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">Slug: {career.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                career.is_active
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {career.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {career.is_active ? "Active" : "Inactive"}
            </span>
            {hasPermission("Career Update") && (
              <button
                onClick={() => router.push(`/careers/${career.id}/edit`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Job Information */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Title</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{career.title}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Department</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{career.department || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Location</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{career.location || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Job Type</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">{career.job_type || "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700">
              <span className="text-sm text-text-muted dark:text-gray-400">Due Date</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">
                {career.due_date ? new Date(career.due_date).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-muted dark:text-gray-400">Created At</span>
              <span className="text-sm font-medium text-text-primary dark:text-white">
                {new Date(career.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Description + Relations */}
        <div className="space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <FileText className="h-5 w-5 text-primary" />
              Description
            </h2>
            {career.description ? (
              <p className="text-sm text-text-muted dark:text-gray-400 whitespace-pre-wrap">{career.description}</p>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No description provided</p>
            )}
          </div>

          {/* Key Responsibilities */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <List className="h-5 w-5 text-primary" />
              Key Responsibilities
            </h2>
            {career.responsibilities && career.responsibilities.length > 0 ? (
              <ul className="space-y-2">
                {career.responsibilities.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No responsibilities listed</p>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <List className="h-5 w-5 text-primary" />
              Requirements
            </h2>
            {career.requirements && career.requirements.length > 0 ? (
              <ul className="space-y-2">
                {career.requirements.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No requirements listed</p>
            )}
          </div>

          {/* Benefits */}
          <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
              <List className="h-5 w-5 text-primary" />
              Benefits
            </h2>
            {career.benefits && career.benefits.length > 0 ? (
              <ul className="space-y-2">
                {career.benefits.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted dark:text-gray-400 italic">No benefits listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <PermissionGuard permission="Career Index">
      <ViewCareerContent careerId={resolvedParams.id} />
    </PermissionGuard>
  );
}
