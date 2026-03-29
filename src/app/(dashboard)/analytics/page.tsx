import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const statCards = [
    {
      title: "Published Courses",
      value: publishedCourses,
      subtitle: `${totalCourses} total`,
      icon: BookOpen,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-600 dark:text-violet-400",
      gradient: "from-violet-500/15 to-purple-500/5",
    },
    {
      title: "Students",
      value: totalStudents,
      subtitle: null,
      icon: Users,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/15 to-cyan-500/5",
    },
    {
      title: "Course Completion Rate",
      value: `${completionRate}%`,
      subtitle: `${completedEnrollments} / ${totalEnrollments} enrollments`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500/15 to-green-500/5",
    },
    {
      title: "Lesson Completion Rate",
      value: `${lessonCompletionRate}%`,
      subtitle: `${completedLessonsCount} lesson completions`,
      icon: Layers,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/15 to-orange-500/5",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your platform performance and student engagement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.iconBg} rounded-lg p-2`}>
                <card.icon className={`size-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-3xl font-bold tracking-tight">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
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
              {topCourses.map((course, i) => {
                const barWidth = (course._count.enrollments / maxEnrollments) * 100;
                const rankColors = [
                  "bg-violet-600 dark:bg-violet-500",
                  "bg-blue-600 dark:bg-blue-500",
                  "bg-emerald-600 dark:bg-emerald-500",
                  "bg-amber-600 dark:bg-amber-500",
                  "bg-rose-600 dark:bg-rose-500",
                ];
                const barBgColors = [
                  "bg-violet-500/20",
                  "bg-blue-500/20",
                  "bg-emerald-500/20",
                  "bg-amber-500/20",
                  "bg-rose-500/20",
                ];

                return (
                  <li key={course.id} className="flex items-center gap-3 text-sm">
                    <span className={`flex items-center justify-center size-6 rounded-full text-[10px] font-bold text-white ${rankColors[i % rankColors.length]}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{course.title}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {course._count.enrollments} enrolled
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barBgColors[i % barBgColors.length]} transition-all`}
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
