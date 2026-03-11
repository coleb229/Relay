import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { lessonIds, isPublished } = await req.json();

  if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
    return Response.json({ error: "lessonIds must be a non-empty array" }, { status: 400 });
  }
  if (typeof isPublished !== "boolean") {
    return Response.json({ error: "isPublished must be a boolean" }, { status: 400 });
  }

  const result = await prisma.lesson.updateMany({
    where: { id: { in: lessonIds } },
    data: { isPublished },
  });

  return Response.json({ updated: result.count });
}
