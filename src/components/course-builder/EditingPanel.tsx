"use client";

import type { CourseData, ModuleData, LessonData, Selection, CategoryData } from "./types";
import { CourseSettingsForm } from "./CourseSettingsForm";
import { ModuleForm } from "./ModuleForm";
import { LessonForm } from "./LessonForm";
import { QuizBuilder } from "./QuizBuilder";
import { MousePointerClickIcon, BookOpen, FileText, Video, HelpCircle } from "lucide-react";

interface Props {
  course: CourseData;
  modules: ModuleData[];
  selection: Selection;
  categories: CategoryData[];
  redirectAfterSave: string;
  onCourseUpdate: (data: CourseData) => void;
  onModuleUpdate: (moduleId: string, data: Partial<ModuleData>) => void;
  onLessonUpdate: (moduleId: string, lessonId: string, data: Partial<LessonData>) => void;
}

export function EditingPanel({
  course,
  modules,
  selection,
  categories,
  redirectAfterSave,
  onCourseUpdate,
  onModuleUpdate,
  onLessonUpdate,
}: Props) {
  // Compute stats for header
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const publishedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isPublished).length,
    0
  );
  const textCount = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.type === "TEXT").length,
    0
  );
  const videoCount = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.type === "VIDEO").length,
    0
  );
  const quizCount = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.type === "QUIZ").length,
    0
  );
  const progressPct = totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;

  if (selection.type === "course") {
    return (
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats widget */}
        <CourseStatsBar
          modules={modules.length}
          totalLessons={totalLessons}
          publishedLessons={publishedLessons}
          progressPct={progressPct}
          textCount={textCount}
          videoCount={videoCount}
          quizCount={quizCount}
        />
        <CourseSettingsForm key={course.id} course={course} categories={categories} redirectAfterSave={redirectAfterSave} onUpdate={onCourseUpdate} />
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
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <LessonForm key={lesson.id} lesson={lesson} onUpdate={onLessonUpdate} />
        {lesson.type === "QUIZ" && (
          <>
            <div className="border-t border-border" />
            <QuizBuilder key={`quiz-${lesson.id}`} lesson={lesson} />
          </>
        )}
      </main>
    );
  }

  return <EmptyState />;
}

// ── Course Stats Bar ─────────────────────────────────────────────────

function CourseStatsBar({
  modules,
  totalLessons,
  publishedLessons,
  progressPct,
  textCount,
  videoCount,
  quizCount,
}: {
  modules: number;
  totalLessons: number;
  publishedLessons: number;
  progressPct: number;
  textCount: number;
  videoCount: number;
  quizCount: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Progress bar */}
        <div className="flex-1 min-w-48">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium">Publish Progress</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {publishedLessons}/{totalLessons} lessons
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2">
          <StatPill icon={<BookOpen className="size-3" />} label="Modules" value={modules} />
          <StatPill
            icon={<FileText className="size-3" />}
            label="Text"
            value={textCount}
            color="text-sky-600 dark:text-sky-400"
          />
          <StatPill
            icon={<Video className="size-3" />}
            label="Video"
            value={videoCount}
            color="text-violet-600 dark:text-violet-400"
          />
          <StatPill
            icon={<HelpCircle className="size-3" />}
            label="Quiz"
            value={quizCount}
            color="text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-background border border-border px-2.5 py-1.5">
      <span className={color ?? "text-muted-foreground"}>{icon}</span>
      <span className="text-xs tabular-nums font-medium">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────

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
