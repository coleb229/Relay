import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: moduleId } = await params;
  const body = await req.json();
  const { lessonIds } = body as { lessonIds: string[] };

  if (!Array.isArray(lessonIds)) {
    return Response.json({ error: "lessonIds must be an array" }, { status: 400 });
  }

  await prisma.$transaction(
    lessonIds.map((lessonId, index) =>
      prisma.lesson.updateMany({
        where: { id: lessonId, moduleId },
        data: { order: index },
      })
    )
  );

  return Response.json({ ok: true });
}
