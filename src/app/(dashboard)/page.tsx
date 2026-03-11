import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const [courseCount, studentCount, enrollmentCount, recentCourses] =
    await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.enrollment.count(),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

  const stats = [
    {
      label: "Published Courses",
      value: courseCount,
      description: "Active in catalog",
      icon: BookOpen,
      href: "/courses",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Students",
      value: studentCount,
      description: "Registered learners",
      icon: Users,
      href: "/students",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Enrollments",
      value: enrollmentCount,
      description: "Across all courses",
      icon: GraduationCap,
      href: "/students",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Avg. per Course",
      value: courseCount > 0 ? Math.round(enrollmentCount / courseCount) : 0,
      description: "Students per course",
      icon: TrendingUp,
      href: "/analytics",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your LMS platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, description, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <div className={`${bg} rounded-lg p-2`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Courses</CardTitle>
          <Link
            href="/courses"
            className="text-sm text-primary hover:underline font-medium"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No published courses yet.</p>
              <Link
                href="/courses"
                className="mt-2 text-sm text-primary hover:underline"
              >
                Create your first course
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-between py-3 text-sm hover:text-primary transition-colors group"
                  >
                    <span className="font-medium group-hover:text-primary">
                      {course.title}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {course._count.enrollments}{" "}
                      {course._count.enrollments === 1 ? "student" : "students"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
