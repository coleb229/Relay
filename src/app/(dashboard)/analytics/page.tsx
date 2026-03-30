import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Users, CheckCircle2, Layers } from "lucide-react";

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

  const maxEnrollments = topCourses.length > 0
    ? Math.max(...topCourses.map((c) => c._count.enrollments), 1)
    : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your platform performance and student engagement"
      />

      <MetricGrid>
        <StatMetric label="Published Courses" value={publishedCourses} description={`${totalCourses} total`} icon={BookOpen} />
        <StatMetric label="Students" value={totalStudents} icon={Users} />
        <StatMetric label="Course Completion" value={`${completionRate}%`} description={`${completedEnrollments} / ${totalEnrollments} enrollments`} icon={CheckCircle2} />
        <StatMetric label="Lesson Completion" value={`${lessonCompletionRate}%`} description={`${completedLessonsCount} lesson completions`} icon={Layers} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Top Courses by Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          {topCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No published courses yet"
              description="Publish a course to see enrollment analytics."
              variant="inline"
            />
          ) : (
            <ul className="space-y-3">
              {topCourses.map((course, i) => {
                const barWidth = (course._count.enrollments / maxEnrollments) * 100;
                return (
                  <li key={course.id} className="flex items-center gap-3 text-sm">
                    <span className="flex items-center justify-center size-6 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{course.title}</span>
                        <span className="text-muted-foreground tabular-nums ml-2 shrink-0">
                          {course._count.enrollments} enrolled
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/20 transition-[width] duration-(--dur-layout) ease-(--ease-out-quart)"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
