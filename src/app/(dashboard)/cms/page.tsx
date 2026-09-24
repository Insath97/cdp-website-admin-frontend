"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings,
  Home,
  Info,
  Phone,
  Loader2,
  Save,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Link as LinkIcon,
  Video,
  FileText,
} from "lucide-react";
import { cmsService } from "@/services";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { CmsPageContent, CmsUpdateItem } from "@/types";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

const PAGES = [
  { key: "home", label: "Home", icon: Home },
  { key: "about", label: "About", icon: Info },
  { key: "contact", label: "Contact", icon: Phone },
];

const HOME_SECTIONS: Record<string, { label: string; fields: string[] }> = {
  hero: { label: "Hero Carousel", fields: ["slides"] },
  visionMission: { label: "Vision & Mission", fields: ["visionHeading", "visionDescription", "missionHeading", "missionDescription", "visionImage", "missionImage", "badgeHeading", "badgeDescription", "cardIcon"] },
  specialReport: { label: "Special Report / Impact", fields: ["badge", "heading", "description", "ctaText", "ctaLink", "image"] },
  strategicFocus: { label: "Strategic Focus / Our Commitment", fields: ["heading", "description", "cards"] },
  statistics: { label: "Statistics", fields: ["items"] },
  investmentPlans: { label: "Investment Plans", fields: ["heading", "highlightText", "description", "ctaText", "ctaLink", "plans"] },
  solutions: { label: "Solutions", fields: ["heading", "description", "ctaText", "ctaLink", "cards"] },
  careers: { label: "Careers Teaser", fields: ["heading", "subtitle", "viewAllLink"] },
  latestNews: { label: "Latest News", fields: ["heading", "description", "featuredBadge", "insightsLabel", "viewAllText", "viewAllLink"] },
};

function ImageField({
  label,
  value,
  page,
  section,
  fieldKey,
  onChange,
}: {
  label: string;
  value: string;
  page: string;
  section: string;
  fieldKey: string;
  onChange: (val: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useState<React.RefObject<HTMLInputElement | null>>({ current: null })[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const remove = () => {
    setFile(null);
    setPreview(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = preview || (value ? `${IMAGE_URL}/${value}` : null);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">
        {label}
      </label>
      <div
        className="relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary dark:border-gray-700"
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <div className="relative p-2">
            <img src={displayUrl} alt={label} className="max-h-24 max-w-[200px] object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(); }}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-1 h-6 w-6 text-text-muted dark:text-gray-500" />
            <span className="text-xs text-text-muted dark:text-gray-500">Click to upload</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) {
  if (type === "textarea") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">
          {label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </div>
  );
}

function ArrayField({
  label,
  items,
  itemFields,
  onAdd,
  onRemove,
  onChange,
  page,
  section,
  arrayKey,
}: {
  label: string;
  items: Record<string, string>[];
  itemFields: { key: string; label: string; type: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
  page: string;
  section: string;
  arrayKey: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-3 w-3" /> Add {label}
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted dark:text-gray-400">
                {label} #{idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {itemFields.map((field) =>
                field.type === "image" ? (
                  <ImageField
                    key={field.key}
                    label={field.label}
                    value={item[field.key] || ""}
                    page={page}
                    section={section}
                    fieldKey={`${arrayKey}.${idx}.${field.key}`}
                    onChange={(val) => onChange(idx, field.key, val)}
                  />
                ) : (
                  <TextField
                    key={field.key}
                    label={field.label}
                    value={item[field.key] || ""}
                    onChange={(val) => onChange(idx, field.key, val)}
                    type={field.type === "textarea" ? "textarea" : "text"}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection({
  data,
  page,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  onChange: (key: string, value: string) => void;
}) {
  const [slideCount, setSlideCount] = useState(() => {
    let count = 0;
    while (data[`slides.${count}.title`] !== undefined) count++;
    return count > 0 ? count : 1;
  });

  const slides = Array.from({ length: slideCount }, (_, idx) => ({
    title: data[`slides.${idx}.title`]?.value || "",
    highlightText: data[`slides.${idx}.highlightText`]?.value || "",
    subtitle: data[`slides.${idx}.subtitle`]?.value || "",
    backgroundImage: data[`slides.${idx}.backgroundImage`]?.value || "",
    ctaText: data[`slides.${idx}.ctaText`]?.value || "",
    cta2Text: data[`slides.${idx}.cta2Text`]?.value || "",
    ctaLink: data[`slides.${idx}.ctaLink`]?.value || "",
    cta2Link: data[`slides.${idx}.cta2Link`]?.value || "",
  }));

  const handleSlideChange = (index: number, field: string, value: string) => {
    onChange(`slides.${index}.${field}`, value);
  };

  const addSlide = () => {
    setSlideCount((prev) => prev + 1);
  };

  const removeSlide = (index: number) => {
    for (let i = index; i < slideCount - 1; i++) {
      onChange(`slides.${i}.title`, slides[i + 1]?.title || "");
      onChange(`slides.${i}.highlightText`, slides[i + 1]?.highlightText || "");
      onChange(`slides.${i}.subtitle`, slides[i + 1]?.subtitle || "");
      onChange(`slides.${i}.backgroundImage`, slides[i + 1]?.backgroundImage || "");
      onChange(`slides.${i}.ctaText`, slides[i + 1]?.ctaText || "");
      onChange(`slides.${i}.cta2Text`, slides[i + 1]?.cta2Text || "");
      onChange(`slides.${i}.ctaLink`, slides[i + 1]?.ctaLink || "");
      onChange(`slides.${i}.cta2Link`, slides[i + 1]?.cta2Link || "");
    }
    const lastIdx = slideCount - 1;
    onChange(`slides.${lastIdx}.title`, "__DELETE__");
    onChange(`slides.${lastIdx}.highlightText`, "__DELETE__");
    onChange(`slides.${lastIdx}.subtitle`, "__DELETE__");
    onChange(`slides.${lastIdx}.backgroundImage`, "__DELETE__");
    onChange(`slides.${lastIdx}.ctaText`, "__DELETE__");
    onChange(`slides.${lastIdx}.cta2Text`, "__DELETE__");
    onChange(`slides.${lastIdx}.ctaLink`, "__DELETE__");
    onChange(`slides.${lastIdx}.cta2Link`, "__DELETE__");
    setSlideCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <TextField
        label="Top Badge Text (same for all slides)"
        value={data["badge"]?.value || ""}
        onChange={(v) => onChange("badge", v)}
        placeholder="e.g. Ceylon Development Plantation"
      />

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">
          Carousel Slides ({slides.length})
        </h4>
        <button
          type="button"
          onClick={addSlide}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-3 w-3" /> Add Slide
        </button>
      </div>

      {slides.map((slide, idx) => (
        <div
          key={idx}
          className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted dark:text-gray-400">
              Slide #{idx + 1}
            </span>
            {slides.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlide(idx)}
                className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <TextField
              label="Title"
              value={slide.title}
              onChange={(v) => handleSlideChange(idx, "title", v)}
              placeholder="e.g. Empowering Sri Lanka's Agricultural Sector"
            />
            <TextField
              label="Highlight Text (Green)"
              value={slide.highlightText}
              onChange={(v) => handleSlideChange(idx, "highlightText", v)}
              placeholder="e.g. Agricultural Sector — words to highlight in green"
            />
            <TextField
              label="Subtitle"
              value={slide.subtitle}
              onChange={(v) => handleSlideChange(idx, "subtitle", v)}
              placeholder="Brief description of this slide"
            />
            <ImageField
              label="Background Image"
              value={slide.backgroundImage}
              page={page}
              section={`hero`}
              fieldKey={`slides.${idx}.backgroundImage`}
              onChange={(v) => handleSlideChange(idx, "backgroundImage", v)}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Primary CTA Text"
                value={slide.ctaText}
                onChange={(v) => handleSlideChange(idx, "ctaText", v)}
                placeholder="e.g. Book Free Consultation"
              />
              <TextField
                label="Primary CTA Link"
                value={slide.ctaLink}
                onChange={(v) => handleSlideChange(idx, "ctaLink", v)}
                placeholder="e.g. /contact"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Secondary CTA Text"
                value={slide.cta2Text}
                onChange={(v) => handleSlideChange(idx, "cta2Text", v)}
                placeholder="e.g. Our Services"
              />
              <TextField
                label="Secondary CTA Link"
                value={slide.cta2Link}
                onChange={(v) => handleSlideChange(idx, "cta2Link", v)}
                placeholder="e.g. /services"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VisionMissionSection({
  data,
  page,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  onChange: (key: string, value: string) => void;
}) {
  const getVal = (key: string) => data[key]?.value || "";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">Badge Card (Overlay on Vision Image)</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="Badge Heading" value={getVal("badgeHeading")} onChange={(v) => onChange("badgeHeading", v)} placeholder="e.g. Prosperity through Farming" />
          <TextField label="Card Icon" value={getVal("cardIcon")} onChange={(v) => onChange("cardIcon", v)} placeholder="e.g. sprout, leaf, trendingup" />
        </div>
        <TextField label="Badge Description" value={getVal("badgeDescription")} onChange={(v) => onChange("badgeDescription", v)} type="textarea" placeholder="e.g. Working together to build a sustainable future for Sri Lanka." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary dark:text-white">Vision</h4>
          <TextField label="Vision Heading" value={getVal("visionHeading")} onChange={(v) => onChange("visionHeading", v)} />
          <TextField label="Vision Description" value={getVal("visionDescription")} onChange={(v) => onChange("visionDescription", v)} type="textarea" />
          <ImageField label="Vision Image" value={getVal("visionImage")} page={page} section="visionMission" fieldKey="visionImage" onChange={(v) => onChange("visionImage", v)} />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary dark:text-white">Mission</h4>
          <TextField label="Mission Heading" value={getVal("missionHeading")} onChange={(v) => onChange("missionHeading", v)} />
          <TextField label="Mission Description" value={getVal("missionDescription")} onChange={(v) => onChange("missionDescription", v)} type="textarea" />
          <ImageField label="Mission Image" value={getVal("missionImage")} page={page} section="visionMission" fieldKey="missionImage" onChange={(v) => onChange("missionImage", v)} />
        </div>
      </div>
    </div>
  );
}

function StrategicFocusSection({
  data,
  page,
  section,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  section: string;
  onChange: (key: string, value: string) => void;
}) {
  const getVal = (key: string) => data[key]?.value || "";
  const [cardCount, setCardCount] = useState(() => {
    let count = 0;
    while (data[`cards.${count}.title`] !== undefined) count++;
    return count > 0 ? count : 1;
  });

  const cards = Array.from({ length: cardCount }, (_, idx) => ({
    title: data[`cards.${idx}.title`]?.value || "",
    icon: data[`cards.${idx}.icon`]?.value || "",
    description: data[`cards.${idx}.description`]?.value || "",
  }));

  const handleCardChange = (index: number, field: string, value: string) => {
    onChange(`cards.${index}.${field}`, value);
  };

  const addCard = () => setCardCount((prev) => prev + 1);

  const removeCard = (index: number) => {
    for (let i = index; i < cardCount - 1; i++) {
      onChange(`cards.${i}.title`, cards[i + 1]?.title || "");
      onChange(`cards.${i}.icon`, cards[i + 1]?.icon || "");
      onChange(`cards.${i}.description`, cards[i + 1]?.description || "");
    }
    const lastIdx = cardCount - 1;
    onChange(`cards.${lastIdx}.title`, "__DELETE__");
    onChange(`cards.${lastIdx}.icon`, "__DELETE__");
    onChange(`cards.${lastIdx}.description`, "__DELETE__");
    setCardCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Heading" value={getVal("heading")} onChange={(v) => onChange("heading", v)} />
        <TextField label="Description" value={getVal("description")} onChange={(v) => onChange("description", v)} type="textarea" />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">Commitment Cards ({cards.length})</h4>
        <button type="button" onClick={addCard} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
          <Plus className="h-3 w-3" /> Add Card
        </button>
      </div>

      {cards.map((card, idx) => (
        <div key={idx} className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted dark:text-gray-400">Card #{idx + 1}</span>
            {cards.length > 1 && (
              <button type="button" onClick={() => removeCard(idx)} className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Title" value={card.title} onChange={(v) => handleCardChange(idx, "title", v)} placeholder="e.g. Modern Technology" />
            <TextField label="Icon (Lucide)" value={card.icon} onChange={(v) => handleCardChange(idx, "icon", v)} placeholder="e.g. tractor, leaf, shield, users" />
          </div>
          <div className="mt-3">
            <TextField label="Description" value={card.description} onChange={(v) => handleCardChange(idx, "description", v)} type="textarea" placeholder="Card description text" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatisticsSection({
  data,
  page,
  section,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  section: string;
  onChange: (key: string, value: string) => void;
}) {
  const [itemCount, setItemCount] = useState(() => {
    let count = 0;
    while (data[`items.${count}.number`] !== undefined) count++;
    return count > 0 ? count : 3;
  });

  const items = Array.from({ length: itemCount }, (_, idx) => ({
    icon: data[`items.${idx}.icon`]?.value || "",
    number: data[`items.${idx}.number`]?.value || "",
    suffix: data[`items.${idx}.suffix`]?.value || "",
    label: data[`items.${idx}.label`]?.value || "",
  }));

  const handleItemChange = (index: number, field: string, value: string) => {
    onChange(`items.${index}.${field}`, value);
  };

  const addItem = () => setItemCount((prev) => prev + 1);

  const removeItem = (index: number) => {
    for (let i = index; i < itemCount - 1; i++) {
      onChange(`items.${i}.icon`, items[i + 1]?.icon || "");
      onChange(`items.${i}.number`, items[i + 1]?.number || "");
      onChange(`items.${i}.suffix`, items[i + 1]?.suffix || "");
      onChange(`items.${i}.label`, items[i + 1]?.label || "");
    }
    const lastIdx = itemCount - 1;
    onChange(`items.${lastIdx}.icon`, "__DELETE__");
    onChange(`items.${lastIdx}.number`, "__DELETE__");
    onChange(`items.${lastIdx}.suffix`, "__DELETE__");
    onChange(`items.${lastIdx}.label`, "__DELETE__");
    setItemCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">Statistic Items ({items.length})</h4>
        <button type="button" onClick={addItem} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
          <Plus className="h-3 w-3" /> Add Statistic
        </button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted dark:text-gray-400">Statistic #{idx + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField label="Icon (Lucide)" value={item.icon} onChange={(v) => handleItemChange(idx, "icon", v)} placeholder="e.g. trees, users, sprout" />
            <TextField label="Number" value={item.number} onChange={(v) => handleItemChange(idx, "number", v)} placeholder="e.g. 1200" />
            <TextField label="Suffix" value={item.suffix} onChange={(v) => handleItemChange(idx, "suffix", v)} placeholder="e.g. +, %" />
          </div>
          <div className="mt-3">
            <TextField label="Label" value={item.label} onChange={(v) => handleItemChange(idx, "label", v)} placeholder="e.g. Acres Managed" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InvestmentPlansSection({
  data,
  page,
  section,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  section: string;
  onChange: (key: string, value: string) => void;
}) {
  const getVal = (key: string) => data[key]?.value || "";
  const [planCount, setPlanCount] = useState(() => {
    let count = 0;
    while (data[`plans.${count}.name`] !== undefined) count++;
    return count > 0 ? count : 1;
  });

  const plans = Array.from({ length: planCount }, (_, idx) => ({
    name: data[`plans.${idx}.name`]?.value || "",
    duration: data[`plans.${idx}.duration`]?.value || "",
    description: data[`plans.${idx}.description`]?.value || "",
    icon: data[`plans.${idx}.icon`]?.value || "",
    color: data[`plans.${idx}.color`]?.value || "",
  }));

  const handlePlanChange = (index: number, field: string, value: string) => {
    onChange(`plans.${index}.${field}`, value);
  };

  const addPlan = () => setPlanCount((prev) => prev + 1);

  const removePlan = (index: number) => {
    for (let i = index; i < planCount - 1; i++) {
      onChange(`plans.${i}.name`, plans[i + 1]?.name || "");
      onChange(`plans.${i}.duration`, plans[i + 1]?.duration || "");
      onChange(`plans.${i}.description`, plans[i + 1]?.description || "");
      onChange(`plans.${i}.icon`, plans[i + 1]?.icon || "");
      onChange(`plans.${i}.color`, plans[i + 1]?.color || "");
    }
    const lastIdx = planCount - 1;
    onChange(`plans.${lastIdx}.name`, "__DELETE__");
    onChange(`plans.${lastIdx}.duration`, "__DELETE__");
    onChange(`plans.${lastIdx}.description`, "__DELETE__");
    onChange(`plans.${lastIdx}.icon`, "__DELETE__");
    onChange(`plans.${lastIdx}.color`, "__DELETE__");
    setPlanCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Heading" value={getVal("heading")} onChange={(v) => onChange("heading", v)} />
        <TextField label="Highlight Text" value={getVal("highlightText")} onChange={(v) => onChange("highlightText", v)} placeholder="e.g. 03 Exclusive Plans" />
      </div>
      <TextField label="Description" value={getVal("description")} onChange={(v) => onChange("description", v)} type="textarea" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="CTA Text" value={getVal("ctaText")} onChange={(v) => onChange("ctaText", v)} placeholder="e.g. Explore Detailed Plans" />
        <TextField label="CTA Link" value={getVal("ctaLink")} onChange={(v) => onChange("ctaLink", v)} placeholder="e.g. /plans" />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">Plan Cards ({plans.length})</h4>
        <button type="button" onClick={addPlan} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
          <Plus className="h-3 w-3" /> Add Plan
        </button>
      </div>

      {plans.map((plan, idx) => (
        <div key={idx} className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted dark:text-gray-400">Plan #{idx + 1}</span>
            {plans.length > 1 && (
              <button type="button" onClick={() => removePlan(idx)} className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Name" value={plan.name} onChange={(v) => handlePlanChange(idx, "name", v)} placeholder="e.g. Short-Term Yield Plan" />
            <TextField label="Duration" value={plan.duration} onChange={(v) => handlePlanChange(idx, "duration", v)} placeholder="e.g. 03 Years" />
          </div>
          <div className="mt-3">
            <TextField label="Description" value={plan.description} onChange={(v) => handlePlanChange(idx, "description", v)} type="textarea" placeholder="Plan description" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Icon (Lucide)" value={plan.icon} onChange={(v) => handlePlanChange(idx, "icon", v)} placeholder="e.g. sprout, trendingup, shield" />
            <TextField label="Color Class" value={plan.color} onChange={(v) => handlePlanChange(idx, "color", v)} placeholder="e.g. text-green-400" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SolutionsSection({
  data,
  page,
  section,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  page: string;
  section: string;
  onChange: (key: string, value: string) => void;
}) {
  const getVal = (key: string) => data[key]?.value || "";
  const [cardCount, setCardCount] = useState(() => {
    let count = 0;
    while (data[`cards.${count}.title`] !== undefined) count++;
    return count > 0 ? count : 1;
  });

  const cards = Array.from({ length: cardCount }, (_, idx) => ({
    title: data[`cards.${idx}.title`]?.value || "",
    icon: data[`cards.${idx}.icon`]?.value || "",
    description: data[`cards.${idx}.description`]?.value || "",
  }));

  const handleCardChange = (index: number, field: string, value: string) => {
    onChange(`cards.${index}.${field}`, value);
  };

  const addCard = () => setCardCount((prev) => prev + 1);

  const removeCard = (index: number) => {
    for (let i = index; i < cardCount - 1; i++) {
      onChange(`cards.${i}.title`, cards[i + 1]?.title || "");
      onChange(`cards.${i}.icon`, cards[i + 1]?.icon || "");
      onChange(`cards.${i}.description`, cards[i + 1]?.description || "");
    }
    const lastIdx = cardCount - 1;
    onChange(`cards.${lastIdx}.title`, "__DELETE__");
    onChange(`cards.${lastIdx}.icon`, "__DELETE__");
    onChange(`cards.${lastIdx}.description`, "__DELETE__");
    setCardCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Heading" value={getVal("heading")} onChange={(v) => onChange("heading", v)} />
        <TextField label="Description" value={getVal("description")} onChange={(v) => onChange("description", v)} type="textarea" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="CTA Text" value={getVal("ctaText")} onChange={(v) => onChange("ctaText", v)} placeholder="e.g. Explore All Services" />
        <TextField label="CTA Link" value={getVal("ctaLink")} onChange={(v) => onChange("ctaLink", v)} placeholder="e.g. /services" />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary dark:text-white">Solution Cards ({cards.length})</h4>
        <button type="button" onClick={addCard} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
          <Plus className="h-3 w-3" /> Add Card
        </button>
      </div>

      {cards.map((card, idx) => (
        <div key={idx} className="relative rounded-lg border border-border bg-background p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted dark:text-gray-400">Card #{idx + 1}</span>
            {cards.length > 1 && (
              <button type="button" onClick={() => removeCard(idx)} className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField label="Title" value={card.title} onChange={(v) => handleCardChange(idx, "title", v)} placeholder="e.g. Agricultural Management" />
            <TextField label="Icon (Lucide)" value={card.icon} onChange={(v) => handleCardChange(idx, "icon", v)} placeholder="e.g. sprout, wallet, truck, landmark" />
          </div>
          <div className="mt-3">
            <TextField label="Description" value={card.description} onChange={(v) => handleCardChange(idx, "description", v)} type="textarea" placeholder="Card description" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleSection({
  data,
  fields,
  page,
  section,
  onChange,
}: {
  data: Record<string, { value: string | null; type: string }>;
  fields: string[];
  page: string;
  section: string;
  onChange: (key: string, value: string) => void;
}) {
  const getVal = (key: string) => data[key]?.value || "";
  const imageFields = ["image", "bgImage", "icon", "backgroundImage"];

  return (
    <div className="space-y-4">
      {fields.map((field) =>
        imageFields.includes(field) ? (
          <ImageField
            key={field}
            label={field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            value={getVal(field)}
            page={page}
            section={section}
            fieldKey={field}
            onChange={(v) => onChange(field, v)}
          />
        ) : (
          <TextField
            key={field}
            label={field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            value={getVal(field)}
            onChange={(v) => onChange(field, v)}
            type={field.toLowerCase().includes("description") || field.toLowerCase().includes("content") ? "textarea" : "text"}
          />
        )
      )}
    </div>
  );
}

export default function CmsPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activePage = searchParams.get("page") || "home";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<CmsPageContent>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPageContent(activePage);
  }, [activePage]);

  const loadPageContent = async (page: string) => {
    try {
      setLoading(true);
      const data = await cmsService.getPageContent(page);
      console.log("[CMS Admin] Loaded page data hero:", data.hero);
      setPageData(data);

      const sections: Record<string, boolean> = {};
      Object.keys(data).forEach((s) => (sections[s] = true));
      if (Object.keys(sections).length > 0) {
        const firstSection = Object.keys(sections)[0];
        Object.keys(sections).forEach((s) => (sections[s] = s === firstSection));
      }
      setOpenSections(sections);
    } catch {
      toast("Failed to load CMS content", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (section: string, key: string, value: string) => {
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...(prev[section]?.[key] || { type: "text", metadata: null }),
          value,
        },
      },
    }));
  };

  const buildUpdateItems = (): CmsUpdateItem[] => {
    const items: CmsUpdateItem[] = [];
    Object.entries(pageData).forEach(([section, keys]) => {
      Object.entries(keys).forEach(([key, data]) => {
        items.push({
          page: activePage,
          section,
          key,
          value: data.value,
          type: data.type,
        });
      });
    });
    return items;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const items = buildUpdateItems();
      console.log("[CMS Admin] Saving items:", items.filter(i => i.key === "badge" || i.key.startsWith("slides")));
      await cmsService.updateContent(items);
      toast("CMS content updated successfully", "success");
    } catch {
      toast("Failed to update CMS content", "error");
    } finally {
      setSaving(false);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "hero": return <Type className="h-4 w-4" />;
      case "visionMission": return <ImageIcon className="h-4 w-4" />;
      case "specialReport": return <FileText className="h-4 w-4" />;
      case "strategicFocus": return <Settings className="h-4 w-4" />;
      case "statistics": return <AlignLeft className="h-4 w-4" />;
      case "investmentPlans": return <LinkIcon className="h-4 w-4" />;
      case "solutions": return <Video className="h-4 w-4" />;
      case "careers": return <Phone className="h-4 w-4" />;
      case "latestNews": return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <PermissionGuard permission="CMS Index">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">CMS Management</h1>
            <p className="text-sm text-text-muted dark:text-gray-400">
              Manage website content for the {PAGES.find((p) => p.key === activePage)?.label.toLowerCase()} page
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted dark:text-gray-400">
            {activePage === "home" ? Object.keys(HOME_SECTIONS).length : 0} sections
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const updated: Record<string, boolean> = {};
                Object.keys(openSections).forEach((k) => (updated[k] = true));
                setOpenSections(updated);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Expand All
            </button>
            <button
              onClick={() => {
                const updated: Record<string, boolean> = {};
                Object.keys(openSections).forEach((k) => (updated[k] = false));
                setOpenSections(updated);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          /* Sections */
          <div className="space-y-4">
            {activePage === "home" && Object.entries(HOME_SECTIONS).map(([sectionKey, sectionDef]) => {
              const sectionData = pageData[sectionKey] || {};
              const isOpen = openSections[sectionKey] === true;

              return (
                <div key={sectionKey} className="rounded-xl border border-border bg-surface dark:border-gray-700 dark:bg-gray-800">
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getSectionIcon(sectionKey)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary dark:text-white">
                          {sectionDef.label}
                        </h3>
                        <p className="text-xs text-text-muted dark:text-gray-400">
                          {sectionKey} — {Object.keys(sectionData).length} fields
                        </p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-text-muted dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-text-muted dark:text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-5 pb-5 pt-4 dark:border-gray-700">
                      {sectionKey === "hero" ? (
                        <HeroSection
                          data={sectionData}
                          page={activePage}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : sectionKey === "visionMission" ? (
                        <VisionMissionSection
                          data={sectionData}
                          page={activePage}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : sectionKey === "strategicFocus" ? (
                        <StrategicFocusSection
                          data={sectionData}
                          page={activePage}
                          section={sectionKey}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : sectionKey === "statistics" ? (
                        <StatisticsSection
                          data={sectionData}
                          page={activePage}
                          section={sectionKey}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : sectionKey === "investmentPlans" ? (
                        <InvestmentPlansSection
                          data={sectionData}
                          page={activePage}
                          section={sectionKey}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : sectionKey === "solutions" ? (
                        <SolutionsSection
                          data={sectionData}
                          page={activePage}
                          section={sectionKey}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      ) : (
                        <SimpleSection
                          data={sectionData}
                          fields={sectionDef.fields.filter(f => !["cards", "items", "plans"].includes(f))}
                          page={activePage}
                          section={sectionKey}
                          onChange={(key, value) => handleFieldChange(sectionKey, key, value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {activePage === "about" && (
              <div className="rounded-xl border border-border bg-surface p-8 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-center">
                  <Info className="mx-auto mb-3 h-12 w-12 text-text-muted dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white">About Page</h3>
                  <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                    About page CMS sections will be configured here.
                  </p>
                </div>
              </div>
            )}

            {activePage === "contact" && (
              <div className="rounded-xl border border-border bg-surface p-8 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-center">
                  <Phone className="mx-auto mb-3 h-12 w-12 text-text-muted dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white">Contact Page</h3>
                  <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                    Contact page CMS sections will be configured here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticky Footer */}
        {hasPermission("CMS Update") && (
          <div className="sticky bottom-0 z-40 -mx-6 -mb-6 mt-6 border-t border-border bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => loadPageContent(activePage)}
                disabled={saving}
                className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
