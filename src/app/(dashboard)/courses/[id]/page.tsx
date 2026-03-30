import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Pencil,
  ExternalLink,
  Layers,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { getGradient, LESSON_TYPE_ICON, LESSON_TYPE_COLOR } from "@/lib/course-utils";
import { CourseLanding } from "@/components/catalog/CourseLanding";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  if (!session) redirect("/login");

  // ── Student view: learner landing page ────────────────────────────
  if (session.user.role === "STUDENT") {
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        price: true,
        compareAtPrice: true,
        tags: true,
        status: true,
        landingPageSections: true,
        instructor: { select: { id: true, name: true, email: true, image: true, bio: true } },
        category: { select: { id: true, name: true, color: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course || course.status !== "PUBLISHED") redirect("/courses");

    // Get student's enrollment and progress
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
      include: { progress: { select: { lessonId: true } } },
    });

    // Get instructor's course count
    const instructorCourseCount = await prisma.course.count({
      where: { instructorId: course.instructor.id, status: "PUBLISHED" },
    });

    return (
      <CourseLanding
        course={{
          ...course,
          landingPageSections: course.landingPageSections as unknown[] | null,
        }}
        enrollment={enrollment}
        instructorCourseCount={instructorCourseCount}
      />
    );
  }

  // ── Admin/Instructor view: existing detail page ───────────────────
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, email: true, image: true } },
      category: { select: { id: true, name: true, color: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
      enrollments: {
        select: {
          progress: { select: { id: true } },
        },
      },
    },
  });

  if (!course) notFound();

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const publishedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isPublished).length,
    0
  );
  const totalProgress = course.enrollments.reduce((sum, e) => sum + e.progress.length, 0);
  const maxProgress = course._count.enrollments * totalLessons;
  const avgCompletion = maxProgress > 0 ? Math.round((totalProgress / maxProgress) * 100) : 0;
  const revenue = course.price ? course.price * course._count.enrollments : 0;

  const isEditable = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const statusConfig = {
    DRAFT: { label: "Draft", classes: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
    PUBLISHED: { label: "Published", classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
    ARCHIVED: { label: "Archived", classes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-zinc-500/20" },
  };

  const status = statusConfig[course.status];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border">
        <div className="relative h-48 sm:h-56">
          {course.imageUrl ? (
            <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${getGradient(course.title)}`} />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 -mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.classes}`}>
                  {status.label}
                </span>
                {course.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                    {course.category.color && (
                      <span className="size-2 rounded-full" style={{ backgroundColor: course.category.color }} />
                    )}
                    {course.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">{course.description}</p>
              )}
            </div>

            {isEditable && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  render={<Link href={`/course/${course.slug}`} target="_blank" />}
                  nativeButton={false}
                >
                  <ExternalLink className="size-3.5 mr-1.5" />
                  Preview
                </Button>
                <Button render={<Link href={`/courses/${course.id}/edit`} />} nativeButton={false}>
                  <Pencil className="size-3.5 mr-1.5" />
                  Edit Course
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrollments" value={course._count.enrollments} icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-500/10" />
        <StatCard label="Published Lessons" value={`${publishedLessons}/${totalLessons}`} icon={BookOpen} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard label="Avg. Completion" value={`${avgCompletion}%`} icon={CheckCircle2} color="text-violet-600 dark:text-violet-400" bg="bg-violet-500/10" />
        <StatCard label="Revenue" value={revenue > 0 ? `$${revenue.toFixed(0)}` : "Free"} icon={DollarSign} color="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" />
      </div>

      {/* Curriculum + Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Curriculum */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Curriculum</CardTitle>
              <span className="text-xs text-muted-foreground">
                {course.modules.length} modules &middot; {totalLessons} lessons
              </span>
            </CardHeader>
            <CardContent>
              {course.modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers className="size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No modules yet.</p>
                  {isEditable && (
                    <Button size="sm" variant="outline" className="mt-3" render={<Link href={`/courses/${course.id}/edit`} />} nativeButton={false}>
                      Start Building
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {course.modules.map((mod, i) => (
                    <div key={mod.id} className="rounded-lg border border-border overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                        <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm font-medium flex-1 truncate">{mod.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
                        </span>
                      </div>
                      {mod.lessons.length > 0 && (
                        <div className="divide-y divide-border">
                          {mod.lessons.map((lesson) => {
                            const TypeIcon = LESSON_TYPE_ICON[lesson.type] ?? FileText;
                            return (
                              <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                <TypeIcon className={`size-3.5 shrink-0 ${LESSON_TYPE_COLOR[lesson.type]}`} />
                                <span className="flex-1 truncate">{lesson.title}</span>
                                {lesson.duration != null && lesson.duration > 0 && (
                                  <span className="text-xs text-muted-foreground">{Math.round(lesson.duration / 60)} min</span>
                                )}
                                {lesson.isPublished ? (
                                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="size-3.5 text-muted-foreground/30 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow icon={Users} label="Instructor">
                <div className="flex items-center gap-2">
                  {course.instructor.image && (
                    <img src={course.instructor.image} alt="" className="size-5 rounded-full" />
                  )}
                  <span className="text-sm">{course.instructor.name ?? "Unknown"}</span>
                </div>
              </DetailRow>

              <DetailRow icon={DollarSign} label="Price">
                <span className="text-sm">
                  {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                </span>
              </DetailRow>

              {course.category && (
                <DetailRow icon={Tag} label="Category">
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    {course.category.color && (
                      <span className="size-2 rounded-full" style={{ backgroundColor: course.category.color }} />
                    )}
                    {course.category.name}
                  </span>
                </DetailRow>
              )}

              <DetailRow icon={Calendar} label="Created">
                <span className="text-sm">{new Date(course.createdAt).toLocaleDateString()}</span>
              </DetailRow>

              <DetailRow icon={Calendar} label="Updated">
                <span className="text-sm">{new Date(course.updatedAt).toLocaleDateString()}</span>
              </DetailRow>

              {course.tags.length > 0 && (
                <DetailRow icon={Tag} label="Tags">
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </DetailRow>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: string;
  bg: string;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
          </div>
          <div className={`${bg} rounded-lg p-2.5`}>
            <Icon className={`size-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon: Icon, label, children }: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}
