"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, CheckCircle2, Circle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LESSON_TYPE_ICON, LESSON_TYPE_COLOR } from "@/lib/course-utils";

interface CurriculumPreviewProps {
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: number | null;
      isPublished: boolean;
    }[];
  }[];
  courseId: string;
  enrolled: boolean;
  completedLessonIds: Set<string>;
}

export function CurriculumPreview({
  modules,
  courseId,
  enrolled,
  completedLessonIds,
}: CurriculumPreviewProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : [])
  );

  function toggle(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {modules.map((mod, i) => {
        const publishedLessons = mod.lessons.filter((l) => l.isPublished);
        const isOpen = openModules.has(mod.id);

        return (
          <div key={mod.id} className="rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="flex w-full items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-xs font-mono text-muted-foreground w-5">
                {i + 1}.
              </span>
              <span className="text-sm font-medium flex-1 truncate">
                {mod.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {publishedLessons.length}{" "}
                {publishedLessons.length === 1 ? "lesson" : "lessons"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && publishedLessons.length > 0 && (
              <div className="divide-y divide-border">
                {publishedLessons.map((lesson) => {
                  const TypeIcon = LESSON_TYPE_ICON[lesson.type] ?? FileText;
                  const isCompleted = completedLessonIds.has(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      <TypeIcon
                        className={`size-3.5 shrink-0 ${LESSON_TYPE_COLOR[lesson.type]}`}
                      />
                      {enrolled && !isCompleted ? (
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="flex-1 truncate hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="flex-1 truncate">{lesson.title}</span>
                      )}
                      {lesson.duration != null && lesson.duration > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(lesson.duration / 60)} min
                        </span>
                      )}
                      {!enrolled ? (
                        <Lock className="size-3.5 text-muted-foreground/50 shrink-0" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="size-3.5 text-muted-foreground/30 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
