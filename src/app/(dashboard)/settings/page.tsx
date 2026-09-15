"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Loader2, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

function SettingsContent() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{ key: string; value: string }[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      const data = response.data.data;
      const items = Array.isArray(data) ? data : [];
      setSettings(items);
      const values: Record<string, string> = {};
      items.forEach((s: { key: string; value: string }) => { values[s.key] = s.value; });
      setEditedValues(values);
    } catch {
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post("/settings", { settings: editedValues });
      toast("Settings saved successfully", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Settings</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">System configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
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
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary dark:text-white">System Settings</h2>
              <p className="text-xs text-text-muted dark:text-gray-400">Configure system parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            {settings.length === 0 ? (
              <p className="text-sm text-text-muted dark:text-gray-400">No settings found</p>
            ) : (
              settings.map((setting) => (
                <div key={setting.key} className="flex items-center gap-4">
                  <label className="w-48 shrink-0 text-sm font-medium text-text-primary dark:text-gray-300">
                    {setting.key}
                  </label>
                  <input
                    type="text"
                    value={editedValues[setting.key] || ""}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-border pt-4 dark:border-gray-700">
            <p className="text-xs text-text-muted dark:text-gray-500">
              Logged in as: {user?.name} ({user?.email})
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
