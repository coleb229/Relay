import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { AttemptAnswerInput, GradedAnswer } from "@/lib/quiz";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  if (isStaff) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { lessonId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { submittedAt: "desc" },
    });
    return Response.json(attempts);
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { lessonId: id, userId: session.user.id },
    orderBy: { submittedAt: "desc" },
  });
  return Response.json(attempts);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const body = await req.json();
  const { answers: rawAnswers } = body as { answers: AttemptAnswerInput[] };

  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId },
    include: { options: true },
  });

  const gradedAnswers: GradedAnswer[] = [];
  let correctCount = 0;

  for (const question of questions) {
    const submitted = rawAnswers.find((a) => a.questionId === question.id);
    let isCorrect = false;
    let selectedOptionId: string | null = null;
    let textAnswer: string | null = null;

    if (submitted) {
      if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
        selectedOptionId = submitted.selectedOptionId ?? null;
        const matchedOption = question.options.find(
          (o) => o.id === selectedOptionId
        );
        isCorrect = matchedOption?.isCorrect ?? false;
      } else if (question.type === "SHORT_ANSWER") {
        textAnswer = submitted.textAnswer ?? null;
        if (question.expectedAnswer && textAnswer) {
          isCorrect =
            textAnswer.trim().toLowerCase() ===
            question.expectedAnswer.trim().toLowerCase();
        }
      }
    }

    if (isCorrect) correctCount++;

    gradedAnswers.push({
      questionId: question.id,
      isCorrect,
      selectedOptionId,
      textAnswer,
    });
  }

  const score = questions.length > 0 ? correctCount / questions.length : 0;

  const attempt = await prisma.quizAttempt.create({
    data: {
      lessonId,
      userId: session.user.id,
      score,
      answers: {
        createMany: {
          data: gradedAnswers.map((a) => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            selectedOptionId: a.selectedOptionId ?? null,
            textAnswer: a.textAnswer ?? null,
          })),
        },
      },
    },
    include: { answers: true },
  });

  // Upsert progress
  try {
    const lessonWithModule = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    });

    if (lessonWithModule) {
      const courseId = lessonWithModule.module.courseId;
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId } },
      });

      if (enrollment) {
        await prisma.progress.upsert({
          where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
          create: { enrollmentId: enrollment.id, lessonId, completedAt: new Date() },
          update: { completedAt: new Date() },
        });
      }
    }
  } catch {
    // Skip progress upsert on error
  }

  return Response.json({
    id: attempt.id,
    score: attempt.score,
    submittedAt: attempt.submittedAt.toISOString(),
    answers: attempt.answers.map((a) => ({
      questionId: a.questionId,
      isCorrect: a.isCorrect,
      selectedOptionId: a.selectedOptionId,
      textAnswer: a.textAnswer,
    })),
  });
}
