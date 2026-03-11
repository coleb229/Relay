"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ModuleData, LessonData, Selection } from "./types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  PlusIcon,
  Trash2Icon,
  SettingsIcon,
  CheckSquareIcon,
  CopyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StructurePanelProps {
  modules: ModuleData[];
  selection: Selection;
  onSelect: (s: Selection) => void;
  onAddModule: () => void;
  onDeleteModule: (moduleId: string) => void;
  onDuplicateModule: (moduleId: string) => void;
  onReorderModules: (moduleIds: string[]) => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onDuplicateLesson: (moduleId: string, lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessonIds: string[]) => void;
  onBulkPublish: (lessonIds: string[], isPublished: boolean) => void;
}

const LESSON_TYPE_COLORS: Record<string, string> = {
  TEXT: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  VIDEO: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  QUIZ: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

// ── Delete dialog ─────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

function DeleteDialog({ open, onOpenChange, title, description, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sortable lesson row ───────────────────────────────────────────────────────

interface SortableLessonRowProps {
  lesson: LessonData;
  moduleId: string;
  isSelected: boolean;
  isSelectMode: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleSelect: (lessonId: string) => void;
  onDuplicate: () => void;
}

function SortableLessonRow({
  lesson,
  isSelected,
  isSelectMode,
  isChecked,
  onSelect,
  onDelete,
  onToggleSelect,
  onDuplicate,
}: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 group transition-colors",
        isSelected ? "bg-primary/8 text-primary" : "hover:bg-muted/50"
      )}
    >
      {/* Select checkbox (select mode) or drag handle */}
      {isSelectMode ? (
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onToggleSelect(lesson.id)}
          className="shrink-0"
        />
      ) : (
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="shrink-0 p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVerticalIcon className="size-3" />
        </button>
      )}

      {/* Title */}
      <button
        onClick={onSelect}
        className="flex-1 text-left text-xs truncate min-w-0 py-0.5"
        title={lesson.title}
      >
        {lesson.title}
      </button>

      {/* Type badge */}
      <span
        className={cn(
          "shrink-0 inline-flex items-center rounded border px-1 py-0 text-[10px] font-medium leading-4 opacity-0 group-hover:opacity-100",
          LESSON_TYPE_COLORS[lesson.type]
        )}
      >
        {lesson.type}
      </span>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Duplicate lesson"
      >
        <CopyIcon className="size-3" />
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete lesson"
      >
        <Trash2Icon className="size-3" />
      </button>
    </div>
  );
}

// ── Lesson drag overlay (ghost while dragging) ────────────────────────────────

function LessonDragOverlay({ lesson }: { lesson: LessonData }) {
  return (
    <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-background border border-border shadow-lg opacity-90 text-xs font-medium">
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="truncate">{lesson.title}</span>
    </div>
  );
}

// ── Sortable module row ───────────────────────────────────────────────────────

interface SortableModuleRowProps {
  mod: ModuleData;
  isSelected: boolean;
  isExpanded: boolean;
  selection: Selection;
  isSelectMode: boolean;
  selectedLessonIds: Set<string>;
  onSelectModule: () => void;
  onToggleExpand: () => void;
  onAddLesson: () => void;
  onDeleteModule: () => void;
  onDuplicateModule: () => void;
  onSelectLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDuplicateLesson: (lessonId: string) => void;
  onReorderLessons: (lessonIds: string[]) => void;
  onToggleSelectLesson: (lessonId: string) => void;
}

function SortableModuleRow({
  mod,
  isSelected,
  isExpanded,
  selection,
  isSelectMode,
  selectedLessonIds,
  onSelectModule,
  onToggleExpand,
  onAddLesson,
  onDeleteModule,
  onDuplicateModule,
  onSelectLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onReorderLessons,
  onToggleSelectLesson,
}: SortableModuleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  });

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
  const activeLesson = activeLessonId ? sortedLessons.find((l) => l.id === activeLessonId) : null;

  function handleLessonDragStart(event: DragStartEvent) {
    setActiveLessonId(event.active.id as string);
  }

  function handleLessonDragEnd(event: DragEndEvent) {
    setActiveLessonId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedLessons.findIndex((l) => l.id === active.id);
    const newIndex = sortedLessons.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(sortedLessons, oldIndex, newIndex).map((l) => l.id);
    onReorderLessons(newOrder);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-0.5">
      {/* Module row */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg px-1 py-1 group transition-colors",
          isSelected ? "bg-primary/8 text-primary" : "hover:bg-muted/50"
        )}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="shrink-0 p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Drag to reorder module"
          tabIndex={-1}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Title */}
        <button
          onClick={onSelectModule}
          className="flex-1 text-left text-xs font-medium truncate min-w-0 py-0.5"
          title={mod.title}
        >
          {mod.title}
        </button>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onAddLesson}
            className="p-0.5 rounded hover:bg-muted"
            aria-label="Add lesson"
          >
            <PlusIcon className="size-3" />
          </button>
          <button
            onClick={onDuplicateModule}
            className="p-0.5 rounded hover:bg-muted"
            aria-label="Duplicate module"
          >
            <CopyIcon className="size-3" />
          </button>
          <button
            onClick={onDeleteModule}
            className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
            aria-label="Delete module"
          >
            <Trash2Icon className="size-3" />
          </button>
        </div>
      </div>

      {/* Lessons with their own DnD context */}
      {isExpanded && (
        <div className="ml-5 space-y-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleLessonDragStart}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={sortedLessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedLessons.map((lesson) => (
                <SortableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={mod.id}
                  isSelected={selection.type === "lesson" && selection.lessonId === lesson.id}
                  isSelectMode={isSelectMode}
                  isChecked={selectedLessonIds.has(lesson.id)}
                  onSelect={() => onSelectLesson(lesson.id)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                  onToggleSelect={onToggleSelectLesson}
                  onDuplicate={() => onDuplicateLesson(lesson.id)}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeLesson && <LessonDragOverlay lesson={activeLesson} />}
            </DragOverlay>
          </DndContext>

          {/* Add Lesson */}
          <button
            onClick={onAddLesson}
            className="flex items-center gap-1.5 w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <PlusIcon className="size-3" />
            Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

// ── Module drag overlay ───────────────────────────────────────────────────────

function ModuleDragOverlay({ mod }: { mod: ModuleData }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-background border border-border shadow-lg opacity-90 text-xs font-medium">
      <GripVerticalIcon className="size-3.5 text-muted-foreground" />
      <span className="truncate">{mod.title}</span>
      <span className="text-muted-foreground">({mod.lessons.length} lessons)</span>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function StructurePanel({
  modules,
  selection,
  onSelect,
  onAddModule,
  onDeleteModule,
  onDuplicateModule,
  onReorderModules,
  onAddLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onReorderLessons,
  onBulkPublish,
}: StructurePanelProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id))
  );
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "module"; moduleId: string; title: string }
    | { kind: "lesson"; moduleId: string; lessonId: string; title: string }
    | null
  >(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const activeModule = activeModuleId ? sorted.find((m) => m.id === activeModuleId) : null;

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  }

  function toggleSelectMode() {
    setIsSelectMode((v) => !v);
    setSelectedLessonIds(new Set());
  }

  function toggleLessonSelect(lessonId: string) {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  }

  function handleModuleDragStart(event: DragStartEvent) {
    setActiveModuleId(event.active.id as string);
  }

  function handleModuleDragEnd(event: DragEndEvent) {
    setActiveModuleId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((m) => m.id === active.id);
    const newIndex = sorted.findIndex((m) => m.id === over.id);
    const newOrder = arrayMove(sorted, oldIndex, newIndex).map((m) => m.id);
    onReorderModules(newOrder);
  }

  return (
    <aside className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
      {/* Course settings link */}
      <button
        onClick={() => onSelect({ type: "course" })}
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b border-border transition-colors hover:bg-muted/50 w-full text-left",
          selection.type === "course" && "bg-primary/5 text-primary"
        )}
      >
        <SettingsIcon className="size-4 shrink-0" />
        Course Settings
      </button>

      {/* Curriculum label */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Curriculum
        </p>
        <button
          onClick={toggleSelectMode}
          className={cn(
            "p-1 rounded text-xs transition-colors",
            isSelectMode
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title={isSelectMode ? "Exit select mode" : "Select lessons"}
        >
          <CheckSquareIcon className="size-3.5" />
        </button>
      </div>

      {/* Module list with DnD */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No modules yet. Add one below.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleModuleDragStart}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext items={sorted.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {sorted.map((mod) => (
              <SortableModuleRow
                key={mod.id}
                mod={mod}
                isSelected={selection.type === "module" && selection.moduleId === mod.id}
                isExpanded={expandedModules.has(mod.id)}
                selection={selection}
                isSelectMode={isSelectMode}
                selectedLessonIds={selectedLessonIds}
                onSelectModule={() => onSelect({ type: "module", moduleId: mod.id })}
                onToggleExpand={() => toggleModule(mod.id)}
                onAddLesson={() => onAddLesson(mod.id)}
                onDeleteModule={() =>
                  setDeleteTarget({ kind: "module", moduleId: mod.id, title: mod.title })
                }
                onDuplicateModule={() => onDuplicateModule(mod.id)}
                onSelectLesson={(lessonId) =>
                  onSelect({ type: "lesson", moduleId: mod.id, lessonId })
                }
                onDeleteLesson={(lessonId) => {
                  const lesson = mod.lessons.find((l) => l.id === lessonId);
                  if (lesson)
                    setDeleteTarget({
                      kind: "lesson",
                      moduleId: mod.id,
                      lessonId,
                      title: lesson.title,
                    });
                }}
                onDuplicateLesson={(lessonId) => onDuplicateLesson(mod.id, lessonId)}
                onReorderLessons={(lessonIds) => onReorderLessons(mod.id, lessonIds)}
                onToggleSelectLesson={toggleLessonSelect}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeModule && <ModuleDragOverlay mod={activeModule} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Bulk action bar */}
      {isSelectMode && selectedLessonIds.size > 0 && (
        <div className="px-3 py-2 border-t border-border bg-muted/50 flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex-1">
            {selectedLessonIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              onBulkPublish(Array.from(selectedLessonIds), true);
              setIsSelectMode(false);
              setSelectedLessonIds(new Set());
            }}
          >
            Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              onBulkPublish(Array.from(selectedLessonIds), false);
              setIsSelectMode(false);
              setSelectedLessonIds(new Set());
            }}
          >
            Unpublish
          </Button>
        </div>
      )}

      {/* Add Module */}
      <div className="px-3 py-3 border-t border-border">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onAddModule}>
          <PlusIcon className="size-4" />
          Add Module
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.kind === "module" ? "Delete Module" : "Delete Lesson"}
        description={
          deleteTarget?.kind === "module"
            ? `Delete "${deleteTarget.title}" and all its lessons? This cannot be undone.`
            : `Delete "${deleteTarget?.title}"? This cannot be undone.`
        }
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "module") {
            onDeleteModule(deleteTarget.moduleId);
          } else {
            onDeleteLesson(deleteTarget.moduleId, deleteTarget.lessonId);
          }
        }}
      />
    </aside>
  );
}
