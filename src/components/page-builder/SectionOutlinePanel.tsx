"use client";

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
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  PanelLeftCloseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_LABELS, SECTION_ICONS, type PageSection } from "./schemas";
import { SECTION_ICON_MAP } from "./section-icon-map";

// ── Types ──────────────────────────────────────────────────────────

interface SectionOutlinePanelProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: PageSection[]) => void;
  onToggleVisibility: (id: string) => void;
  onCollapse: () => void;
}

// ── Label extraction ───────────────────────────────────────────────

function getSectionLabel(section: PageSection): string {
  const config = section.config as Record<string, unknown>;
  if (typeof config.heading === "string" && config.heading.trim()) {
    return config.heading.trim().slice(0, 30);
  }
  if (typeof config.title === "string" && config.title.trim()) {
    return config.title.trim().slice(0, 30);
  }
  return SECTION_LABELS[section.type];
}

// ── Sortable outline item ──────────────────────────────────────────

function OutlineItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
}: {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconName = SECTION_ICONS[section.type];
  const Icon = SECTION_ICON_MAP[iconName];
  const label = getSectionLabel(section);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/item flex items-center gap-1 rounded-md px-1 py-1 text-xs transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isDragging && "z-50 opacity-80 shadow-sm bg-background",
        !section.visible && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex shrink-0 items-center justify-center size-5 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-3" />
      </button>

      {/* Icon + label (clickable) */}
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
      >
        {Icon && <Icon className="size-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </button>

      {/* Visibility toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className={cn(
          "flex shrink-0 items-center justify-center size-5 rounded transition-opacity duration-(--dur-feedback) ease-(--ease-out-quart)",
          section.visible
            ? "opacity-0 group-hover/item:opacity-100"
            : "opacity-100"
        )}
        title={section.visible ? "Hide section" : "Show section"}
      >
        {section.visible ? (
          <EyeIcon className="size-3" />
        ) : (
          <EyeOffIcon className="size-3" />
        )}
      </button>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────

export function SectionOutlinePanel({
  sections,
  selectedSectionId,
  onSelect,
  onReorder,
  onToggleVisibility,
  onCollapse,
}: SectionOutlinePanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map(
      (s, i) => ({ ...s, order: i }) as PageSection
    );
    onReorder(reordered);
  }

  function handleSelect(id: string) {
    onSelect(id);
    // Scroll canvas to the section
    requestAnimationFrame(() => {
      document
        .getElementById(`section-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="flex w-56 shrink-0 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Outline</span>
          <span className="inline-flex items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            {sections.length}
          </span>
        </div>
        <button
          onClick={onCollapse}
          className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
          title="Close outline"
        >
          <PanelLeftCloseIcon className="size-3.5" />
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-auto p-1.5">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No sections yet
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <OutlineItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => handleSelect(section.id)}
                  onToggleVisibility={() => onToggleVisibility(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
