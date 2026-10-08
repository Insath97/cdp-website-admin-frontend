"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Save,
  Loader2,
  RefreshCw,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  Image as ImageIcon,
  Database,
  Download,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Check,
  CheckCircle2,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { cmsService } from "@/services/cms.service";
import { useAppStore } from "@/stores/app-store";
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
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "notifications" | "social" | "branding" | "backup" | "theme"
  >("general");
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // Theme Settings State
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "default">("default");
  const [activeSavedTheme, setActiveSavedTheme] = useState<"light" | "dark" | "default">("default");
  const [savingTheme, setSavingTheme] = useState(false);

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

      // Fetch active website theme from CMS
      try {
        const cmsData = await cmsService.getAll("global");
        const themeItem = cmsData.global?.theme?.find(
          (item: any) => item.key === "active_theme"
        );
        if (
          themeItem &&
          (themeItem.value === "light" ||
            themeItem.value === "dark" ||
            themeItem.value === "default")
        ) {
          setSelectedTheme(themeItem.value as "light" | "dark" | "default");
          setActiveSavedTheme(themeItem.value as "light" | "dark" | "default");
        } else if (typeof window !== "undefined") {
          const localTheme = localStorage.getItem("cdp-website-theme") as
            | "light"
            | "dark"
            | "default"
            | null;
          if (
            localTheme === "light" ||
            localTheme === "dark" ||
            localTheme === "default"
          ) {
            setSelectedTheme(localTheme);
            setActiveSavedTheme(localTheme);
          }
        }
      } catch {
        if (typeof window !== "undefined") {
          const localTheme = localStorage.getItem("cdp-website-theme") as
            | "light"
            | "dark"
            | "default"
            | null;
          if (
            localTheme === "light" ||
            localTheme === "dark" ||
            localTheme === "default"
          ) {
            setSelectedTheme(localTheme);
            setActiveSavedTheme(localTheme);
          }
        }
      }
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

  const handleSaveTheme = async (themeToSave = selectedTheme) => {
    setSavingTheme(true);
    try {
      // 1. Persist to CMS database for the public website
      await cmsService.updateBulk([
        {
          page: "global",
          section: "theme",
          key: "active_theme",
          value: themeToSave,
          type: "text",
          label: "Website Active Theme",
          metadata: {
            updated_at: new Date().toISOString(),
            description: "Active theme configured from Dashboard Settings",
          },
        },
      ]);

      // 2. Persist locally for immediate availability
      if (typeof window !== "undefined") {
        localStorage.setItem("cdp-server-default-theme", themeToSave);
        localStorage.setItem("cdp-website-theme", themeToSave);
        const resolved = themeToSave === "dark" ? "dark" : "light";
        localStorage.setItem("cdp-theme", resolved);

        // 3. Broadcast across tabs and windows
        try {
          const channel = new BroadcastChannel("cdp-theme-sync");
          channel.postMessage({ type: "server_default", theme: themeToSave, resolved });
          channel.close();
        } catch {
          // BroadcastChannel may not be available in all contexts
        }

        window.dispatchEvent(
          new CustomEvent("cdp-theme-changed", {
            detail: { theme: themeToSave, resolved },
          })
        );
      }

      // 4. Synchronize dashboard theme state
      const resolvedAdminTheme = themeToSave === "dark" ? "dark" : "light";
      useAppStore.getState().setTheme(resolvedAdminTheme);

      setActiveSavedTheme(themeToSave);
      const readableName =
        themeToSave === "default"
          ? "Default (Light)"
          : themeToSave === "dark"
          ? "Dark"
          : "Light";
      toast(`Website theme successfully saved as ${readableName}`, "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save theme settings";
      toast(msg, "error");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === "theme") {
      await handleSaveTheme();
      return;
    }

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

      // If theme was modified while saving general settings, also persist it
      if (selectedTheme !== activeSavedTheme) {
        await handleSaveTheme();
      }

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
          disabled={saving || savingTheme || loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {saving || savingTheme ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {activeTab === "theme" ? "Save Theme" : "Save Changes"}
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
              onClick={() => setActiveTab("theme")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-text-muted hover:text-text-primary dark:text-gray-400"
              }`}
            >
              <Palette className="h-4 w-4" />
              Theme
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

            {/* NEW: THEME TAB */}
            {activeTab === "theme" && (
              <div className="space-y-8">
                {/* Header Information Banner */}
                <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-primary/30 dark:bg-primary/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-text-primary dark:text-white">
                        Website Active Theme
                      </h3>
                    </div>
                    <p className="text-sm text-text-muted dark:text-gray-300">
                      Configure the default active theme for the public website. The selected appearance is applied immediately across all public layouts, navigation bars, cards, buttons, modals, and forms.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary dark:bg-primary/30 dark:text-emerald-300">
                      Active: {activeSavedTheme === "default" ? "Default (Light)" : activeSavedTheme.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Theme Selection Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Option 1: Light */}
                  <div
                    onClick={() => setSelectedTheme("light")}
                    className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                      selectedTheme === "light"
                        ? "border-primary bg-primary/[0.03] shadow-md ring-2 ring-primary/20 dark:bg-primary/[0.08]"
                        : "border-border bg-surface hover:border-gray-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                          <Sun className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text-primary dark:text-white">
                            Light
                          </h4>
                          <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            Daylight Aesthetic
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                          selectedTheme === "light"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                        }`}
                      >
                        {selectedTheme === "light" && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-text-muted dark:text-gray-300">
                      Crisp, high-clarity daylight theme. Uses clean ivory canvases, deep forest green headings, warm golden call-to-actions, and subtle border lines.
                    </p>

                    {/* Miniature UI Mockup */}
                    <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-[#FDFBF7] p-3 shadow-inner dark:border-gray-700">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#168B61]" />
                          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                        </div>
                        <div className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center">
                          <Sun className="h-2.5 w-2.5 text-amber-600" />
                        </div>
                      </div>
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-2.5 w-3/4 rounded-sm bg-[#0E382B]" />
                        <div className="h-1.5 w-full rounded-sm bg-gray-300" />
                        <div className="h-1.5 w-4/5 rounded-sm bg-gray-300" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="rounded bg-[#E5B25D] px-2 py-0.5 text-[9px] font-bold text-[#0F382F]">
                          Explore
                        </div>
                        <div className="rounded bg-white px-2 py-0.5 text-[9px] font-medium text-gray-700 shadow-2xs border border-gray-200">
                          Advisor
                        </div>
                      </div>
                    </div>

                    {activeSavedTheme === "light" && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Currently Active on Website
                      </div>
                    )}
                  </div>

                  {/* Option 2: Dark */}
                  <div
                    onClick={() => setSelectedTheme("dark")}
                    className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                      selectedTheme === "dark"
                        ? "border-primary bg-primary/[0.03] shadow-md ring-2 ring-primary/20 dark:bg-primary/[0.08]"
                        : "border-border bg-surface hover:border-gray-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
                          <Moon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text-primary dark:text-white">
                            Dark
                          </h4>
                          <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Night & Low-Glare
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                          selectedTheme === "dark"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                        }`}
                      >
                        {selectedTheme === "dark" && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-text-muted dark:text-gray-300">
                      Deep plantation forest-emerald canvas (<code className="rounded bg-black/10 px-1 py-0.5 text-[10px] dark:bg-black/30">#0A221C</code>), elevated cards (<code className="rounded bg-black/10 px-1 py-0.5 text-[10px] dark:bg-black/30">#0F382F</code>), and luminous high-contrast sage text (<code className="rounded bg-black/10 px-1 py-0.5 text-[10px] dark:bg-black/30">#E2ECD5</code>).
                    </p>

                    {/* Miniature UI Mockup */}
                    <div className="mt-5 overflow-hidden rounded-xl border border-[#1D5447] bg-[#0A221C] p-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-[#1D5447] pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#B4D396]" />
                          <div className="h-1.5 w-12 rounded-full bg-[#1D5447]" />
                        </div>
                        <div className="h-4 w-4 rounded-full bg-[#0F382F] flex items-center justify-center border border-[#1D5447]">
                          <Moon className="h-2.5 w-2.5 text-[#E5B25D]" />
                        </div>
                      </div>
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-2.5 w-3/4 rounded-sm bg-[#E2ECD5]" />
                        <div className="h-1.5 w-full rounded-sm bg-[#C5D5B5]/60" />
                        <div className="h-1.5 w-4/5 rounded-sm bg-[#9BB18D]/60" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="rounded bg-[#E5B25D] px-2 py-0.5 text-[9px] font-bold text-[#0F382F]">
                          Explore
                        </div>
                        <div className="rounded bg-[#0F382F] px-2 py-0.5 text-[9px] font-medium text-[#E2ECD5] border border-[#1D5447]">
                          Advisor
                        </div>
                      </div>
                    </div>

                    {activeSavedTheme === "dark" && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Currently Active on Website
                      </div>
                    )}
                  </div>

                  {/* Option 3: Default (Light) */}
                  <div
                    onClick={() => setSelectedTheme("default")}
                    className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                      selectedTheme === "default"
                        ? "border-primary bg-primary/[0.03] shadow-md ring-2 ring-primary/20 dark:bg-primary/[0.08]"
                        : "border-border bg-surface hover:border-gray-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text-primary dark:text-white">
                            Default (Light)
                          </h4>
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                            System Standard
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                          selectedTheme === "default"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                        }`}
                      >
                        {selectedTheme === "default" && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-text-muted dark:text-gray-300">
                      Standard website fallback configuration. Inherits the original Light theme as the default baseline across all public visitors and new browser sessions.
                    </p>

                    {/* Miniature UI Mockup */}
                    <div className="mt-5 overflow-hidden rounded-xl border border-blue-200/80 bg-gradient-to-br from-[#FDFBF7] to-blue-50/30 p-3 shadow-inner dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#168B61]" />
                          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                        </div>
                        <div className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          FALLBACK
                        </div>
                      </div>
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-2.5 w-3/4 rounded-sm bg-[#0E382B] dark:bg-gray-200" />
                        <div className="h-1.5 w-full rounded-sm bg-gray-300 dark:bg-gray-600" />
                        <div className="h-1.5 w-4/5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="rounded bg-[#168B61] px-2 py-0.5 text-[9px] font-bold text-white">
                          Default
                        </div>
                        <div className="text-[9px] text-text-muted dark:text-gray-400">
                          Light Base
                        </div>
                      </div>
                    </div>

                    {activeSavedTheme === "default" && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Currently Active on Website
                      </div>
                    )}
                  </div>
                </div>

                {/* Component Consistency & System Alignment Card */}
                <div className="rounded-xl border border-border bg-background-50/60 p-5 dark:border-gray-700 dark:bg-gray-900/40">
                  <h4 className="text-sm font-semibold text-text-primary dark:text-white">
                    Theme Application Across Website Elements
                  </h4>
                  <p className="mt-1 text-xs text-text-muted dark:text-gray-400">
                    When saved, the active theme automatically cascades into the following website components without requiring code rebuilds:
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                    <div className="rounded-lg border border-border/80 bg-surface p-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="font-semibold text-text-primary dark:text-white">Layouts & Shell</span>
                      <p className="text-[11px] text-text-muted dark:text-gray-400 mt-0.5">Atmosphere background, root canvases, footer</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface p-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="font-semibold text-text-primary dark:text-white">Navigation</span>
                      <p className="text-[11px] text-text-muted dark:text-gray-400 mt-0.5">Navbar header, menus, mobile drawer, links</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface p-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="font-semibold text-text-primary dark:text-white">Forms & Controls</span>
                      <p className="text-[11px] text-text-muted dark:text-gray-400 mt-0.5">Inputs, selects, textareas, search bars, focus rings</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface p-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="font-semibold text-text-primary dark:text-white">Cards & Modals</span>
                      <p className="text-[11px] text-text-muted dark:text-gray-400 mt-0.5">Investment cards, dialogs, badges, data tables</p>
                    </div>
                  </div>
                </div>

                {/* Save Action Bar */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border pt-5 dark:border-gray-700">
                  <div className="text-xs text-text-muted dark:text-gray-400">
                    Selected: <strong className="text-text-primary dark:text-gray-200">{selectedTheme === "default" ? "Default (Light)" : selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}</strong>
                    {selectedTheme !== activeSavedTheme && (
                      <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Unsaved Changes
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedTheme !== activeSavedTheme && (
                      <button
                        type="button"
                        onClick={() => setSelectedTheme(activeSavedTheme)}
                        className="flex-1 sm:flex-initial rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-muted hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveTheme(selectedTheme)}
                      disabled={savingTheme}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
                    >
                      {savingTheme ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving Theme...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Apply & Save Theme
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
