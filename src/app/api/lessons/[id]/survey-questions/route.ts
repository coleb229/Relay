import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List survey questions",
    description:
      "Retrieves all questions for a survey lesson, ordered by position. Includes options for MULTIPLE_CHOICE and CHECKBOX types.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be SURVEY type)",
      },
    ],
    responses: {
      200: { description: "List of survey questions with options" },
      401: { description: "Not authenticated" },
      404: { description: "Lesson not found or not a survey" },
    },
  },
  POST: {
    summary: "Create a survey question",
    description:
      "Adds a new question to a survey lesson. Admins and instructors only. For MULTIPLE_CHOICE and CHECKBOX types, include options.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be SURVEY type)",
      },
    ],
    requestBody: {
      description: "Survey question data",
      fields: {
        type: {
          type: "string",
          enum: ["TEXT", "RATING", "MULTIPLE_CHOICE", "CHECKBOX", "SCALE"],
          description: "Question type",
        },
        prompt: { type: "string", description: "Question text" },
        required: { type: "boolean", description: "Whether the question is required" },
        options: {
          type: "array",
          description: "Options for MULTIPLE_CHOICE/CHECKBOX types: [{ text: string }]",
        },
      },
    },
    responses: {
      201: { description: "Question created" },
      400: { description: "Lesson is not a survey" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized (admin/instructor only)" },
      404: { description: "Lesson not found" },
    },
  },
  PATCH: {
    summary: "Update survey questions (batch)",
    description:
      "Batch-updates survey questions for a lesson. Accepts an array of questions with their IDs, updated fields, and options. Questions not included are deleted.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be SURVEY type)",
      },
    ],
    requestBody: {
      description: "Array of survey questions to upsert",
      fields: {
        questions: {
          type: "array",
          description:
            "Array of { id?, type, prompt, order, required, options?: { text }[] }",
        },
      },
    },
    responses: {
      200: { description: "Questions updated" },
      400: { description: "Lesson is not a survey" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized (admin/instructor only)" },
      404: { description: "Lesson not found" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, type: true },
  });
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.type !== "SURVEY") {
    return Response.json({ error: "Lesson is not a survey" }, { status: 400 });
  }

  const questions = await prisma.surveyQuestion.findMany({
    where: { lessonId: id },
    include: { options: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return Response.json({ data: questions });
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

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, type: true },
  });
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.type !== "SURVEY") {
    return Response.json({ error: "Lesson is not a survey" }, { status: 400 });
  }

  const body = await req.json();
  const { type, prompt, required, options } = body;

  const count = await prisma.surveyQuestion.count({ where: { lessonId: id } });

  const question = await prisma.surveyQuestion.create({
    data: {
      lessonId: id,
      type,
      prompt,
      order: count,
      required: required ?? false,
      ...(options?.length > 0 && {
        options: {
          createMany: {
            data: options.map((o: { text: string }, i: number) => ({
              text: o.text,
              order: i,
            })),
          },
        },
      }),
    },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return Response.json(question, { status: 201 });
}

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

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, type: true },
  });
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.type !== "SURVEY") {
    return Response.json({ error: "Lesson is not a survey" }, { status: 400 });
  }

  const body = await req.json();
  const { questions } = body as {
    questions: {
      id?: string;
      type: string;
      prompt: string;
      order: number;
      required: boolean;
      options?: { text: string }[];
    }[];
  };

  // Delete all existing and recreate (simpler than diffing)
  await prisma.surveyQuestion.deleteMany({ where: { lessonId: id } });

  const created = await Promise.all(
    questions.map((q) =>
      prisma.surveyQuestion.create({
        data: {
          lessonId: id,
          type: q.type as "TEXT" | "RATING" | "MULTIPLE_CHOICE" | "CHECKBOX" | "SCALE",
          prompt: q.prompt,
          order: q.order,
          required: q.required ?? false,
          ...(q.options?.length
            ? {
                options: {
                  createMany: {
                    data: q.options.map((o, i) => ({
                      text: o.text,
                      order: i,
                    })),
                  },
                },
              }
            : {}),
        },
        include: { options: { orderBy: { order: "asc" } } },
      })
    )
  );

  return Response.json({ data: created });
}
