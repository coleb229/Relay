import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List survey responses",
    description:
      "Retrieves survey responses for a lesson. Admins/instructors see all responses with user info; students see only their own.",
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
      200: { description: "List of survey responses" },
      401: { description: "Not authenticated" },
      400: { description: "Lesson is not a survey" },
      404: { description: "Lesson not found" },
    },
  },
  POST: {
    summary: "Submit a survey response",
    description:
      "Creates a survey response for the authenticated user. Each user can only submit once per survey.",
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
      description: "Survey answers keyed by question ID",
      fields: {
        answers: {
          type: "object",
          description:
            "Object mapping question IDs to answers. Values can be strings, numbers, or arrays of strings depending on question type.",
        },
      },
    },
    responses: {
      201: { description: "Response submitted" },
      400: { description: "Lesson is not a survey" },
      401: { description: "Not authenticated" },
      404: { description: "Lesson not found" },
      409: { description: "User has already submitted this survey" },
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

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const responses = await prisma.surveyResponse.findMany({
    where: {
      lessonId: id,
      ...(!isAdmin && { userId: session.user.id }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return Response.json({ data: responses });
}

export async function POST(
  req: Request,
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

  const body = await req.json();
  const { answers } = body;

  try {
    const response = await prisma.surveyResponse.create({
      data: {
        lessonId: id,
        userId: session.user.id,
        answers: answers ?? {},
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return Response.json(response, { status: 201 });
  } catch {
    return Response.json(
      { error: "You have already submitted this survey" },
      { status: 409 }
    );
  }
}
