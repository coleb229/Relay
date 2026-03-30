"use client";

import type { CourseData, ModuleData, LessonData, Selection, CategoryData } from "./types";
import { CourseSettingsForm } from "./CourseSettingsForm";
import { ModuleForm } from "./ModuleForm";
import { LessonForm } from "./LessonForm";
import { QuizBuilder } from "./QuizBuilder";
import { SurveyBuilder } from "./SurveyBuilder";
import { EmptyState as EmptyStateUI } from "@/components/ui/empty-state";
import {
  MousePointerClickIcon,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  FileIcon,
  HeadphonesIcon,
  PresentationIcon,
  DownloadIcon,
  CodeIcon,
  ClipboardCheckIcon,
  RadioIcon,
  ClipboardListIcon,
  BookOpenIcon,
  MessageSquareIcon,
  PackageIcon,
} from "lucide-react";

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
  const typeCounts = modules.reduce<Record<string, number>>((acc, m) => {
    for (const l of m.lessons) {
      acc[l.type] = (acc[l.type] || 0) + 1;
    }
    return acc;
  }, {});
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
          typeCounts={typeCounts}
        />
        <CourseSettingsForm key={course.id} course={course} categories={categories} redirectAfterSave={redirectAfterSave} onUpdate={onCourseUpdate} />
      </main>
    );
  }

  if (selection.type === "module") {
    const module = modules.find((m) => m.id === selection.moduleId);
    if (!module) return <EditingEmptyState />;
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <ModuleForm key={module.id} module={module} onUpdate={onModuleUpdate} />
      </main>
    );
  }

  if (selection.type === "lesson") {
    const module = modules.find((m) => m.id === selection.moduleId);
    const lesson = module?.lessons.find((l) => l.id === selection.lessonId);
    if (!lesson) return <EditingEmptyState />;
    return (
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <LessonForm key={lesson.id} lesson={lesson} onUpdate={onLessonUpdate} />
        {lesson.type === "QUIZ" && (
          <>
            <div className="border-t border-border" />
            <QuizBuilder key={`quiz-${lesson.id}`} lesson={lesson} />
          </>
        )}
        {lesson.type === "SURVEY" && (
          <>
            <div className="border-t border-border" />
            <SurveyBuilder key={`survey-${lesson.id}`} lesson={lesson} />
          </>
        )}
      </main>
    );
  }

  return <EditingEmptyState />;
}

// ── Course Stats Bar ─────────────────────────────────────────────────

const TYPE_PILL_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  TEXT: { icon: <FileText className="size-3" />, label: "Text", color: "text-sky-600 dark:text-sky-400" },
  VIDEO: { icon: <Video className="size-3" />, label: "Video", color: "text-violet-600 dark:text-violet-400" },
  QUIZ: { icon: <HelpCircle className="size-3" />, label: "Quiz", color: "text-amber-600 dark:text-amber-400" },
  PDF: { icon: <FileIcon className="size-3" />, label: "PDF", color: "text-rose-600 dark:text-rose-400" },
  AUDIO: { icon: <HeadphonesIcon className="size-3" />, label: "Audio", color: "text-teal-600 dark:text-teal-400" },
  PRESENTATION: { icon: <PresentationIcon className="size-3" />, label: "Slides", color: "text-orange-600 dark:text-orange-400" },
  DOWNLOAD: { icon: <DownloadIcon className="size-3" />, label: "Files", color: "text-slate-600 dark:text-slate-400" },
  EMBED: { icon: <CodeIcon className="size-3" />, label: "Embed", color: "text-indigo-600 dark:text-indigo-400" },
  ASSIGNMENT: { icon: <ClipboardCheckIcon className="size-3" />, label: "Tasks", color: "text-emerald-600 dark:text-emerald-400" },
  LIVE_SESSION: { icon: <RadioIcon className="size-3" />, label: "Live", color: "text-pink-600 dark:text-pink-400" },
  SURVEY: { icon: <ClipboardListIcon className="size-3" />, label: "Surveys", color: "text-cyan-600 dark:text-cyan-400" },
  EBOOK: { icon: <BookOpenIcon className="size-3" />, label: "Ebooks", color: "text-lime-600 dark:text-lime-400" },
  DISCUSSION: { icon: <MessageSquareIcon className="size-3" />, label: "Discuss", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  SCORM: { icon: <PackageIcon className="size-3" />, label: "SCORM", color: "text-yellow-600 dark:text-yellow-400" },
};

function CourseStatsBar({
  modules,
  totalLessons,
  publishedLessons,
  progressPct,
  typeCounts,
}: {
  modules: number;
  totalLessons: number;
  publishedLessons: number;
  progressPct: number;
  typeCounts: Record<string, number>;
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
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-(--dur-layout) ease-(--ease-out-quart)"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill icon={<BookOpen className="size-3" />} label="Modules" value={modules} />
          {Object.entries(typeCounts).map(([type, count]) => {
            const config = TYPE_PILL_CONFIG[type];
            if (!config) return null;
            return (
              <StatPill
                key={type}
                icon={config.icon}
                label={config.label}
                value={count}
                color={config.color}
              />
            );
          })}
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

function EditingEmptyState() {
  return (
    <main className="flex-1 flex items-center justify-center p-12">
      <EmptyStateUI
        variant="centered"
        icon={MousePointerClickIcon}
        title="Nothing selected"
        description="Select a module or lesson from the left to edit it."
      />
    </main>
  );
}
