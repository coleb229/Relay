import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  EXPIRED: "outline",
  SUSPENDED: "destructive" as "outline",
};

export default async function EnrollmentsPage() {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
      _count: { select: { progress: true } },
    },
    take: 100,
  });

  // Get lesson counts for progress calculation
  const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
  const courseLessonCounts = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: {
      id: true,
      _count: {
        select: {
          modules: true,
        },
      },
      modules: {
        select: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  const lessonCountMap = new Map(
    courseLessonCounts.map((c) => [
      c.id,
      c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
    ])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <p className="text-muted-foreground mt-1">
          All student enrollments across courses
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No enrollments yet.
              </TableCell>
            </TableRow>
          ) : (
            enrollments.map((enrollment) => {
              const totalLessons = lessonCountMap.get(enrollment.courseId) ?? 0;
              const completedLessons = enrollment._count.progress;
              const progressPct =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0;

              return (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <Link
                      href={`/students/${enrollment.user.id}`}
                      className="font-medium hover:underline"
                    >
                      {enrollment.user.name ?? enrollment.user.email ?? "—"}
                    </Link>
                    {enrollment.user.name && (
                      <p className="text-sm text-muted-foreground">
                        {enrollment.user.email}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/courses/${enrollment.course.id}`}
                      className="hover:underline"
                    >
                      {enrollment.course.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[enrollment.status] ?? "outline"}>
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {completedLessons}/{totalLessons}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {enrollment.completedAt
                      ? new Date(enrollment.completedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
