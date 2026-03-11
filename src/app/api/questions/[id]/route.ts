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
  const { prompt, expectedAnswer, order } = body;

  try {
    const question = await prisma.quizQuestion.update({
      where: { id },
      data: {
        ...(prompt !== undefined && { prompt }),
        ...(expectedAnswer !== undefined && { expectedAnswer }),
        ...(order !== undefined && { order }),
      },
    });
    return Response.json(question);
  } catch {
    return Response.json({ error: "Question not found" }, { status: 404 });
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
    await prisma.quizQuestion.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }
}
