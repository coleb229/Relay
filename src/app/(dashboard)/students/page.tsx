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
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";
import { EmptyState } from "@/components/ui/empty-state";

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
      <PageHeader
        title="Users"
        description="Manage all registered users across your platform"
      />

      <MetricGrid>
        <StatMetric label="Total Users" value={totalUsers} icon={Users} />
        <StatMetric label="Students" value={studentCount} icon={GraduationCap} />
        <StatMetric label="Instructors" value={instructorCount} icon={BookOpen} />
      </MetricGrid>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Users will appear here once they sign up for your platform."
        />
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
