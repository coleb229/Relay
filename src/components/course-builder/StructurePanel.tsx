"use client";

import { useState } from "react";
import type { ModuleData, Selection } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronUpIcon,
  PlusIcon,
  Trash2Icon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StructurePanelProps {
  modules: ModuleData[];
  selection: Selection;
  onSelect: (s: Selection) => void;
  onAddModule: () => void;
  onDeleteModule: (moduleId: string) => void;
  onMoveModule: (moduleId: string, direction: "up" | "down") => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onMoveLesson: (moduleId: string, lessonId: string, direction: "up" | "down") => void;
}

const LESSON_TYPE_COLORS: Record<string, string> = {
  TEXT: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  VIDEO: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  QUIZ: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

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

export function StructurePanel({
  modules,
  selection,
  onSelect,
  onAddModule,
  onDeleteModule,
  onMoveModule,
  onAddLesson,
  onDeleteLesson,
  onMoveLesson,
}: StructurePanelProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id))
  );
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "module"; moduleId: string; title: string }
    | { kind: "lesson"; moduleId: string; lessonId: string; title: string }
    | null
  >(null);

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  }

  const sorted = [...modules].sort((a, b) => a.order - b.order);

  function isModuleSelected(moduleId: string) {
    return selection.type === "module" && selection.moduleId === moduleId;
  }

  function isLessonSelected(lessonId: string) {
    return selection.type === "lesson" && selection.lessonId === lessonId;
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
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Curriculum
        </p>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No modules yet. Add one below.
          </p>
        )}

        {sorted.map((mod, modIndex) => {
          const expanded = expandedModules.has(mod.id);
          const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);

          return (
            <div key={mod.id} className="space-y-0.5">
              {/* Module row */}
              <div
                className={cn(
                  "flex items-center gap-1 rounded-lg px-1 py-1 group transition-colors",
                  isModuleSelected(mod.id)
                    ? "bg-primary/8 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? (
                    <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                  )}
                </button>

                {/* Title — click to select */}
                <button
                  onClick={() => onSelect({ type: "module", moduleId: mod.id })}
                  className="flex-1 text-left text-xs font-medium truncate min-w-0 py-0.5"
                  title={mod.title}
                >
                  {mod.title}
                </button>

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => onMoveModule(mod.id, "up")}
                    disabled={modIndex === 0}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move module up"
                  >
                    <ChevronUpIcon className="size-3" />
                  </button>
                  <button
                    onClick={() => onMoveModule(mod.id, "down")}
                    disabled={modIndex === sorted.length - 1}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move module down"
                  >
                    <ChevronDownIcon className="size-3" />
                  </button>
                  <button
                    onClick={() => onAddLesson(mod.id)}
                    className="p-0.5 rounded hover:bg-muted"
                    aria-label="Add lesson"
                  >
                    <PlusIcon className="size-3" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ kind: "module", moduleId: mod.id, title: mod.title })
                    }
                    className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                    aria-label="Delete module"
                  >
                    <Trash2Icon className="size-3" />
                  </button>
                </div>
              </div>

              {/* Lessons */}
              {expanded && (
                <div className="ml-5 space-y-0.5">
                  {sortedLessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2 py-1 group transition-colors",
                        isLessonSelected(lesson.id)
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {/* Lesson title */}
                      <button
                        onClick={() =>
                          onSelect({
                            type: "lesson",
                            moduleId: mod.id,
                            lessonId: lesson.id,
                          })
                        }
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

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => onMoveLesson(mod.id, lesson.id, "up")}
                          disabled={lessonIndex === 0}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move lesson up"
                        >
                          <ChevronUpIcon className="size-3" />
                        </button>
                        <button
                          onClick={() => onMoveLesson(mod.id, lesson.id, "down")}
                          disabled={lessonIndex === sortedLessons.length - 1}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move lesson down"
                        >
                          <ChevronDownIcon className="size-3" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              kind: "lesson",
                              moduleId: mod.id,
                              lessonId: lesson.id,
                              title: lesson.title,
                            })
                          }
                          className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                          aria-label="Delete lesson"
                        >
                          <Trash2Icon className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson button */}
                  <button
                    onClick={() => onAddLesson(mod.id)}
                    className="flex items-center gap-1.5 w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <PlusIcon className="size-3" />
                    Add Lesson
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Module */}
      <div className="px-3 py-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={onAddModule}
        >
          <PlusIcon className="size-4" />
          Add Module
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "module"
            ? "Delete Module"
            : "Delete Lesson"
        }
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
