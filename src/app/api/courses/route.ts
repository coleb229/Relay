import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List courses",
    description:
      "Returns a paginated list of courses. Optionally filter by status. Results include the instructor name and enrollment count.",
    parameters: [
      {
        name: "status",
        in: "query",
        description: "Filter by course status",
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      },
      {
        name: "page",
        in: "query",
        description: "Page number (1-indexed)",
        type: "integer",
        default: 1,
      },
      {
        name: "limit",
        in: "query",
        description: "Results per page",
        type: "integer",
        default: 20,
      },
    ],
    responses: {
      200: { description: "Paginated list of courses with meta" },
      401: { description: "Not authenticated" },
    },
  },
  POST: {
    summary: "Create a course",
    description: "Creates a new course. Requires ADMIN or INSTRUCTOR role.",
    adminOnly: true,
    requestBody: {
      description: "Course fields",
      fields: {
        title: { type: "string", required: true, description: "Course title" },
        slug: { type: "string", required: true, description: "URL-safe unique identifier" },
        description: { type: "string", description: "Course description" },
        status: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
          description: "Initial status (defaults to DRAFT)",
        },
        instructorId: {
          type: "string",
          required: true,
          description: "MongoDB ObjectId of the instructor User",
        },
        price: { type: "number", description: "Price in USD (optional)" },
        tags: { type: "string[]", description: "Array of tag strings" },
      },
    },
    responses: {
      201: { description: "Created course object" },
      400: { description: "Validation error — missing required fields or duplicate slug" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  const where = status ? { status } : {};

  const [data, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return Response.json({ data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, slug, description, status, instructorId, price, tags } = body;

  if (!title || !slug || !instructorId) {
    return Response.json({ error: "title, slug, and instructorId are required" }, { status: 400 });
  }

  try {
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        status: status ?? "DRAFT",
        instructorId,
        price,
        tags: tags ?? [],
      },
    });
    return Response.json(course, { status: 201 });
  } catch {
    return Response.json({ error: "Slug already in use" }, { status: 400 });
  }
}
