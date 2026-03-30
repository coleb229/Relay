import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Users, GraduationCap, TrendingUp, Plus, BarChart3 } from "lucide-react";

export default async function DashboardPage() {
  const [session, courseCount, studentCount, enrollmentCount, recentCourses] =
    await Promise.all([
      auth(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.enrollment.count(),
      prisma.course.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const avgPerCourse = courseCount > 0 ? Math.round(enrollmentCount / courseCount) : 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description="Here's what's happening on your platform today."
      >
        <Button size="sm" render={<Link href="/courses" />}>
          <Plus className="size-3.5" />
          Create Course
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/analytics" />}>
          <BarChart3 className="size-3.5" />
          Analytics
        </Button>
      </PageHeader>

      {/* Stats */}
      <MetricGrid>
        <StatMetric label="Published Courses" value={courseCount} description="Active in catalog" icon={BookOpen} href="/courses" />
        <StatMetric label="Students" value={studentCount} description="Registered learners" icon={Users} href="/students" />
        <StatMetric label="Total Enrollments" value={enrollmentCount} description="Across all courses" icon={GraduationCap} href="/enrollments" />
        <StatMetric label="Avg. per Course" value={avgPerCourse} description="Students per course" icon={TrendingUp} href="/analytics" />
      </MetricGrid>

      {/* Recent courses */}
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
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Create your first course to get started."
            >
              <Button size="sm" render={<Link href="/courses" />}>
                <Plus className="size-3.5" />
                Create Course
              </Button>
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-between py-3.5 text-sm hover:text-primary transition-colors duration-(--dur-feedback) group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt="" className="size-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="size-4 text-primary/60" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium group-hover:text-primary truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.instructor?.name ?? "Unknown instructor"}
                        </p>
                      </div>
                    </div>
                    <span className="text-muted-foreground tabular-nums shrink-0 ml-4">
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
