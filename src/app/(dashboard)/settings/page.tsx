"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Globe,
  Mail,
  Share2,
  Bell,
  Building2,
  Upload,
  X,
  Loader2,
  Save,
  Image as ImageIcon,
  Eye,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import { systemSettingService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { SystemSettings } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

export default function SettingsPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingService.getAll();
      setSettings(data);
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof SystemSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === "logo" ? 2 * 1024 * 1024 : 1024 * 1024;
    if (file.size > maxSize) {
      toast(`File too large. Max ${type === "logo" ? "2MB" : "1MB"}`, "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setFaviconFile(file);
        setFaviconPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: "logo" | "favicon") => {
    if (type === "logo") {
      setLogoFile(null);
      setLogoPreview(null);
      setSettings((prev) => ({ ...prev, site_logo: undefined }));
      if (logoInputRef.current) logoInputRef.current.value = "";
    } else {
      setFaviconFile(null);
      setFaviconPreview(null);
      setSettings((prev) => ({ ...prev, site_favicon: undefined }));
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (logoFile) formData.append("site_logo", logoFile);
      if (faviconFile) formData.append("site_favicon", faviconFile);

      await systemSettingService.update(formData);
      toast("Settings updated successfully", "success");
      setLogoFile(null);
      setFaviconFile(null);
      setLogoPreview(null);
      setFaviconPreview(null);
      await loadSettings();
    } catch {
      toast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const getLogoUrl = () => {
    if (logoPreview) return logoPreview;
    if (settings.site_logo) return `${IMAGE_URL}/${settings.site_logo}`;
    return null;
  };

  const getFaviconUrl = () => {
    if (faviconPreview) return faviconPreview;
    if (settings.site_favicon) return `${IMAGE_URL}/${settings.site_favicon}`;
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="Setting Index">
      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            System Settings
          </h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Manage your system configuration
          </p>
        </div>
        </div>

        {/* Site Identity */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Globe className="h-5 w-5 text-primary" />
            Site Identity
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Site Name */}
            <div className="lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name || ""}
                onChange={(e) => handleChange("site_name", e.target.value)}
                placeholder="Enter site name"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Site Logo
              </label>
              <div
                className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary dark:border-gray-700"
                onClick={() => logoInputRef.current?.click()}
              >
                {getLogoUrl() ? (
                  <div className="relative p-2">
                    <img
                      src={getLogoUrl()!}
                      alt="Logo"
                      className="max-h-20 max-w-[200px] object-contain"
                    />
                    {hasPermission("Setting Update") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile("logo");
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-text-muted dark:text-gray-500" />
                    <span className="text-xs text-text-muted dark:text-gray-500">
                      Click to upload logo
                    </span>
                    <span className="text-[10px] text-text-muted dark:text-gray-600">
                      JPEG, PNG, JPG, GIF (max 2MB)
                    </span>
                  </>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={(e) => handleFileChange(e, "logo")}
                  className="hidden"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Favicon
              </label>
              <div
                className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary dark:border-gray-700"
                onClick={() => faviconInputRef.current?.click()}
              >
                {getFaviconUrl() ? (
                  <div className="relative p-2">
                    <img
                      src={getFaviconUrl()!}
                      alt="Favicon"
                      className="max-h-16 max-w-16 object-contain"
                    />
                    {hasPermission("Setting Update") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile("favicon");
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mb-2 h-8 w-8 text-text-muted dark:text-gray-500" />
                    <span className="text-xs text-text-muted dark:text-gray-500">
                      Click to upload favicon
                    </span>
                    <span className="text-[10px] text-text-muted dark:text-gray-600">
                      ICO, PNG (max 1MB)
                    </span>
                  </>
                )}
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={(e) => handleFileChange(e, "favicon")}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Phone className="h-5 w-5 text-primary" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Official Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="email"
                  value={settings.official_email || ""}
                  onChange={(e) => handleChange("official_email", e.target.value)}
                  placeholder="info@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="text"
                  value={settings.mobile_number || ""}
                  onChange={(e) => handleChange("mobile_number", e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="text"
                  value={settings.whatsapp_number || ""}
                  onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Company Registration Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Company Registration No.
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="text"
                  value={settings.company_registration_number || ""}
                  onChange={(e) =>
                    handleChange("company_registration_number", e.target.value)
                  }
                  placeholder="Registration number"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Office Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Office Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-text-muted dark:text-gray-500" />
                <textarea
                  value={settings.office_address || ""}
                  onChange={(e) => handleChange("office_address", e.target.value)}
                  placeholder="Enter office address"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Head Office Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Head Office Address
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-text-muted dark:text-gray-500" />
                <textarea
                  value={settings.head_office_address || ""}
                  onChange={(e) =>
                    handleChange("head_office_address", e.target.value)
                  }
                  placeholder="Enter head office address"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Share2 className="h-5 w-5 text-primary" />
            Social Media
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Digital Presence */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Website / Digital Presence
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="url"
                  value={settings.digital_presence || ""}
                  onChange={(e) => handleChange("digital_presence", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.facebook_url || ""}
                onChange={(e) => handleChange("facebook_url", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram_url || ""}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                YouTube URL
              </label>
              <input
                type="url"
                value={settings.youtube_url || ""}
                onChange={(e) => handleChange("youtube_url", e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={settings.twitter_url || ""}
                onChange={(e) => handleChange("twitter_url", e.target.value)}
                placeholder="https://x.com/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={settings.linkedin_url || ""}
                onChange={(e) => handleChange("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-white">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Contact Notification Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Contact Notification Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="email"
                  value={settings.contact_notification_email || ""}
                  onChange={(e) =>
                    handleChange("contact_notification_email", e.target.value)
                  }
                  placeholder="notifications@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Career Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-300">
                Career Notification Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="email"
                  value={settings.career_mail || ""}
                  onChange={(e) => handleChange("career_mail", e.target.value)}
                  placeholder="careers@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Enable Contact Notification Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-white">
                  Contact Form Notifications
                </p>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  Receive email when someone submits contact form
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "enable_contact_notification",
                    settings.enable_contact_notification === "1" ? "0" : "1"
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enable_contact_notification === "1"
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enable_contact_notification === "1"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Enable Job Alert Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-white">
                  Job Alert Notifications
                </p>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  Receive email for new job applications
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "enable_job_alert_notification",
                    settings.enable_job_alert_notification === "1" ? "0" : "1"
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enable_job_alert_notification === "1"
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enable_job_alert_notification === "1"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Sticky Bottom Save Bar */}
      {hasPermission("Setting Update") && (
        <div className="sticky bottom-0 z-40 -mx-6 -mb-6 mt-6 border-t border-border bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={loadSettings}
              disabled={saving}
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Reset
            </button>
            <button
              type="submit"
              form="settings-form"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
