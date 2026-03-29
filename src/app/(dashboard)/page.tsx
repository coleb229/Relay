import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap, TrendingUp, Plus, BarChart3, Settings } from "lucide-react";

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

  const stats = [
    {
      label: "Published Courses",
      value: courseCount,
      description: "Active in catalog",
      icon: BookOpen,
      href: "/courses",
      gradient: "from-violet-500/15 to-purple-500/5",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/15",
    },
    {
      label: "Students",
      value: studentCount,
      description: "Registered learners",
      icon: Users,
      href: "/students",
      gradient: "from-emerald-500/15 to-teal-500/5",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15",
    },
    {
      label: "Total Enrollments",
      value: enrollmentCount,
      description: "Across all courses",
      icon: GraduationCap,
      href: "/enrollments",
      gradient: "from-blue-500/15 to-cyan-500/5",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15",
    },
    {
      label: "Avg. per Course",
      value: courseCount > 0 ? Math.round(enrollmentCount / courseCount) : 0,
      description: "Students per course",
      icon: TrendingUp,
      href: "/analytics",
      gradient: "from-amber-500/15 to-orange-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.25_0.06_275)] via-[oklch(0.2_0.04_275)] to-[oklch(0.15_0.03_275)] p-8 text-white">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[oklch(0.75_0.14_80)] opacity-10 blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[oklch(0.5_0.2_275)] opacity-15 blur-[60px]" />
        {/* Background pattern */}
        <img src="/images/ui/dashboard-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-white/75 mt-1 text-sm">
            Here&apos;s what&apos;s happening on your platform today.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md border-0" render={<Link href="/courses" />}>
              <Plus className="size-3.5 mr-1.5" />
              Create Course
            </Button>
            {/* Hero is always dark — white text is intentional regardless of theme */}
            <Button size="sm" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white" render={<Link href="/analytics" />}>
              <BarChart3 className="size-3.5 mr-1.5" />
              Analytics
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white" render={<Link href="/students" />}>
              <Users className="size-3.5 mr-1.5" />
              Manage Users
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, description, icon: Icon, href, gradient, iconColor, iconBg }) => (
          <Link key={label} href={href}>
            <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none`} />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <div className={`${iconBg} rounded-lg p-2`}>
                  <Icon className={`size-4 ${iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-3">
                <BookOpen className="size-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium">No courses yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first course to get started.</p>
              <Button size="sm" className="mt-4" render={<Link href="/courses" />}>
                <Plus className="size-3.5 mr-1.5" />
                Create Course
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-between py-3.5 text-sm hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail */}
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt="" className="size-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="size-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
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
