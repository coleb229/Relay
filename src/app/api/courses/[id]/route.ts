import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a course",
    description:
      "Returns a single course by ID, including all modules and lessons in order.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Course MongoDB ObjectId",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Course object with nested modules and lessons" },
      401: { description: "Not authenticated" },
      404: { description: "Course not found" },
    },
  },
  PATCH: {
    summary: "Update a course",
    description: "Partially updates course fields. Requires ADMIN or INSTRUCTOR role.",
    adminOnly: true,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Course MongoDB ObjectId",
        required: true,
        type: "string",
      },
    ],
    requestBody: {
      description: "Fields to update (all optional)",
      fields: {
        title: { type: "string", description: "Course title" },
        slug: { type: "string", description: "URL-safe unique identifier" },
        description: { type: "string", description: "Course description" },
        status: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
          description: "Course status",
        },
        price: { type: "number", description: "Price in USD" },
        imageUrl: { type: "string", description: "URL to cover image" },
        tags: { type: "string[]", description: "Array of tag strings" },
      },
    },
    responses: {
      200: { description: "Updated course object" },
      400: { description: "Validation error" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Course not found" },
    },
  },
  DELETE: {
    summary: "Delete a course",
    description:
      "Permanently deletes a course and all associated modules, lessons, and enrollments. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Course MongoDB ObjectId",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Deletion confirmed" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Course not found" },
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
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(course);
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
  const body = await req.json();
  const { title, slug, description, status, price, imageUrl, tags } = body;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(tags !== undefined && { tags }),
      },
    });
    return Response.json(course);
  } catch {
    return Response.json({ error: "Course not found or slug conflict" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.course.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }
}
