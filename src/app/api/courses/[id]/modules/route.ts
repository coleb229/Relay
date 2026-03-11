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

  const { id: courseId } = await params;

  // Verify course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });

  const body = await req.json();
  const { title, description } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  // Set order to end of list
  const count = await prisma.module.count({ where: { courseId } });

  const module = await prisma.module.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() ?? null,
      order: count,
    },
  });

  return Response.json(module, { status: 201 });
}
