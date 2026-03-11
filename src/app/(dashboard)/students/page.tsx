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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No users yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
                <TableCell>
                  <Badge variant="secondary">
                    {user._count.enrollments}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
