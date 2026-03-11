import { auth } from "../../../../../../auth";
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

  // Verify module exists
  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) return Response.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json();
  const { title, type } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  // Set order to end of list
  const count = await prisma.lesson.count({ where: { moduleId } });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: title.trim(),
      type: type ?? "TEXT",
      order: count,
      isPublished: false,
    },
  });

  return Response.json(lesson, { status: 201 });
}
