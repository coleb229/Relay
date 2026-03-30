import Image from "next/image";
import {
  Users,
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getGradient, formatPrice } from "@/lib/course-utils";
import { EnrollButton } from "./EnrollButton";
import { PublicEnrollButton } from "./PublicEnrollButton";
import { CurriculumPreview } from "./CurriculumPreview";
import { InstructorCard } from "./InstructorCard";
import { SectionRenderer } from "@/components/page-builder/renderers/SectionRenderer";
import type { PageSection } from "@/components/page-builder/schemas";

interface CourseLandingProps {
  course: {
    id: string;
    slug?: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    compareAtPrice?: number | null;
    tags: string[];
    category: { name: string; color: string | null } | null;
    instructor: {
      id: string;
      name: string | null;
      image: string | null;
      bio: string | null;
    };
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
    _count: { enrollments: number };
    landingPageSections?: unknown[] | null;
  };
  enrollment: {
    id: string;
    status: string;
    progress: { lessonId: string }[];
  } | null;
  instructorCourseCount: number;
  isPublic?: boolean;
}

export function CourseLanding({
  course,
  enrollment,
  instructorCourseCount,
  isPublic,
}: CourseLandingProps) {
  const publishedLessons = course.modules.flatMap((m) =>
    m.lessons.filter((l) => l.isPublished)
  );
  const totalLessons = publishedLessons.length;
  const totalDuration = publishedLessons.reduce(
    (sum, l) => sum + (l.duration ?? 0),
    0
  );
  const totalDurationMin = Math.round(totalDuration / 60);

  const completedLessonIds = new Set(
    enrollment?.progress.map((p) => p.lessonId) ?? []
  );

  const enrollmentForButton = enrollment
    ? {
        id: enrollment.id,
        status: enrollment.status,
        progressCount: completedLessonIds.size,
        totalLessons,
      }
    : null;

  const gradient = getGradient(course.title);

  // ── Dynamic page-builder layout ──────────────────────────────────
  const sections = (course.landingPageSections ?? []) as PageSection[];

  if (sections.length > 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — dynamic sections */}
        <div className="lg:col-span-2 space-y-0">
          {sections
            .filter((s) => s.visible)
            .map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                context={{
                  courseId: course.id,
                  modules: course.modules,
                  instructor: {
                    ...course.instructor,
                    courseCount: instructorCourseCount,
                  },
                  enrolled: !!enrollment,
                  completedLessonIds,
                  price: course.price,
                  compareAtPrice: course.compareAtPrice,
                }}
              />
            ))}
        </div>

        {/* Right column — sticky enrollment sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <p className="text-3xl font-bold">
                  {formatPrice(course.price)}
                </p>

                {isPublic ? (
                  <PublicEnrollButton courseId={course.id} price={course.price} />
                ) : (
                  <EnrollButton
                    courseId={course.id}
                    price={course.price}
                    enrollment={enrollmentForButton}
                  />
                )}

                <Separator />

                <div className="space-y-3">
                  <MetaRow icon={Layers} label="Modules" value={course.modules.length} />
                  <MetaRow icon={BookOpen} label="Lessons" value={totalLessons} />
                  {totalDurationMin > 0 && (
                    <MetaRow icon={Clock} label="Duration" value={`${totalDurationMin} min`} />
                  )}
                  <MetaRow
                    icon={Users}
                    label="Enrolled"
                    value={course._count.enrollments}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Static fallback layout ───────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${gradient}`}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {course.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                  {course.category.color && (
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: course.category.color }}
                    />
                  )}
                  {course.category.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
            <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {course.instructor.image ? (
                  <img
                    src={course.instructor.image}
                    alt=""
                    className="size-5 rounded-full"
                  />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                    {(course.instructor.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                {course.instructor.name ?? "Instructor"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {course._count.enrollments} enrolled
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {totalLessons} lessons
              </span>
              {totalDurationMin > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {totalDurationMin} min
                </span>
              )}
            </div>
          </div>
        </div>

        {/* About This Course */}
        {course.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                About This Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* What You'll Learn */}
        {course.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                What You&apos;ll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.tags.map((tag) => (
                  <div key={tag} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm">{tag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Curriculum */}
        {course.modules.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Curriculum
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {course.modules.length} modules &middot; {totalLessons} lessons
              </span>
            </CardHeader>
            <CardContent>
              <CurriculumPreview
                modules={course.modules}
                courseId={course.id}
                enrolled={!!enrollment}
                completedLessonIds={completedLessonIds}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <InstructorCard
              instructor={{
                name: course.instructor.name,
                image: course.instructor.image,
                bio: course.instructor.bio,
                courseCount: instructorCourseCount,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right column — sticky sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-20">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <p className="text-3xl font-bold">
                {formatPrice(course.price)}
              </p>

              {isPublic ? (
                <PublicEnrollButton courseId={course.id} price={course.price} />
              ) : (
                <EnrollButton
                  courseId={course.id}
                  price={course.price}
                  enrollment={enrollmentForButton}
                />
              )}

              <Separator />

              <div className="space-y-3">
                <MetaRow icon={Layers} label="Modules" value={course.modules.length} />
                <MetaRow icon={BookOpen} label="Lessons" value={totalLessons} />
                {totalDurationMin > 0 && (
                  <MetaRow icon={Clock} label="Duration" value={`${totalDurationMin} min`} />
                )}
                <MetaRow
                  icon={Users}
                  label="Enrolled"
                  value={course._count.enrollments}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
