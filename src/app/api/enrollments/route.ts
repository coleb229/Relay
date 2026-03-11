import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List enrollments",
    description:
      "Returns a paginated list of enrollments. Filter by courseId, userId, or status.",
    parameters: [
      {
        name: "courseId",
        in: "query",
        description: "Filter by course MongoDB ObjectId",
        type: "string",
      },
      {
        name: "userId",
        in: "query",
        description: "Filter by user MongoDB ObjectId",
        type: "string",
      },
      {
        name: "status",
        in: "query",
        description: "Filter by enrollment status",
        type: "string",
        enum: ["ACTIVE", "COMPLETED", "EXPIRED", "SUSPENDED"],
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
      200: { description: "Paginated list of enrollments with user and course summaries" },
      401: { description: "Not authenticated" },
    },
  },
  POST: {
    summary: "Enroll a user",
    description:
      "Enrolls a user in a course. Requires ADMIN or INSTRUCTOR role. Returns 409 if already enrolled.",
    adminOnly: true,
    requestBody: {
      description: "Enrollment fields",
      fields: {
        userId: {
          type: "string",
          required: true,
          description: "MongoDB ObjectId of the user to enroll",
        },
        courseId: {
          type: "string",
          required: true,
          description: "MongoDB ObjectId of the course",
        },
      },
    },
    responses: {
      201: { description: "Created enrollment object" },
      400: { description: "Missing required fields" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      409: { description: "User is already enrolled in this course" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const userId = searchParams.get("userId");
  const status = searchParams.get("status") as
    | "ACTIVE"
    | "COMPLETED"
    | "EXPIRED"
    | "SUSPENDED"
    | null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  const where = {
    ...(courseId && { courseId }),
    ...(userId && { userId }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
        _count: { select: { progress: true } },
      },
    }),
    prisma.enrollment.count({ where }),
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
  const { userId, courseId } = body;

  if (!userId || !courseId) {
    return Response.json({ error: "userId and courseId are required" }, { status: 400 });
  }

  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });
    return Response.json(enrollment, { status: 201 });
  } catch {
    return Response.json({ error: "Already enrolled or invalid IDs" }, { status: 409 });
  }
}
