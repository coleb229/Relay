import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseEnrollmentsPage({ params }: Props) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          user: true,
          progress: { where: { completedAt: { not: null } } },
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!course) notFound();

  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId: id }, isPublished: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Enrollments — {course.title}</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {course.enrollments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No enrollments yet.
              </TableCell>
            </TableRow>
          ) : (
            course.enrollments.map((enrollment) => {
              const completedLessons = enrollment.progress.length;
              const progressPct =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0;

              return (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <Link
                      href={`/students/${enrollment.userId}`}
                      className="font-medium hover:underline"
                    >
                      {enrollment.user.name ?? enrollment.user.email}
                    </Link>
                    {enrollment.user.email && enrollment.user.name && (
                      <div className="text-xs text-muted-foreground">
                        {enrollment.user.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        enrollment.status === "COMPLETED"
                          ? "default"
                          : enrollment.status === "ACTIVE"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {progressPct}%
                    <span className="text-xs text-muted-foreground ml-1">
                      ({completedLessons}/{totalLessons} lessons)
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
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
