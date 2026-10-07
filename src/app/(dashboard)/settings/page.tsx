"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Loader2, RefreshCw, Upload, Globe, Mail, Phone, MapPin, Share2, Image as ImageIcon, Database, Download } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

const SETTING_LABELS: Record<string, { label: string; group: string; type?: string }> = {
  site_name: { label: "Website / Brand Name", group: "general" },
  official_email: { label: "Official Contact Email", group: "general" },
  digital_presence: { label: "Website URL (Domain)", group: "general" },
  company_registration_number: { label: "Company Registration Number", group: "general" },

  office_address: { label: "Primary Office Address", group: "contact", type: "textarea" },
  head_office_address: { label: "Head Office Address", group: "contact", type: "textarea" },
  mobile_number: { label: "Primary Phone Number", group: "contact" },
  whatsapp_number: { label: "Official WhatsApp Number (with country code)", group: "contact" },

  contact_notification_email: { label: "Inquiry Notification Email", group: "notifications" },
  enable_contact_notification: { label: "Enable Contact Form Notifications (1/0)", group: "notifications" },
  career_mail: { label: "Job Applications Email", group: "notifications" },
  enable_job_alert_notification: { label: "Enable Job Alert Notifications (1/0)", group: "notifications" },

  facebook_url: { label: "Facebook Page URL", group: "social" },
  instagram_url: { label: "Instagram Profile URL", group: "social" },
  youtube_url: { label: "YouTube Channel URL", group: "social" },
  twitter_url: { label: "X / Twitter URL", group: "social" },
  linkedin_url: { label: "LinkedIn Company URL", group: "social" },
};

function SettingsContent() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingDb, setExportingDb] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "notifications" | "social" | "branding" | "backup">("general");
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      const data = response.data.data;
      const values: Record<string, string> = {};

      if (Array.isArray(data)) {
        data.forEach((s: { key: string; value: string }) => {
          values[s.key] = s.value ?? "";
        });
      } else if (data && typeof data === "object") {
        Object.keys(data).forEach((key) => {
          values[key] = data[key] ?? "";
        });
      }
      setSettingsValues(values);
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setSettingsValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(settingsValues).forEach((key) => {
        if (settingsValues[key] !== undefined && settingsValues[key] !== null) {
          formData.append(key, settingsValues[key]);
        }
      });

      if (logoFile) {
        formData.append("site_logo", logoFile);
      }
      if (faviconFile) {
        formData.append("site_favicon", faviconFile);
      }

      await apiClient.post("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("System settings saved successfully", "success");
      fetchSettings();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save settings";
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExportDatabase = async () => {
    try {
      setExportingDb(true);
      const response = await apiClient.get("/database/export", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/sql" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cdp-database-backup-${new Date().toISOString().split("T")[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast("Database SQL backup downloaded successfully", "success");
    } catch {
      toast("Failed to download database backup", "error");
    } finally {
      setExportingDb(false);
    }
  };

  const renderFieldsForGroup = (groupKey: string) => {
    const keys = Object.keys(SETTING_LABELS).filter(
      (k) => SETTING_LABELS[k].group === groupKey
    );

    return (
      <div className="space-y-4">
        {keys.map((key) => {
          const config = SETTING_LABELS[key];
          return (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400">
                {config.label}
              </label>
              {config.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={settingsValues[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              ) : (
                <input
                  type="text"
                  value={settingsValues[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Settings</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">System parameters & public brand configurations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-border dark:border-gray-700">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "general"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <Globe className="h-4 w-4" />
              General Info
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "contact"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Offices & Contact
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <Mail className="h-4 w-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "social"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <Share2 className="h-4 w-4" />
              Social Media
            </button>
            <button
              onClick={() => setActiveTab("branding")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "branding"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Logos & Assets
            </button>
            <button
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "backup"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <Database className="h-4 w-4" />
              Database Backup
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" && renderFieldsForGroup("general")}
            {activeTab === "contact" && renderFieldsForGroup("contact")}
            {activeTab === "notifications" && renderFieldsForGroup("notifications")}
            {activeTab === "social" && renderFieldsForGroup("social")}

            {activeTab === "branding" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border p-5 dark:border-gray-700">
                  <label className="block text-sm font-medium text-text-primary dark:text-gray-200">
                    Site Logo
                  </label>
                  {settingsValues.site_logo && (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-background-50 p-2 dark:bg-gray-900">
                      <img
                        src={`http://localhost:8000/${settingsValues.site_logo}`}
                        alt="Current Logo"
                        className="max-h-full object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                  />
                  <p className="text-xs text-text-muted">PNG, JPG or WebP (max 2MB)</p>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-5 dark:border-gray-700">
                  <label className="block text-sm font-medium text-text-primary dark:text-gray-200">
                    Site Favicon
                  </label>
                  {settingsValues.site_favicon && (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-background-50 p-2 dark:bg-gray-900">
                      <img
                        src={`http://localhost:8000/${settingsValues.site_favicon}`}
                        alt="Current Favicon"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".ico,.png"
                    onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                  />
                  <p className="text-xs text-text-muted">ICO or PNG (max 1MB)</p>
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="max-w-2xl space-y-6">
                <div className="rounded-xl border border-border p-6 dark:border-gray-700 bg-background-50/50 dark:bg-gray-900/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                      <Database className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary dark:text-white">
                        Full Database SQL Export
                      </h3>
                      <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                        Generate and download an immediate, complete SQL snapshot of the database.
                        This includes all tables, schema definitions, CMS configurations, user profiles, activity logs, and content records.
                      </p>

                      <div className="mt-5 flex items-center gap-3">
                        <PermissionGuard permission="Database Export">
                          <button
                            type="button"
                            onClick={handleExportDatabase}
                            disabled={exportingDb}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {exportingDb ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating SQL Dump...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Download SQL Backup (.sql)
                              </>
                            )}
                          </button>
                        </PermissionGuard>
                      </div>

                      <p className="mt-3 text-xs text-text-muted dark:text-gray-500">
                        Note: Backup files are generated securely on the server and immediately purged after the stream concludes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border px-6 py-4 dark:border-gray-700">
            <p className="text-xs text-text-muted dark:text-gray-500">
              Authenticated user: <strong className="text-text-primary dark:text-gray-300">{user?.name}</strong> ({user?.email})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PermissionGuard permission="Setting Index">
      <SettingsContent />
    </PermissionGuard>
  );
}
