import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const [
    totalCourses,
    publishedCourses,
    totalStudents,
    totalEnrollments,
    completedEnrollments,
    totalLessons,
    completedLessonsCount,
    topCourses,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: "COMPLETED" } }),
    prisma.lesson.count({ where: { isPublished: true } }),
    prisma.progress.count({ where: { completedAt: { not: null } } }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  const completionRate =
    totalEnrollments > 0
      ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
      : "0.0";

  const lessonCompletionRate =
    totalLessons > 0 && totalEnrollments > 0
      ? ((completedLessonsCount / (totalLessons * totalEnrollments)) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">{totalCourses} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Course Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedEnrollments} / {totalEnrollments} enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lesson Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedLessonsCount} lesson completions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Courses by Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          {topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published courses yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {topCourses.map((course, i) => (
                <li
                  key={course.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-muted-foreground w-4">{i + 1}.</span>
                  <span className="flex-1 font-medium">{course.title}</span>
                  <span className="text-muted-foreground">
                    {course._count.enrollments} enrolled
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
