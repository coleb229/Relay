"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageSection } from "./schemas";
import { SECTION_LABELS } from "./schemas";
import { SectionRenderer, type SectionRendererProps } from "./renderers/SectionRenderer";

interface SectionWrapperProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  context?: SectionRendererProps["context"];
}

export function SectionWrapper({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  context,
}: SectionWrapperProps) {
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

  return (
    <div
      id={`section-${section.id}`}
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/section relative rounded-lg border-2 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
        isSelected
          ? "border-primary/50"
          : "border-transparent hover:border-primary/20",
        isDragging && "z-50 opacity-80 shadow-lg"
      )}
      onClick={(e) => {
        // Don't select when clicking toolbar buttons
        if ((e.target as HTMLElement).closest("[data-toolbar]")) return;
        onSelect();
      }}
    >
      {/* Hover toolbar */}
      <div
        data-toolbar
        className={cn(
          "absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border bg-background px-1 py-0.5 shadow-sm transition-opacity duration-(--dur-feedback) ease-(--ease-out-quart)",
          isSelected
            ? "opacity-100"
            : "opacity-0 group-hover/section:opacity-100"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="flex items-center justify-center size-6 rounded hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVerticalIcon className="size-3.5 text-muted-foreground" />
        </button>

        {onMoveUp && (
          <button
            onClick={onMoveUp}
            className="flex items-center justify-center size-6 rounded hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
            title="Move up"
          >
            <ChevronUpIcon className="size-3.5 text-muted-foreground" />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={onMoveDown}
            className="flex items-center justify-center size-6 rounded hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
            title="Move down"
          >
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </button>
        )}

        <button
          onClick={onDuplicate}
          className="flex items-center justify-center size-6 rounded hover:bg-primary/10 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
          title="Duplicate"
        >
          <CopyIcon className="size-3.5 text-muted-foreground" />
        </button>

        <button
          onClick={onToggleVisibility}
          className="flex items-center justify-center size-6 rounded hover:bg-amber-500/10 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
          title={section.visible ? "Hide section" : "Show section"}
        >
          {section.visible ? (
            <EyeIcon className="size-3.5 text-muted-foreground" />
          ) : (
            <EyeOffIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={onDelete}
          className="flex items-center justify-center size-6 rounded hover:bg-destructive/10 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
          title="Delete"
        >
          <Trash2Icon className="size-3.5 text-destructive" />
        </button>
      </div>

      {/* Section content */}
      <div className={cn(!section.visible && "opacity-40")}>
        <SectionRenderer section={{ ...section, visible: true }} context={context} />
      </div>
    </div>
  );
}
