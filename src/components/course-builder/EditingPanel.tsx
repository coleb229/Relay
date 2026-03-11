"use client";

import type { CourseData, ModuleData, LessonData, Selection } from "./types";
import { CourseSettingsForm } from "./CourseSettingsForm";
import { ModuleForm } from "./ModuleForm";
import { LessonForm } from "./LessonForm";
import { MousePointerClickIcon } from "lucide-react";

interface Props {
  course: CourseData;
  modules: ModuleData[];
  selection: Selection;
  onCourseUpdate: (data: CourseData) => void;
  onModuleUpdate: (moduleId: string, data: Partial<ModuleData>) => void;
  onLessonUpdate: (moduleId: string, lessonId: string, data: Partial<LessonData>) => void;
}

export function EditingPanel({
  course,
  modules,
  selection,
  onCourseUpdate,
  onModuleUpdate,
  onLessonUpdate,
}: Props) {
  if (selection.type === "course") {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <CourseSettingsForm key={course.id} course={course} onUpdate={onCourseUpdate} />
      </main>
    );
  }

  if (selection.type === "module") {
    const module = modules.find((m) => m.id === selection.moduleId);
    if (!module) return <EmptyState />;
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <ModuleForm key={module.id} module={module} onUpdate={onModuleUpdate} />
      </main>
    );
  }

  if (selection.type === "lesson") {
    const module = modules.find((m) => m.id === selection.moduleId);
    const lesson = module?.lessons.find((l) => l.id === selection.lessonId);
    if (!lesson) return <EmptyState />;
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <LessonForm key={lesson.id} lesson={lesson} onUpdate={onLessonUpdate} />
      </main>
    );
  }

  return <EmptyState />;
}

function EmptyState() {
  return (
    <main className="flex-1 flex items-center justify-center text-center p-12">
      <div className="space-y-2">
        <MousePointerClickIcon className="size-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">
          Select a module or lesson from the left to edit it.
        </p>
      </div>
    </main>
  );
}
