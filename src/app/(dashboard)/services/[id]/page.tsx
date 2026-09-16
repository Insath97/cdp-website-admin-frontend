"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Edit, Cpu, FileText, Image as ImageIcon, CheckCircle2, XCircle, Calendar } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Service } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function ViewServiceContent({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/services/${serviceId}`);
      setService(response.data.data);
    } catch {
      toast("Failed to load service", "error");
      router.push("/services");
    } finally {
      setLoading(false);
    }
  }, [serviceId, toast, router]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Service Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View service information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/services" className="hover:text-primary">Services</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {service.imagepath ? (
              <img
                src={`${IMAGE_URL}/${service.imagepath}`}
                alt={service.title}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{service.title}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">Slug: {service.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                service.is_active
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {service.is_active ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {service.is_active ? "Active" : "Inactive"}
            </span>
            {hasPermission("Service Update") && (
              <button
                onClick={() => router.push(`/services/${service.id}/edit`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" />
                Edit Service
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Basic Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Cpu className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Title</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{service.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Slug</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{service.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Status</p>
                <p className={`text-sm font-medium ${service.is_active ? "text-green-600" : "text-gray-500"}`}>
                  {service.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Image */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Description & Media</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Description</p>
              <p className="text-sm text-text-primary dark:text-white">{service.description}</p>
            </div>
            {service.imagepath && (
              <div className="border-t border-border pt-4 dark:border-gray-700">
                <p className="mb-2 text-xs text-text-muted dark:text-gray-400">Image</p>
                <img
                  src={`${IMAGE_URL}/${service.imagepath}`}
                  alt={service.title}
                  className="h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}
            <div className="border-t border-border pt-4 dark:border-gray-700">
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Created At</p>
              <p className="text-sm text-text-primary dark:text-white">
                {new Date(service.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Service Index">
      <ViewServiceContent serviceId={id} />
    </PermissionGuard>
  );
}
