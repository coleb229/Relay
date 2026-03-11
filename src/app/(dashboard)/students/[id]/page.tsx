import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { UserEditForm } from "@/components/users/UserEditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          course: true,
          progress: true,
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{user.name ?? user.email}</h1>
        <p className="text-muted-foreground">{user.email}</p>
        <Badge className="mt-1" variant="secondary">
          {user.role}
        </Badge>
      </div>

      {user.bio && !isAdmin && (
        <p className="text-sm text-muted-foreground">{user.bio}</p>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <UserEditForm
              user={{ id: user.id, name: user.name, bio: user.bio, role: user.role }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enrollment History ({user.enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {user.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lessons Completed</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.enrollments.map((enrollment) => {
                  const completedLessons = enrollment.progress.filter(
                    (p) => p.completedAt
                  ).length;

                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <Link
                          href={`/courses/${enrollment.course.id}`}
                          className="font-medium hover:underline"
                        >
                          {enrollment.course.title}
                        </Link>
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
                      <TableCell>{completedLessons} lessons</TableCell>
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
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
