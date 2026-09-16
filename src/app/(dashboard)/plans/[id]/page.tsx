"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Edit, Target, FileText, CheckCircle2, XCircle, List } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Plan } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

function ViewPlanContent({ planId }: { planId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/plans/${planId}`);
      setPlan(response.data.data);
    } catch {
      toast("Failed to load plan", "error");
      router.push("/plans");
    } finally {
      setLoading(false);
    }
  }, [planId, toast, router]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Plan Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View plan information</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/plans" className="hover:text-primary">Plans</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {plan.image ? (
              <img
                src={`${IMAGE_URL}/${plan.image}`}
                alt={plan.maintitle}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">{plan.maintitle}</h1>
              <p className="text-sm text-text-muted dark:text-gray-400">{plan.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                plan.is_active
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {plan.is_active ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {plan.is_active ? "Active" : "Inactive"}
            </span>
            {hasPermission("Plan Update") && (
              <button
                onClick={() => router.push(`/plans/${plan.id}/edit`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" />
                Edit Plan
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
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Main Title</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{plan.maintitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Subtitle</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{plan.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Status</p>
                <p className={`text-sm font-medium ${plan.is_active ? "text-green-600" : "text-gray-500"}`}>
                  {plan.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Features */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Description & Features</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Short Description</p>
              <p className="text-sm text-text-primary dark:text-white">{plan.short_description}</p>
            </div>
            {plan.features && plan.features.length > 0 && (
              <div className="border-t border-border pt-4 dark:border-gray-700">
                <div className="mb-2 flex items-center gap-2">
                  <List className="h-4 w-4 text-text-muted dark:text-gray-400" />
                  <p className="text-xs text-text-muted dark:text-gray-400">Features ({plan.features.length})</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-text-primary dark:text-white">{feature.feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {plan.image && (
              <div className="border-t border-border pt-4 dark:border-gray-700">
                <p className="mb-2 text-xs text-text-muted dark:text-gray-400">Image</p>
                <img
                  src={`${IMAGE_URL}/${plan.image}`}
                  alt={plan.maintitle}
                  className="h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Plan Index">
      <ViewPlanContent planId={id} />
    </PermissionGuard>
  );
}
