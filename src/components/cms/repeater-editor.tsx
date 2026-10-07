"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Layers,
  X,
  Check,
  Eye,
} from "lucide-react";

export interface RepeaterFieldSchema {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "number" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: string;
}

interface CmsRepeaterEditorProps {
  value: string; // JSON string representing array of items
  onChange: (newValue: string) => void;
  label: string;
  schema?: RepeaterFieldSchema[];
  itemTitleField?: string;
  itemSubtitleField?: string;
}

export function CmsRepeaterEditor({
  value,
  onChange,
  label,
  schema = [],
  itemTitleField = "title",
  itemSubtitleField = "description",
}: CmsRepeaterEditorProps) {
  // Parse items safely
  const parseItems = (): Record<string, any>[] => {
    try {
      if (!value || typeof value !== "string" || value.trim() === "") return [];
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const items = parseItems();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  const saveItems = (newItems: Record<string, any>[]) => {
    onChange(JSON.stringify(newItems, null, 2));
  };

  const handleAddNew = () => {
    const newItem: Record<string, any> = {};
    if (schema.length > 0) {
      schema.forEach((f) => {
        newItem[f.key] = f.defaultValue ?? "";
      });
    } else {
      newItem.title = "New Item";
      newItem.description = "";
    }
    setEditForm(newItem);
    setEditingIndex(items.length); // Next index
  };

  const handleEdit = (index: number) => {
    setEditForm({ ...items[index] });
    setEditingIndex(index);
  };

  const handleSaveModal = () => {
    if (editingIndex === null) return;
    const newItems = [...items];
    if (editingIndex >= items.length) {
      newItems.push(editForm);
    } else {
      newItems[editingIndex] = editForm;
    }
    saveItems(newItems);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    saveItems(newItems);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditForm({});
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    saveItems(newItems);
  };

  // Determine active schema fields: if schema provided, use it; otherwise infer from editForm
  const activeFields: RepeaterFieldSchema[] =
    schema.length > 0
      ? schema
      : Object.keys(editForm).map((k) => ({
          key: k,
          label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          type: k.includes("description") || k.includes("bio") || k.includes("quote") || k.includes("body") ? "textarea" : "text",
        }));

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-text-primary dark:text-white">
            {label} ({items.length} items)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded border border-border"
          >
            {showJsonRaw ? "Hide Raw JSON" : "Raw JSON"}
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>
      </div>

      {showJsonRaw ? (
        <textarea
          rows={8}
          value={value || "[]"}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs w-full rounded-lg border border-border bg-background p-3 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center text-text-muted text-xs dark:border-gray-700">
          No items defined yet. Click &quot;Add Item&quot; to create the first card in this section.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const title =
              item[itemTitleField] ||
              item.title ||
              item.name ||
              item.heading ||
              item.quote ||
              item.step ||
              `Item #${idx + 1}`;
            const subtitle =
              item[itemSubtitleField] ||
              item.subtitle ||
              item.role ||
              item.attribution ||
              item.district ||
              item.crop ||
              item.category ||
              item.description ||
              "";

            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm shadow-xs transition-colors hover:border-primary/40 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {idx + 1}
                  </span>
                  {item.image && typeof item.image === "string" && (
                    <img
                      src={item.image}
                      alt={title}
                      className="h-9 w-9 shrink-0 rounded object-cover border border-border"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary dark:text-white truncate">
                      {String(title)}
                    </p>
                    {subtitle && (
                      <p className="text-xs text-text-muted truncate">
                        {String(subtitle)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move up"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Edit card"
                    onClick={() => handleEdit(idx)}
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete card"
                    onClick={() => handleDelete(idx)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Edit Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-surface shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-gray-700">
              <h3 className="font-bold text-text-primary dark:text-white">
                {editingIndex >= items.length ? "Add New Item" : `Edit Item #${editingIndex + 1}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-text-primary dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={editForm[field.key] ?? ""}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [field.key]: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  ) : field.type === "select" && field.options ? (
                    <select
                      value={editForm[field.key] ?? ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [field.key]: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={editForm[field.key] ?? ""}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [field.key]: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4 dark:border-gray-700 bg-background/50">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-muted hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CmsRepeaterEditor;
