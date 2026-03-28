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
import { CheckIcon, LoaderCircleIcon, CloudOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageBuilderProps } from "./types";
import type { SaveStatus } from "./types";
import type { PageSection, SectionType, SectionStyle } from "./schemas";
import { generateDefaultSections } from "./defaults";
import { SectionWrapper } from "./SectionWrapper";
import { AddSectionButton } from "./AddSectionButton";
import { SectionPropertiesPanel } from "./editors/SectionPropertiesPanel";

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
  }
}

// ── PageBuilder ──────────────────────────────────────────────────────

export function PageBuilder({
  courseId,
  initialSections,
  courseTitle,
  courseDescription,
  courseImageUrl,
  courseInstructor,
  modules: builderModules,
}: PageBuilderProps) {
  const [sections, setSections] = useState<PageSection[]>(() => {
    if (initialSections && initialSections.length > 0) return initialSections;
    return generateDefaultSections({
      title: courseTitle,
      description: courseDescription,
      imageUrl: courseImageUrl,
    });
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // ── Auto-save with debounce ──────────────────────────────────────
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ landingPageSections: sectionsRef.current }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setSaveStatus("error");
      }
    }, 800);
  }, [courseId]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // fire-and-forget flush
        fetch(`/api/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ landingPageSections: sectionsRef.current }),
        });
      }
    };
  }, [courseId]);

  // Trigger auto-save on sections change (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scheduleSave();
  }, [sections, scheduleSave]);

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
      id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      order: position,
      visible: true,
      style: {
        alignment: "center",
        verticalAlignment: "center",
        backgroundColor: null,
        backgroundImageUrl: null,
        paddingY: "md",
      },
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
        id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    courseId,
    modules: builderModules,
    instructor: courseInstructor ? { ...courseInstructor, courseCount: undefined } : undefined,
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex h-full">
      {/* Center: preview area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-6 relative">
        {/* Save status badge */}
        <div className="absolute top-3 right-3 z-10">
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

        <div className="max-w-4xl mx-auto space-y-0">
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
