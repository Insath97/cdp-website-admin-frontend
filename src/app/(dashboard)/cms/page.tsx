"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Globe,
  Save,
  Plus,
  RefreshCw,
  Loader2,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Search,
} from "lucide-react";
import { cmsService, type CmsContentItem, type CmsContentType } from "@/services/cms.service";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  CMS_PAGES,
  CMS_DEFAULT_TEMPLATES,
  REPEATER_SCHEMAS,
} from "@/components/cms/cms-templates";
import { CmsRepeaterEditor } from "@/components/cms/repeater-editor";

function CMSContent() {
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<CmsContentItem[]>([]);
  const [fileMap, setFileMap] = useState<Record<number, File>>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    section: string;
    key: string;
    label: string;
    type: CmsContentType;
    value: string;
  }>({
    section: "general",
    key: "",
    label: "",
    type: "text",
    value: "",
  });

  const fetchPageContent = useCallback(
    async (page: string) => {
      try {
        setLoading(true);
        const data = await cmsService.getAll(page);
        const pageSections = data[page] || {};
        const flatList: CmsContentItem[] = [];

        Object.keys(pageSections).forEach((sec) => {
          const secItems = pageSections[sec];
          if (Array.isArray(secItems)) {
            secItems.forEach((it) => flatList.push(it));
          }
        });

        // If page has no content in DB, pre-populate default template if available
        if (flatList.length === 0 && CMS_DEFAULT_TEMPLATES[page]) {
          const templateItems = CMS_DEFAULT_TEMPLATES[page].map((t) => ({
            page,
            section: t.section,
            key: t.key,
            label: t.label,
            type: t.type,
            value: t.value,
          }));
          setItems(templateItems);
        } else {
          // If DB has some items, merge in any missing default fields from template
          if (CMS_DEFAULT_TEMPLATES[page]) {
            const existingKeys = new Set(
              flatList.map((i) => `${i.section}.${i.key}`)
            );
            const missingTemplateItems = CMS_DEFAULT_TEMPLATES[page]
              .filter((t) => !existingKeys.has(`${t.section}.${t.key}`))
              .map((t) => ({
                page,
                section: t.section,
                key: t.key,
                label: t.label,
                type: t.type,
                value: t.value,
              }));
            setItems([...flatList, ...missingTemplateItems]);
          } else {
            setItems(flatList);
          }
        }
        setFileMap({});
      } catch {
        toast("Failed to load CMS content", "error");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchPageContent(selectedPage);
  }, [selectedPage, fetchPageContent]);

  const handleFieldChange = (index: number, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleLabelChange = (index: number, label: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label };
      return updated;
    });
  };

  const handleFileUpload = (index: number, file: File) => {
    setFileMap((prev) => ({ ...prev, [index]: file }));
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: file.name };
      return updated;
    });
  };

  const handleSaveAll = async () => {
    if (!hasPermission("CMS Update")) {
      toast("You do not have permission to update CMS content", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = items.map((item) => {
        // If value is a JSON array/object, also populate metadata.items for backend compatibility
        let metadata = item.metadata || {};
        try {
          if (
            typeof item.value === "string" &&
            item.value.trim().startsWith("[") &&
            item.value.trim().endsWith("]")
          ) {
            metadata = { ...metadata, items: JSON.parse(item.value) };
          }
        } catch {
          // Keep raw string if parsing fails
        }

        return {
          page: item.page,
          section: item.section,
          key: item.key,
          value: item.value,
          type: item.type,
          label: item.label,
          metadata,
        };
      });

      await cmsService.updateBulk(payload, fileMap);
      toast("CMS contents updated successfully!", "success");
      fetchPageContent(selectedPage);
    } catch (err: any) {
      toast(
        err?.response?.data?.message || "Failed to save CMS contents",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewItem = () => {
    if (!newItem.key.trim() || !newItem.section.trim()) {
      toast("Section and Key are required", "error");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        page: selectedPage,
        section: newItem.section.trim().toLowerCase(),
        key: newItem.key.trim().toLowerCase().replace(/\s+/g, "_"),
        label: newItem.label.trim() || newItem.key.trim(),
        type: newItem.type,
        value: newItem.value,
      },
    ]);

    setNewItem({
      section: "general",
      key: "",
      label: "",
      type: "text",
      value: "",
    });
    setShowAddModal(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    const newFiles = { ...fileMap };
    delete newFiles[index];
    setFileMap(newFiles);
  };

  // Filter items by search
  const filteredItemsWithIndices = useMemo(() => {
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          item.section.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          (item.label && item.label.toLowerCase().includes(q)) ||
          (item.value && item.value.toLowerCase().includes(q))
        );
      });
  }, [items, searchFilter]);

  // Group items by section
  const sections = Array.from(
    new Set(filteredItemsWithIndices.map(({ item }) => item.section))
  );

  const getWebsiteUrl = (pageId: string) => {
    if (pageId === "home") return "http://localhost:5173/";
    if (pageId === "global") return "http://localhost:5173/";
    return `http://localhost:5173/${pageId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">
            Content Management (CMS)
          </h1>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Dynamically manage copy, banners, stats, and card collections across all 20 website pages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={getWebsiteUrl(selectedPage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-primary hover:bg-background-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
            View Live Page
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || loading || items.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-2 dark:border-gray-700 dark:bg-gray-800">
        {CMS_PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPage(p.id);
              setSearchFilter("");
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              selectedPage === p.id
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:bg-background-50 hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <Globe className="h-3 w-3" />
            {p.label}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Search fields in ${CMS_PAGES.find((p) => p.id === selectedPage)?.label}...`}
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="text-xs text-text-muted">
          Showing {filteredItemsWithIndices.length} of {items.length} fields
        </div>
      </div>

      {/* Editor Body */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredItemsWithIndices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center dark:border-gray-700">
          <Globe className="h-10 w-10 text-text-muted" />
          <h3 className="mt-3 text-base font-semibold text-text-primary dark:text-white">
            {searchFilter ? "No fields match your search" : "No content fields for this page"}
          </h3>
          <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
            {searchFilter
              ? "Try adjusting your search query or clear the filter."
              : `Click "Add Field" above to define dynamic keys and values for ${
                  CMS_PAGES.find((p) => p.id === selectedPage)?.label
                }.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sectionName) => {
            const sectionItems = filteredItemsWithIndices.filter(
              ({ item }) => item.section === sectionName
            );

            return (
              <div
                key={sectionName}
                className="overflow-hidden rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="border-b border-border bg-background-50/50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                        Section
                      </span>
                      <h3 className="text-sm font-bold capitalize text-text-primary dark:text-white">
                        {sectionName.replace(/_/g, " ")}
                      </h3>
                    </div>
                    <span className="text-xs text-text-muted">
                      {sectionItems.length} fields
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-border p-6 dark:divide-gray-700">
                  {sectionItems.map(({ item, originalIndex }) => {
                    const schemaKeyExact = `${selectedPage}.${item.section}.${item.key}`;
                    const schemaKeyShort = `${item.section}.${item.key}`;
                    const repeaterSchema =
                      REPEATER_SCHEMAS[schemaKeyExact] ||
                      REPEATER_SCHEMAS[schemaKeyShort];

                    const isJsonArray =
                      Boolean(repeaterSchema) ||
                      (typeof item.value === "string" &&
                        item.value.trim().startsWith("[") &&
                        item.value.trim().endsWith("]"));

                    return (
                      <div
                        key={`${item.section}_${item.key}`}
                        className="py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="w-full md:w-1/3">
                            <input
                              type="text"
                              value={item.label || item.key}
                              onChange={(e) =>
                                handleLabelChange(originalIndex, e.target.value)
                              }
                              placeholder="Display Label"
                              className="font-medium text-text-primary dark:text-white bg-transparent border-b border-dashed border-border hover:border-primary focus:border-primary focus:outline-none text-sm w-full"
                            />
                            <p className="mt-1 text-xs font-mono text-text-muted dark:text-gray-500">
                              key: {item.key}{" "}
                              <span className="uppercase text-[10px] ml-2 px-1.5 py-0.5 bg-background-100 rounded text-foreground-700">
                                type: {isJsonArray ? "repeater collection" : item.type}
                              </span>
                            </p>
                          </div>

                          <div className="flex-1">
                            {isJsonArray ? (
                              <CmsRepeaterEditor
                                label={item.label || item.key}
                                value={item.value || "[]"}
                                onChange={(val) =>
                                  handleFieldChange(originalIndex, val)
                                }
                                schema={repeaterSchema}
                              />
                            ) : item.type === "textarea" ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                  <span className="text-[11px] font-medium text-text-secondary mr-0.5">Quick Format:</span>
                                  <button
                                    type="button"
                                    title="Add Bold Text"
                                    onClick={() =>
                                      handleFieldChange(
                                        originalIndex,
                                        (item.value || "") + " **Bold Text**"
                                      )
                                    }
                                    className="px-2 py-0.5 rounded border border-border bg-surface hover:bg-background-100 text-xs font-bold"
                                  >
                                    B
                                  </button>
                                  <button
                                    type="button"
                                    title="Add Italic Text"
                                    onClick={() =>
                                      handleFieldChange(
                                        originalIndex,
                                        (item.value || "") + " *Italic Text*"
                                      )
                                    }
                                    className="px-2 py-0.5 rounded border border-border bg-surface hover:bg-background-100 text-xs italic font-serif"
                                  >
                                    I
                                  </button>
                                  <button
                                    type="button"
                                    title="Add Bullet Point"
                                    onClick={() =>
                                      handleFieldChange(
                                        originalIndex,
                                        (item.value ? item.value + "\n• " : "• ")
                                      )
                                    }
                                    className="px-2 py-0.5 rounded border border-border bg-surface hover:bg-background-100 text-xs"
                                  >
                                    • List
                                  </button>
                                  <button
                                    type="button"
                                    title="Add Link Markdown"
                                    onClick={() =>
                                      handleFieldChange(
                                        originalIndex,
                                        (item.value || "") + " [Link Title](https://example.com)"
                                      )
                                    }
                                    className="px-2 py-0.5 rounded border border-border bg-surface hover:bg-background-100 text-xs"
                                  >
                                    🔗 Link
                                  </button>
                                </div>
                                <textarea
                                  rows={4}
                                  value={item.value || ""}
                                  onChange={(e) =>
                                    handleFieldChange(originalIndex, e.target.value)
                                  }
                                  className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                              </div>
                            ) : item.type === "image" ||
                              item.type === "file" ||
                              item.type === "pdf" ? (
                              <div className="space-y-2">
                                {item.value && (
                                  <div className="flex items-center gap-3 rounded-lg border border-border p-2 dark:border-gray-700">
                                    {item.type === "image" &&
                                    item.value.startsWith("http") ? (
                                      <img
                                        src={item.value}
                                        alt="preview"
                                        className="h-10 w-10 shrink-0 rounded object-cover border border-border"
                                      />
                                    ) : (
                                      <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                    <span className="truncate text-xs text-text-primary dark:text-gray-300 flex-1">
                                      {item.value}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Or paste external image / file URL..."
                                    value={item.value || ""}
                                    onChange={(e) =>
                                      handleFieldChange(originalIndex, e.target.value)
                                    }
                                    className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                  />
                                  <label className="cursor-pointer shrink-0 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium">
                                    Upload File
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleFileUpload(
                                            originalIndex,
                                            e.target.files[0]
                                          );
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={item.value || ""}
                                onChange={(e) =>
                                  handleFieldChange(originalIndex, e.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(originalIndex)}
                            className="mt-1 text-text-muted hover:text-red-500"
                            title="Remove field"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Add Dynamic CMS Field
            </h3>
            <p className="mt-1 text-xs text-text-muted dark:text-gray-400">
              Create a new editable content key for page <strong>{selectedPage}</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-text-muted">
                  Section Name (e.g. hero, stats, values, testimonials)
                </label>
                <input
                  type="text"
                  value={newItem.section}
                  onChange={(e) =>
                    setNewItem({ ...newItem, section: e.target.value })
                  }
                  placeholder="hero"
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Key Identifier (e.g. title, subtitle, items)
                </label>
                <input
                  type="text"
                  value={newItem.key}
                  onChange={(e) =>
                    setNewItem({ ...newItem, key: e.target.value })
                  }
                  placeholder="title"
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Human Label
                </label>
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) =>
                    setNewItem({ ...newItem, label: e.target.value })
                  }
                  placeholder="Section Main Title"
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Field Type
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      type: e.target.value as CmsContentType,
                    })
                  }
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text / Paragraph / Repeater JSON</option>
                  <option value="image">Image Upload / URL</option>
                  <option value="video">Video URL / File</option>
                  <option value="pdf">PDF Document</option>
                  <option value="link">Hyperlink</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">
                  Initial Value
                </label>
                <input
                  type="text"
                  value={newItem.value}
                  onChange={(e) =>
                    setNewItem({ ...newItem, value: e.target.value })
                  }
                  placeholder="Initial text content or [] for lists"
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted hover:bg-background-50 dark:border-gray-700 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewItem}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CMSPage() {
  return (
    <PermissionGuard permission="CMS Index">
      <CMSContent />
    </PermissionGuard>
  );
}
