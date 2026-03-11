import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const source = await prisma.module.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!source) return Response.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.module.count({ where: { courseId: source.courseId } });

  // Create module first, then lessons in a transaction
  const newModule = await prisma.module.create({
    data: {
      courseId: source.courseId,
      title: `${source.title} (Copy)`,
      description: source.description,
      order: count,
    },
  });

  const newLessons = await prisma.$transaction(
    source.lessons.map((lesson) =>
      prisma.lesson.create({
        data: {
          moduleId: newModule.id,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          duration: lesson.duration,
          type: lesson.type,
          isPublished: false,
          ...(lesson.type === "QUIZ" && lesson.questions.length > 0
            ? {
                questions: {
                  create: lesson.questions.map((q) => ({
                    type: q.type,
                    prompt: q.prompt,
                    order: q.order,
                    expectedAnswer: q.expectedAnswer,
                    options: {
                      createMany: {
                        data: q.options.map((o) => ({
                          text: o.text,
                          isCorrect: o.isCorrect,
                          order: o.order,
                        })),
                      },
                    },
                  })),
                },
              }
            : {}),
        },
      })
    )
  );

  return Response.json({ module: newModule, lessons: newLessons }, { status: 201 });
}
