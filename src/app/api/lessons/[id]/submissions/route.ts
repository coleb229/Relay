import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List assignment submissions",
    description:
      "Retrieves all submissions for an assignment lesson. Admins/instructors see all submissions; students see only their own.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be ASSIGNMENT type)",
      },
    ],
    responses: {
      200: { description: "List of submissions" },
      401: { description: "Not authenticated" },
      404: { description: "Lesson not found or not an assignment" },
    },
  },
  POST: {
    summary: "Submit an assignment",
    description:
      "Creates a new assignment submission for the authenticated student. Supports text content and/or file uploads.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be ASSIGNMENT type)",
      },
    ],
    requestBody: {
      description: "Assignment submission data",
      fields: {
        content: { type: "string", description: "Text submission content" },
        fileUrl: { type: "string", description: "URL of uploaded file" },
        fileName: { type: "string", description: "Original file name" },
        fileSize: { type: "number", description: "File size in bytes" },
      },
    },
    responses: {
      201: { description: "Submission created" },
      400: { description: "Invalid submission (lesson is not ASSIGNMENT type)" },
      401: { description: "Not authenticated" },
      404: { description: "Lesson not found" },
      422: { description: "Submission deadline passed or missing content" },
    },
  },
};

// GET /api/lessons/[id]/submissions — list submissions
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
  if (lesson.type !== "ASSIGNMENT") {
    return Response.json({ error: "Lesson is not an assignment" }, { status: 400 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      lessonId: id,
      ...(!isAdmin && { userId: session.user.id }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      gradedBy: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return Response.json({ data: submissions });
}

// POST /api/lessons/[id]/submissions — submit assignment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, type: true, dueDate: true, allowLate: true },
  });
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  if (lesson.type !== "ASSIGNMENT") {
    return Response.json({ error: "Lesson is not an assignment" }, { status: 400 });
  }

  // Check due date
  if (lesson.dueDate && !lesson.allowLate && new Date() > lesson.dueDate) {
    return Response.json({ error: "Submission deadline has passed" }, { status: 422 });
  }

  const body = await req.json();
  const { content, fileUrl, fileName, fileSize } = body;

  if (!content && !fileUrl) {
    return Response.json({ error: "Submission must include content or a file" }, { status: 422 });
  }

  const submission = await prisma.assignmentSubmission.create({
    data: {
      lessonId: id,
      userId: session.user.id,
      content: content?.trim() ?? null,
      fileUrl: fileUrl?.trim() ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize != null ? Number(fileSize) : null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return Response.json(submission, { status: 201 });
}
