import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, description, content, videoUrl, duration, type, isPublished } = body;

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(content !== undefined && { content: content ?? null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl?.trim() ?? null }),
        ...(duration !== undefined && { duration: duration != null ? Number(duration) : null }),
        ...(type !== undefined && { type }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });
    return Response.json(lesson);
  } catch {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.lesson.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }
}
