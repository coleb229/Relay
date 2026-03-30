"use client";

import { useState } from "react";
import {
  Plus,
  BookOpen,
  Minimize2,
  TrendingUp,
  Briefcase,
  CalendarClock,
  Star,
  FileText,
  Flame,
  Gift,
  Building2,
  PlayCircle,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAGE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type PageTemplate,
  type TemplateCategory,
  type TemplateContext,
} from "./templates";
import { SECTION_LABELS } from "./schemas";
import type { SectionType } from "./schemas";

interface TemplatePickerProps {
  context: TemplateContext;
  onSelect: (template: PageTemplate) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  BookOpen,
  Minimize2,
  TrendingUp,
  Briefcase,
  CalendarClock,
  Star,
  FileText,
  Flame,
  Gift,
  Building2,
  PlayCircle,
};

/** Color for section type preview chips */
const SECTION_COLORS: Record<SectionType, string> = {
  HERO: "bg-violet-500/20 text-violet-700 dark:text-violet-400",
  FEATURES_GRID: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  RICH_TEXT: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400",
  IMAGE_BLOCK: "bg-pink-500/20 text-pink-700 dark:text-pink-400",
  INSTRUCTOR_BIO: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  CURRICULUM_PREVIEW: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  CALL_TO_ACTION: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  TESTIMONIALS: "bg-sky-500/20 text-sky-700 dark:text-sky-400",
  FAQ_ACCORDION: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400",
  VIDEO_EMBED: "bg-red-500/20 text-red-700 dark:text-red-400",
  STATS_BAR: "bg-teal-500/20 text-teal-700 dark:text-teal-400",
  PRICING_TABLE: "bg-lime-500/20 text-lime-700 dark:text-lime-400",
  LOGO_WALL: "bg-slate-500/20 text-slate-700 dark:text-slate-400",
  DIVIDER_SPACER: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
  BUTTON: "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400",
  COUNTDOWN_TIMER: "bg-rose-500/20 text-rose-700 dark:text-rose-400",
  TABS: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-400",
  ACCORDION: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  GALLERY: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
};

export function TemplatePicker({ context, onSelect }: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? PAGE_TEMPLATES
      : PAGE_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="flex h-full flex-col overflow-auto bg-muted/30">
      {/* Header */}
      <div className="shrink-0 border-b bg-background px-6 py-6 text-center">
        <div className="mx-auto flex items-center justify-center gap-2 mb-2">
          <LayoutTemplate className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Choose a Template</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Pick a starting layout for your landing page. You can customize every section after.
        </p>

        {/* Category filter */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {TEMPLATE_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const Icon = ICON_MAP[template.icon];
            const isBlank = template.id === "blank";

            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className={cn(
                  "group relative flex flex-col rounded-lg border bg-background p-4 text-left transition-all hover:shadow-md hover:border-primary/50",
                  isBlank && "border-dashed border-2"
                )}
              >
                {/* Icon + Name */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md transition-colors",
                      isBlank
                        ? "bg-muted group-hover:bg-primary/10"
                        : "bg-primary/10"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "size-4",
                          isBlank
                            ? "text-muted-foreground group-hover:text-primary"
                            : "text-primary"
                        )}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{template.name}</p>
                    {!isBlank && (
                      <p className="text-[10px] text-muted-foreground">
                        {template.sectionPreview.length} sections
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Section preview strip */}
                {template.sectionPreview.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {template.sectionPreview.map((type, i) => (
                      <span
                        key={`${type}-${i}`}
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none",
                          SECTION_COLORS[type]
                        )}
                      >
                        {SECTION_LABELS[type]}
                      </span>
                    ))}
                  </div>
                )}

                {isBlank && (
                  <div className="flex items-center justify-center mt-auto pt-2">
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      Start with an empty canvas
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
