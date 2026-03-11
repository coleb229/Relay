import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateCourseDialog } from "@/components/course-builder/CreateCourseDialog";
import Link from "next/link";

export default async function CoursesPage() {
  const [session, courses] = await Promise.all([
    auth(),
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  const canCreate =
    session?.user.role === "ADMIN" || session?.user.role === "INSTRUCTOR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        {canCreate && session?.user.id && (
          <CreateCourseDialog instructorId={session.user.id} />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No courses yet.
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <Link
                    href={`/courses/${course.id}`}
                    className="font-medium hover:underline"
                  >
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {course.instructor.name ?? course.instructor.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      course.status === "PUBLISHED"
                        ? "default"
                        : course.status === "DRAFT"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>{course._count.enrollments}</TableCell>
                <TableCell>
                  {course.price != null
                    ? course.price === 0
                      ? "Free"
                      : `$${course.price.toFixed(2)}`
                    : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
