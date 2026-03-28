"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, PlayCircle, FileText, Clock } from "lucide-react";
import { useState } from "react";
import type { CurriculumPreviewSection as CurriculumPreviewSectionType } from "../schemas";

interface ModuleData {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    type: string;
    duration: number | null;
    isPublished: boolean;
  }[];
}

interface CurriculumPreviewSectionProps {
  config: CurriculumPreviewSectionType["config"];
  modules?: ModuleData[];
  completedLessonIds?: Set<string>;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO":
      return <PlayCircle className="size-4 text-muted-foreground" />;
    default:
      return <FileText className="size-4 text-muted-foreground" />;
  }
}

function ModuleItem({
  module,
  showDuration,
  completedLessonIds,
}: {
  module: ModuleData;
  showDuration: boolean;
  completedLessonIds?: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const publishedLessons = module.lessons.filter((l) => l.isPublished);
  const totalDuration = publishedLessons.reduce(
    (sum, l) => sum + (l.duration ?? 0),
    0
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex-1">
          <span className="text-sm font-medium">{module.title}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {publishedLessons.length}{" "}
            {publishedLessons.length === 1 ? "lesson" : "lessons"}
            {showDuration && totalDuration > 0 && (
              <> &middot; {formatDuration(totalDuration)}</>
            )}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && publishedLessons.length > 0 && (
        <ul className="divide-y divide-border/30 border-t border-border/50 bg-background">
          {publishedLessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <LessonTypeIcon type={lesson.type} />
              <span
                className={cn(
                  "flex-1 text-sm",
                  completedLessonIds?.has(lesson.id) &&
                    "text-muted-foreground line-through"
                )}
              >
                {lesson.title}
              </span>
              {showDuration && lesson.duration && lesson.duration > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {formatDuration(lesson.duration)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CurriculumPreviewSection({
  config,
  modules,
  completedLessonIds,
}: CurriculumPreviewSectionProps) {
  if (!modules || modules.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Course Curriculum
        </h2>
        <p className="text-muted-foreground">
          Curriculum content is not available yet.
        </p>
      </div>
    );
  }

  const totalLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isPublished).length,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Course Curriculum
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {modules.length} {modules.length === 1 ? "module" : "modules"} &middot;{" "}
          {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {modules.map((mod) => (
          <ModuleItem
            key={mod.id}
            module={mod}
            showDuration={config.showDuration}
            completedLessonIds={completedLessonIds}
          />
        ))}
      </div>
    </div>
  );
}
