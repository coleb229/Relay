import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PencilIcon } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const totalLessons = course.modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <Badge
              variant={course.status === "PUBLISHED" ? "default" : "secondary"}
            >
              {course.status}
            </Badge>
          </div>
          {course.description && (
            <p className="text-muted-foreground mt-1">{course.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Instructor:{" "}
            <span className="font-medium">
              {course.instructor.name ?? course.instructor.email}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {course.price != null && (
            <span className="text-xl font-semibold">
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </span>
          )}
          {(session?.user.role === "ADMIN" || session?.user.role === "INSTRUCTOR") && (
            <Link href={`/courses/${course.id}/edit`}>
              <Button size="sm" variant="outline">
                <PencilIcon className="size-4" />
                Edit Course
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/courses/${course.id}/enrollments`}
              className="text-2xl font-bold hover:underline"
            >
              {course._count.enrollments}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.modules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Curriculum</h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules yet.</p>
        ) : (
          course.modules.map((mod) => (
            <Card key={mod.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {mod.order + 1}. {mod.title}
                </CardTitle>
                {mod.description && (
                  <p className="text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {mod.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No lessons yet.
                  </p>
                ) : (
                  <ol className="space-y-1">
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 text-sm py-1"
                      >
                        <span className="text-muted-foreground w-5">
                          {lesson.order + 1}.
                        </span>
                        <span className="flex-1 font-medium">
                          {lesson.title}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {lesson.type.toLowerCase()}
                        </Badge>
                        {!lesson.isPublished && (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                        {lesson.duration && (
                          <span className="text-muted-foreground text-xs">
                            {Math.round(lesson.duration / 60)} min
                          </span>
                        )}
                        <Link
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View
                        </Link>
                        {lesson.type === "QUIZ" &&
                          (session?.user.role === "ADMIN" ||
                            session?.user.role === "INSTRUCTOR") && (
                            <Link
                              href={`/courses/${course.id}/quiz-results/${lesson.id}`}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Results
                            </Link>
                          )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
