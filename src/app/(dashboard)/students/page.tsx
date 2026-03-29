import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Users, GraduationCap, BookOpen } from "lucide-react";

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  INSTRUCTOR: "secondary",
  STUDENT: "outline",
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  const totalUsers = users.length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const instructorCount = users.filter((u) => u.role === "INSTRUCTOR").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered users across your platform
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="bg-blue-500/15 rounded-lg p-2">
              <Users className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="bg-emerald-500/15 rounded-lg p-2">
              <GraduationCap className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{studentCount}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="bg-violet-500/15 rounded-lg p-2">
              <BookOpen className="size-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{instructorCount}</p>
              <p className="text-xs text-muted-foreground">Instructors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
            <Users className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No users yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Users will appear here once they sign up for your platform.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Enrollments</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/students/${user.id}`}
                    className="font-medium hover:underline"
                  >
                    {user.name ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role] ?? "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">
                    {user._count.enrollments}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
