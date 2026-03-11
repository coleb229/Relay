import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: questionId } = await params;
  const body = await req.json();
  const { options } = body as {
    options: { text: string; isCorrect: boolean; order: number }[];
  };

  await prisma.quizOption.deleteMany({ where: { questionId } });

  if (options && options.length > 0) {
    await prisma.quizOption.createMany({
      data: options.map((o) => ({
        questionId,
        text: o.text,
        isCorrect: o.isCorrect,
        order: o.order,
      })),
    });
  }

  const updatedOptions = await prisma.quizOption.findMany({
    where: { questionId },
    orderBy: { order: "asc" },
  });

  return Response.json({ options: updatedOptions });
}
