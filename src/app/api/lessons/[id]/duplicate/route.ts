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

  const source = await prisma.lesson.findUnique({
    where: { id },
    include: {
      questions: { include: { options: true }, orderBy: { order: "asc" } },
      surveyQuestions: { include: { options: true }, orderBy: { order: "asc" } },
    },
  });

  if (!source) return Response.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.lesson.count({ where: { moduleId: source.moduleId } });

  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: source.moduleId,
      title: `${source.title} (Copy)`,
      description: source.description,
      content: source.content,
      videoUrl: source.videoUrl,
      order: count,
      duration: source.duration,
      type: source.type,
      isPublished: false,
      // Copy new type-specific fields
      fileUrl: source.fileUrl,
      fileName: source.fileName,
      fileSize: source.fileSize,
      audioUrl: source.audioUrl,
      embedCode: source.embedCode,
      meetingUrl: source.meetingUrl,
      meetingPlatform: source.meetingPlatform,
      scheduledAt: source.scheduledAt,
      recordingUrl: source.recordingUrl,
      assignmentType: source.assignmentType,
      maxScore: source.maxScore,
      dueDate: source.dueDate,
      allowLate: source.allowLate,
      instructions: source.instructions,
      scormPackageUrl: source.scormPackageUrl,
      scormVersion: source.scormVersion,
      scormEntryPoint: source.scormEntryPoint,
      discussionPrompt: source.discussionPrompt,
      ...(source.type === "QUIZ" && source.questions.length > 0
        ? {
            questions: {
              create: source.questions.map((q) => ({
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
      ...(source.type === "SURVEY" && source.surveyQuestions.length > 0
        ? {
            surveyQuestions: {
              create: source.surveyQuestions.map((q) => ({
                type: q.type,
                prompt: q.prompt,
                order: q.order,
                required: q.required,
                options: {
                  createMany: {
                    data: q.options.map((o) => ({
                      text: o.text,
                      order: o.order,
                    })),
                  },
                },
              })),
            },
          }
        : {}),
    },
  });

  return Response.json(newLesson, { status: 201 });
}
