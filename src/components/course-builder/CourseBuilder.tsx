"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CourseData, CourseStatus, ModuleData, LessonData, Selection, CategoryData } from "./types";
import { StructurePanel } from "./StructurePanel";
import { EditingPanel } from "./EditingPanel";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronLeftIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ArchiveIcon,
  Trash2Icon,
  CheckIcon,
  LoaderCircleIcon,
  CloudOffIcon,
} from "lucide-react";
import Link from "next/link";

interface CourseBuilderProps {
  course: CourseData;
  initialModules: ModuleData[];
  categories: CategoryData[];
  redirectAfterSave: string;
}

export function CourseBuilder({ course, initialModules, categories, redirectAfterSave }: CourseBuilderProps) {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [selection, setSelection] = useState<Selection>({ type: "course" });
  const [courseData, setCourseData] = useState<CourseData>(course);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // ── Inline title editing ──────────────────────────────────────────
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(course.title);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  async function saveTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === courseData.title) {
      setEditingTitle(false);
      setTitleDraft(courseData.title);
      return;
    }
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCourseData(updated);
    }
    setEditingTitle(false);
  }

  // ── Status change ─────────────────────────────────────────────────
  async function changeStatus(newStatus: CourseStatus) {
    setStatusLoading(true);
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCourseData(updated);
    }
    setStatusLoading(false);
  }

  // ── Delete course ─────────────────────────────────────────────────
  async function deleteCourse() {
    const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    if (res.ok) router.push("/courses");
  }

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

  async function duplicateModule(moduleId: string) {
    const res = await fetch(`/api/modules/${moduleId}/duplicate`, { method: "POST" });
    if (!res.ok) return;
    const { module: newMod, lessons } = await res.json();
    setModules((prev) => [...prev, { ...newMod, lessons: lessons ?? [] }]);
    setSelection({ type: "module", moduleId: newMod.id });
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
    if (!res.ok) setModules(original);
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

  async function duplicateLesson(moduleId: string, lessonId: string) {
    const res = await fetch(`/api/lessons/${lessonId}/duplicate`, { method: "POST" });
    if (!res.ok) return;
    const newLesson: LessonData = await res.json();
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      )
    );
    setSelection({ type: "lesson", moduleId, lessonId: newLesson.id });
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

  async function bulkPublishLessons(lessonIds: string[], isPublished: boolean) {
    const res = await fetch("/api/lessons/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds, isPublished }),
    });
    if (!res.ok) return;
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          lessonIds.includes(l.id) ? { ...l, isPublished } : l
        ),
      }))
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
    if (!res.ok) setModules(original);
  }

  // ── Computed stats ────────────────────────────────────────────────
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const publishedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isPublished).length,
    0
  );

  // ── Status helpers ────────────────────────────────────────────────
  const statusConfig = {
    DRAFT: { label: "Draft", variant: "secondary" as const, color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    PUBLISHED: { label: "Published", variant: "default" as const, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    ARCHIVED: { label: "Archived", variant: "secondary" as const, color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  };

  const currentStatus = statusConfig[courseData.status];

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-14 border-b border-border bg-background">
        {/* Left: Back + Title */}
        <Button variant="ghost" size="icon-sm" render={<Link href="/courses" />} nativeButton={false}>
          <ChevronLeftIcon className="size-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setTitleDraft(courseData.title);
                  setEditingTitle(false);
                }
              }}
              className="font-semibold text-sm bg-transparent border-b-2 border-primary outline-none py-0.5 px-0 w-full max-w-xs"
            />
          ) : (
            <button
              onClick={() => {
                setTitleDraft(courseData.title);
                setEditingTitle(true);
              }}
              className="font-semibold text-sm truncate hover:text-primary transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) text-left"
              title="Click to edit title"
            >
              {courseData.title}
            </button>
          )}
          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* Center: Stats summary */}
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{modules.length} modules</span>
          <span className="text-muted-foreground/30">|</span>
          <span className="tabular-nums">{publishedLessons}/{totalLessons} lessons published</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Preview */}
          <Button variant="outline" size="sm" render={<Link href={`/course/${courseData.slug}`} target="_blank" />} nativeButton={false}>
            <EyeIcon className="size-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          {/* Publish / Unpublish */}
          {courseData.status === "DRAFT" && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={() => changeStatus("PUBLISHED")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              ) : (
                <CheckIcon className="size-3.5" />
              )}
              Publish
            </Button>
          )}
          {courseData.status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeStatus("DRAFT")}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              ) : (
                <CloudOffIcon className="size-3.5" />
              )}
              Unpublish
            </Button>
          )}
          {courseData.status === "ARCHIVED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeStatus("DRAFT")}
              disabled={statusLoading}
            >
              Restore to Draft
            </Button>
          )}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {courseData.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={() => changeStatus("ARCHIVED")}>
                  <ArchiveIcon className="size-4 mr-2" />
                  Archive Course
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2Icon className="size-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs wrapping everything below the top bar */}
      <Tabs defaultValue="curriculum" className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 border-b px-4">
          <TabsList variant="line">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="curriculum" className="flex flex-1 min-h-0">
          <StructurePanel
            modules={modules}
            selection={selection}
            onSelect={setSelection}
            onAddModule={addModule}
            onDeleteModule={deleteModule}
            onDuplicateModule={duplicateModule}
            onReorderModules={reorderModules}
            onAddLesson={addLesson}
            onDeleteLesson={deleteLesson}
            onDuplicateLesson={duplicateLesson}
            onReorderLessons={reorderLessons}
            onBulkPublish={bulkPublishLessons}
          />
          <EditingPanel
            course={courseData}
            modules={modules}
            selection={selection}
            categories={categories}
            redirectAfterSave={redirectAfterSave}
            onCourseUpdate={setCourseData}
            onModuleUpdate={updateModuleLocally}
            onLessonUpdate={updateLessonLocally}
          />
        </TabsContent>
        <TabsContent value="landing-page" className="flex-1 min-h-0">
          <PageBuilder
            saveEndpoint={`/api/courses/${courseData.id}`}
            savePayloadKey="landingPageSections"
            initialSections={courseData.landingPageSections as import("@/components/page-builder/schemas").PageSection[] | null}
            defaultSectionsConfig={{
              title: courseData.title,
              description: courseData.description,
              imageUrl: courseData.imageUrl,
            }}
            context={{
              courseId: courseData.id,
              instructor: { name: null, image: null, bio: null },
              modules: modules.map((m) => ({
                id: m.id,
                title: m.title,
                lessons: m.lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  type: l.type,
                  duration: l.duration,
                  isPublished: l.isPublished,
                })),
              })),
              price: courseData.price,
              compareAtPrice: courseData.compareAtPrice,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Permanently delete &ldquo;{courseData.title}&rdquo; and all its modules, lessons, and enrollments? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={deleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
