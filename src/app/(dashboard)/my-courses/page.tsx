import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Clock } from "lucide-react";
import { getGradient } from "@/lib/course-utils";
import { cn } from "@/lib/utils";

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, image: true } },
          category: { select: { name: true, color: true } },
          modules: {
            include: {
              lessons: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      },
      progress: { select: { lessonId: true } },
    },
  });

  const enriched = enrollments.map((e) => {
    const totalLessons = e.course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
    const completedLessons = e.progress.length;
    const progressPct =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return { ...e, totalLessons, completedLessons, progressPct };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Continue where you left off
        </p>
      </div>

      {enriched.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="size-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-1">
              No courses yet
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              You haven&apos;t enrolled in any courses yet. Browse the catalog
              to find something that interests you.
            </p>
            <Button render={<Link href="/courses" />} nativeButton={false}>
              <BookOpen className="size-4" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enriched.map((item) => {
            const gradient = getGradient(item.course.title);

            return (
              <Link
                key={item.id}
                href={`/courses/${item.course.id}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                  {/* Cover */}
                  <div className="relative aspect-video overflow-hidden">
                    {item.course.imageUrl ? (
                      <Image
                        src={item.course.imageUrl}
                        alt={item.course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center bg-linear-to-br",
                          gradient
                        )}
                      >
                        <span className="text-3xl font-bold text-white/30">
                          {item.course.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Progress overlay */}
                    {item.progressPct === 100 && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                          Completed
                        </span>
                      </div>
                    )}

                    {item.course.category && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                item.course.category.color ?? "#8b5cf6",
                            }}
                          />
                          {item.course.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2 leading-snug">
                        {item.course.title}
                      </h3>
                      {item.course.instructor.name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.course.instructor.name}
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">
                          {item.completedLessons}/{item.totalLessons} lessons
                        </span>
                        <span className="text-xs font-medium tabular-nums">
                          {item.progressPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(item.enrolledAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-primary">
                        Continue Learning →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
