import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { name, bio, role } = await req.json();

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name ?? null }),
        ...(bio !== undefined && { bio: bio ?? null }),
        ...(role !== undefined && { role }),
      },
      select: { id: true, name: true, email: true, bio: true, role: true },
    });
    return Response.json(user);
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
}
