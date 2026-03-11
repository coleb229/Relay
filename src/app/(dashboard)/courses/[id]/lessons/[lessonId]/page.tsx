import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../../auth";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { QuizView } from "@/components/quiz/QuizView";
import { ChevronLeftIcon } from "lucide-react";

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const [{ id, lessonId }, session] = await Promise.all([params, auth()]);

  if (!session) redirect("/");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      module: { select: { courseId: true, title: true } },
    },
  });

  if (!lesson || lesson.module.courseId !== id) notFound();

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  if (!isStaff) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
    });
    if (!enrollment) redirect(`/courses/${id}`);
  }

  // Fetch latest attempt for QUIZ lessons
  let latestAttempt: {
    score: number;
    answers: Array<{
      questionId: string;
      isCorrect: boolean;
      selectedOptionId: string | null;
      textAnswer: string | null;
    }>;
  } | null = null;

  if (lesson.type === "QUIZ" && session.user.id) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: { lessonId, userId: session.user.id },
      orderBy: { submittedAt: "desc" },
      include: { answers: true },
    });

    if (attempt) {
      latestAttempt = {
        score: attempt.score,
        answers: attempt.answers.map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          selectedOptionId: a.selectedOptionId,
          textAnswer: a.textAnswer,
        })),
      };
    }
  }

  const typeLabel =
    lesson.type === "QUIZ"
      ? "Quiz"
      : lesson.type === "VIDEO"
      ? "Video"
      : "Text";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/courses/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Back to course
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge variant="outline" className="text-xs capitalize">
            {typeLabel}
          </Badge>
          {!lesson.isPublished && (
            <Badge variant="secondary" className="text-xs">
              Draft
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Module: {lesson.module.title}
        </p>
        {lesson.description && (
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {/* Content */}
      {lesson.type === "QUIZ" && (
        <QuizView
          lessonId={lessonId}
          questions={lesson.questions.map((q) => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            expectedAnswer: q.expectedAnswer,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          }))}
          latestAttempt={latestAttempt}
        />
      )}

      {lesson.type === "TEXT" && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content ?? "" }}
        />
      )}

      {lesson.type === "VIDEO" && (
        <div className="space-y-2">
          {lesson.videoUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No video URL provided.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
