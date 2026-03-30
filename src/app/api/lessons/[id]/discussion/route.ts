import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List discussion posts",
    description:
      "Retrieves all top-level discussion posts for a lesson, including nested replies (one level deep) and reaction counts. Ordered by newest first.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be DISCUSSION type)",
      },
    ],
    responses: {
      200: { description: "List of discussion posts with replies and reactions" },
      401: { description: "Not authenticated" },
      400: { description: "Lesson is not a discussion" },
      404: { description: "Lesson not found" },
    },
  },
  POST: {
    summary: "Create a discussion post",
    description:
      "Creates a new discussion post or reply. Any authenticated user enrolled in the course (or admin/instructor) can post.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID (must be DISCUSSION type)",
      },
    ],
    requestBody: {
      description: "Discussion post content",
      fields: {
        content: { type: "string", description: "Post content (supports markdown)" },
        parentId: {
          type: "string",
          description: "Parent post ID for replies (omit for top-level posts)",
        },
      },
    },
    responses: {
      201: { description: "Post created" },
      400: { description: "Lesson is not a discussion or missing content" },
      401: { description: "Not authenticated" },
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
  if (lesson.type !== "DISCUSSION") {
    return Response.json({ error: "Lesson is not a discussion" }, { status: 400 });
  }

  const posts = await prisma.discussionPost.findMany({
    where: { lessonId: id, parentId: null },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      reactions: true,
      replies: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          reactions: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: posts });
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
  if (lesson.type !== "DISCUSSION") {
    return Response.json({ error: "Lesson is not a discussion" }, { status: 400 });
  }

  const body = await req.json();
  const { content, parentId } = body;

  if (!content?.trim()) {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.discussionPost.create({
    data: {
      lessonId: id,
      userId: session.user.id,
      content: content.trim(),
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      reactions: true,
      replies: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          reactions: true,
        },
      },
    },
  });

  return Response.json(post, { status: 201 });
}
