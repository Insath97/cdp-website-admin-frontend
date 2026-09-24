"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, ChevronDown, Loader2 } from "lucide-react";

interface Tag {
  id: number;
  name: string;
}

interface TagSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: Tag[];
  loading?: boolean;
  placeholder?: string;
  error?: string;
}

export function TagSelect({
  value,
  onChange,
  availableTags,
  loading = false,
  placeholder = "Search tags...",
  error,
}: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(tag.name)
  );

  const exactMatch = availableTags.some(
    (tag) => tag.name.toLowerCase() === search.toLowerCase()
  );

  const handleSelect = (tagName: string) => {
    if (!value.includes(tagName)) {
      onChange([...value, tagName]);
    }
    setSearch("");
    inputRef.current?.focus();
  };

  const handleRemove = (tagName: string) => {
    onChange(value.filter((t) => t !== tagName));
  };

  const handleCreateNew = () => {
    const trimmed = search.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleSelect(filteredTags[0].name);
      } else if (search.trim() && !exactMatch) {
        handleCreateNew();
      }
    } else if (e.key === "Backspace" && !search && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex max-w-[150px] items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="shrink-0 rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm focus-within:border-primary dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-primary ${
          error ? "border-red-500" : ""
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-text-muted dark:text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted dark:text-white dark:placeholder:text-gray-500"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform dark:text-gray-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-60 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelect(tag.name)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="truncate text-text-primary dark:text-white">
                    {tag.name}
                  </span>
                </button>
              ))
            ) : search.trim() && !exactMatch ? (
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-primary hover:bg-primary/5 dark:text-primary dark:hover:bg-primary/10"
              >
                Create &quot;{search.trim()}&quot;
              </button>
            ) : (
              <div className="px-3 py-2.5 text-sm text-text-muted dark:text-gray-500">
                No tags found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
