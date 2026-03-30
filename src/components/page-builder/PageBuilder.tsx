"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  CheckIcon,
  LoaderCircleIcon,
  CloudOffIcon,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageBuilderProps } from "./types";
import type { SaveStatus } from "./types";
import type { PageSection, SectionType, SectionStyle } from "./schemas";
import { genSectionId, DEFAULT_SECTION_STYLE } from "./defaults";
import { useHistory } from "./useHistory";
import { SectionWrapper } from "./SectionWrapper";
import { AddSectionButton } from "./AddSectionButton";
import { SectionPropertiesPanel } from "./editors/SectionPropertiesPanel";
import { TemplatePicker } from "./TemplatePicker";
import type { PageTemplate, TemplateContext } from "./templates";

// ── Default config factory per section type ──────────────────────────

function createDefaultConfig(type: SectionType): PageSection["config"] {
  switch (type) {
    case "HERO":
      return {
        title: "",
        subtitle: "",
        backgroundImageUrl: null,
        ctaText: "Enroll Now",
        ctaLink: "",
        overlayOpacity: 0.5,
      };
    case "FEATURES_GRID":
      return {
        heading: "What You'll Learn",
        columnCount: 3 as const,
        columns: [],
      };
    case "RICH_TEXT":
      return { html: "" };
    case "IMAGE_BLOCK":
      return { imageUrl: "", caption: "", maxWidth: "lg" as const };
    case "INSTRUCTOR_BIO":
      return {};
    case "CURRICULUM_PREVIEW":
      return { showDuration: true };
    case "CALL_TO_ACTION":
      return {
        heading: "Ready to Get Started?",
        description: "",
        buttonText: "Enroll Now",
        buttonLink: "",
        backgroundColor: null,
      };
    case "TESTIMONIALS":
      return { heading: "What Students Say", items: [] };
    case "FAQ_ACCORDION":
      return { heading: "Frequently Asked Questions", items: [] };
    case "VIDEO_EMBED":
      return {
        heading: "",
        videoUrl: "",
        provider: "youtube" as const,
        aspectRatio: "16:9" as const,
        maxWidth: "lg" as const,
      };
    case "STATS_BAR":
      return { heading: "", columnCount: 4 as const, columns: [] };
    case "PRICING_TABLE":
      return {
        heading: "Pricing",
        description: "",
        showCompareAtPrice: true,
        ctaText: "Enroll Now",
        ctaLink: "",
        features: [],
      };
    case "LOGO_WALL":
      return {
        heading: "Trusted By",
        logos: [],
        grayscale: true,
        maxLogoHeight: "md" as const,
      };
    case "DIVIDER_SPACER":
      return {
        variant: "line" as const,
        thickness: "thin" as const,
        width: "full" as const,
        color: null,
        spacingY: "md" as const,
      };
    case "BUTTON":
      return {
        text: "Click Here",
        href: "",
        target: "_self" as const,
        variant: "solid" as const,
        size: "md" as const,
        bgColor: null,
        textColor: null,
        borderColor: null,
        borderRadius: "md" as const,
        fullWidth: false,
      };
    case "COUNTDOWN_TIMER":
      return {
        heading: "",
        targetDate: "",
        expiredMessage: "This event has ended",
        showDays: true,
        showSeconds: true,
      };
    case "TABS":
      return {
        heading: "",
        tabs: [],
      };
    case "ACCORDION":
      return {
        heading: "",
        items: [],
        allowMultiOpen: false,
      };
    case "GALLERY":
      return {
        heading: "",
        mode: "grid" as const,
        columnCount: 3 as const,
        aspectRatio: "4:3" as const,
        gap: "md" as const,
        autoplay: false,
        autoplayInterval: 5,
        images: [],
      };
  }
}


type PreviewWidth = "desktop" | "tablet" | "mobile";

const PREVIEW_WIDTH_MAP: Record<PreviewWidth, string> = {
  desktop: "max-w-4xl",
  tablet: "max-w-md",
  mobile: "max-w-sm",
};

// ── PageBuilder ──────────────────────────────────────────────────────

export function PageBuilder({
  saveEndpoint,
  savePayloadKey,
  initialSections,
  context,
  defaultSectionsConfig,
}: PageBuilderProps) {
  const hasInitialSections = initialSections && initialSections.length > 0;

  const {
    state: sections,
    set: setSections,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<PageSection[]>(() => {
    if (hasInitialSections) return initialSections;
    // Don't auto-generate defaults — let the template picker handle it
    return [];
  });

  const [showTemplatePicker, setShowTemplatePicker] = useState(!hasInitialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>("desktop");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // ── Auto-save with debounce ──────────────────────────────────────
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(saveEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [savePayloadKey]: sectionsRef.current }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }, [saveEndpoint, savePayloadKey]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        fetch(saveEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [savePayloadKey]: sectionsRef.current }),
        });
      }
    };
  }, [saveEndpoint, savePayloadKey]);

  // Trigger auto-save on sections change (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scheduleSave();
  }, [sections, scheduleSave]);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ── Template selection ────────────────────────────────────────────
  const templateContext: TemplateContext = defaultSectionsConfig ?? {
    title: "",
    description: null,
    imageUrl: null,
  };

  function handleTemplateSelect(template: PageTemplate) {
    const generated = template.generate(templateContext);
    setSections(generated);
    setShowTemplatePicker(false);
    setSelectedSectionId(null);
  }

  function handleChangeTemplate() {
    if (sections.length > 0 && !confirm("This will replace all current sections. Continue?")) {
      return;
    }
    setSelectedSectionId(null);
    setShowTemplatePicker(true);
  }

  // ── DnD setup ────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, i) => ({ ...s, order: i }) as PageSection);
    });
  }

  // ── Section operations ───────────────────────────────────────────
  function addSection(type: SectionType, position: number) {
    const newSection: PageSection = {
      id: genSectionId(),
      type,
      order: position,
      visible: true,
      style: { ...DEFAULT_SECTION_STYLE },
      config: createDefaultConfig(type),
    } as PageSection;

    setSections((prev) => {
      const next = [...prev];
      next.splice(position, 0, newSection);
      return next.map((s, i) => ({ ...s, order: i }) as PageSection);
    });
    setSelectedSectionId(newSection.id);
  }

  function deleteSection(id: string) {
    setSections((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.map((s, i) => ({ ...s, order: i }) as PageSection);
    });
    if (selectedSectionId === id) setSelectedSectionId(null);
  }

  function duplicateSection(id: string) {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const original = prev[index];
      const copy: PageSection = {
        ...structuredClone(original),
        id: genSectionId(),
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next.map((s, i) => ({ ...s, order: i }) as PageSection);
    });
  }

  function toggleVisibility(id: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? ({ ...s, visible: !s.visible } as PageSection) : s
      )
    );
  }

  function moveSection(id: string, direction: -1 | 1) {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const reordered = arrayMove(prev, index, targetIndex);
      return reordered.map((s, i) => ({ ...s, order: i }) as PageSection);
    });
  }

  function updateSectionConfig(id: string, config: PageSection["config"]) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? ({ ...s, config } as PageSection) : s
      )
    );
  }

  function updateSectionStyle(id: string, style: Partial<SectionStyle>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? ({ ...s, style: { ...s.style, ...style } } as PageSection)
          : s
      )
    );
  }

  // ── Derived state ────────────────────────────────────────────────
  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  const rendererContext = {
    courseId: context?.courseId,
    modules: context?.modules,
    instructor: context?.instructor,
    price: context?.price,
    compareAtPrice: context?.compareAtPrice,
  };

  // ── Render ───────────────────────────────────────────────────────

  if (showTemplatePicker) {
    return (
      <div className="flex h-full">
        <TemplatePicker context={templateContext} onSelect={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Center: preview area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-6 relative bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px]">
        {/* Top toolbar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          {/* Left: undo/redo + preview width + change template */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center justify-center size-7 rounded-md border bg-background text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center justify-center size-7 rounded-md border bg-background text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="size-3.5" />
            </button>

            <div className="w-px h-4 bg-border mx-1" />

            <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
              {(
                [
                  { value: "desktop", icon: Monitor, label: "Desktop" },
                  { value: "tablet", icon: Tablet, label: "Tablet" },
                  { value: "mobile", icon: Smartphone, label: "Mobile" },
                ] as const
              ).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPreviewWidth(value)}
                  className={cn(
                    "flex items-center justify-center size-7 rounded transition-colors",
                    previewWidth === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  title={label}
                >
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-border mx-1" />

            <button
              onClick={handleChangeTemplate}
              className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
              title="Change template"
            >
              <LayoutTemplate className="size-3.5" />
              Templates
            </button>
          </div>

          {/* Right: save status */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity",
              saveStatus === "idle" && "opacity-0",
              saveStatus === "saving" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
              saveStatus === "saved" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
              saveStatus === "error" && "bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            {saveStatus === "saving" && (
              <>
                <LoaderCircleIcon className="size-3 animate-spin" />
                Saving...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckIcon className="size-3" />
                Saved
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudOffIcon className="size-3" />
                Save failed
              </>
            )}
          </div>
        </div>

        <div className={cn(PREVIEW_WIDTH_MAP[previewWidth], "mx-auto space-y-0 mt-10 transition-all duration-300")}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <AddSectionButton position={index} onAdd={addSection} />
                  <SectionWrapper
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => setSelectedSectionId(section.id)}
                    onDelete={() => deleteSection(section.id)}
                    onDuplicate={() => duplicateSection(section.id)}
                    onToggleVisibility={() => toggleVisibility(section.id)}
                    context={rendererContext}
                    onMoveUp={
                      index > 0 ? () => moveSection(section.id, -1) : undefined
                    }
                    onMoveDown={
                      index < sections.length - 1
                        ? () => moveSection(section.id, 1)
                        : undefined
                    }
                  />
                </React.Fragment>
              ))}
              <AddSectionButton position={sections.length} onAdd={addSection} />
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Right: properties panel */}
      {selectedSectionId && selectedSection && (
        <div className="w-80 shrink-0 border-l overflow-auto bg-background">
          <SectionPropertiesPanel
            section={selectedSection}
            onConfigChange={(config) =>
              updateSectionConfig(selectedSectionId, config)
            }
            onStyleChange={(style) =>
              updateSectionStyle(selectedSectionId, style)
            }
            onClose={() => setSelectedSectionId(null)}
          />
        </div>
      )}
    </div>
  );
}
