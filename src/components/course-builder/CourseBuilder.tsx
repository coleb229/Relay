"use client";

import { useState } from "react";
import type { CourseData, ModuleData, LessonData, Selection } from "./types";
import { StructurePanel } from "./StructurePanel";
import { EditingPanel } from "./EditingPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

interface CourseBuilderProps {
  course: CourseData;
  initialModules: ModuleData[];
}

export function CourseBuilder({ course, initialModules }: CourseBuilderProps) {
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [selection, setSelection] = useState<Selection>({ type: "course" });
  const [courseData, setCourseData] = useState<CourseData>(course);

  // ── Module operations ────────────────────────────────────────────

  async function addModule() {
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Module" }),
    });
    if (!res.ok) return;
    const newModule: ModuleData = { ...(await res.json()), lessons: [] };
    setModules((prev) => [...prev, newModule]);
    setSelection({ type: "module", moduleId: newModule.id });
  }

  async function deleteModule(moduleId: string) {
    const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    if (!res.ok) return;
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    setSelection({ type: "course" });
  }

  function updateModuleLocally(moduleId: string, data: Partial<ModuleData>) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, ...data } : m))
    );
  }

  async function reorderModules(moduleIds: string[]) {
    const original = modules;
    const reordered = moduleIds.map((id, index) => {
      const mod = modules.find((m) => m.id === id)!;
      return { ...mod, order: index };
    });
    setModules(reordered);

    const res = await fetch(`/api/courses/${course.id}/modules/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleIds }),
    });
    if (!res.ok) setModules(original); // rollback on error
  }

  function moveModule(moduleId: string, direction: "up" | "down") {
    const sorted = [...modules].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((m) => m.id === moduleId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const newOrder = sorted.map((m) => m.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    reorderModules(newOrder);
  }

  // ── Lesson operations ────────────────────────────────────────────

  async function addLesson(moduleId: string) {
    const res = await fetch(`/api/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Lesson", type: "TEXT" }),
    });
    if (!res.ok) return;
    const newLesson: LessonData = await res.json();
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      )
    );
    setSelection({ type: "lesson", moduleId, lessonId: newLesson.id });
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (!res.ok) return;
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
    setSelection({ type: "module", moduleId });
  }

  function updateLessonLocally(moduleId: string, lessonId: string, data: Partial<LessonData>) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...data } : l
              ),
            }
          : m
      )
    );
  }

  async function reorderLessons(moduleId: string, lessonIds: string[]) {
    const original = modules;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const reordered = lessonIds.map((id, index) => {
          const lesson = m.lessons.find((l) => l.id === id)!;
          return { ...lesson, order: index };
        });
        return { ...m, lessons: reordered };
      })
    );

    const res = await fetch(`/api/modules/${moduleId}/lessons/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds }),
    });
    if (!res.ok) setModules(original); // rollback on error
  }

  function moveLesson(moduleId: string, lessonId: string, direction: "up" | "down") {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const sorted = [...mod.lessons].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((l) => l.id === lessonId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const newOrder = sorted.map((l) => l.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    reorderLessons(moduleId, newOrder);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-4 px-4 py-3 border-b border-border bg-background/95">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon className="size-4" />
            Back to Courses
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <span className="font-semibold text-sm truncate">{courseData.title}</span>
          <Badge
            variant={courseData.status === "PUBLISHED" ? "default" : "secondary"}
            className="text-xs"
          >
            {courseData.status}
          </Badge>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0">
        <StructurePanel
          modules={modules}
          selection={selection}
          onSelect={setSelection}
          onAddModule={addModule}
          onDeleteModule={deleteModule}
          onMoveModule={moveModule}
          onAddLesson={addLesson}
          onDeleteLesson={deleteLesson}
          onMoveLesson={moveLesson}
        />
        <EditingPanel
          course={courseData}
          modules={modules}
          selection={selection}
          onCourseUpdate={setCourseData}
          onModuleUpdate={updateModuleLocally}
          onLessonUpdate={updateLessonLocally}
        />
      </div>
    </div>
  );
}
