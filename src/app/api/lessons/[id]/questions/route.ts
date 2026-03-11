import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId: id },
    include: { options: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return Response.json(questions);
}

export async function POST(
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
  const { type, prompt, order } = body;

  if (!type || !prompt) {
    return Response.json({ error: "type and prompt are required" }, { status: 400 });
  }

  const question = await prisma.quizQuestion.create({
    data: {
      lessonId: id,
      type,
      prompt,
      order: order ?? 0,
    },
  });

  if (type === "TRUE_FALSE") {
    await prisma.quizOption.createMany({
      data: [
        { questionId: question.id, text: "True", isCorrect: true, order: 0 },
        { questionId: question.id, text: "False", isCorrect: false, order: 1 },
      ],
    });
  }

  const questionWithOptions = await prisma.quizQuestion.findUnique({
    where: { id: question.id },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return Response.json(questionWithOptions, { status: 201 });
}
