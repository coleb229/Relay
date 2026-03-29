import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List certificate templates",
    description:
      "Returns paginated certificate templates. ADMIN sees all templates; INSTRUCTOR sees their own course templates and global templates. Supports filtering by status, course, and search.",
    parameters: [
      { name: "page", in: "query", description: "Page number", type: "number" },
      { name: "limit", in: "query", description: "Items per page (max 100)", type: "number" },
      { name: "status", in: "query", description: "Filter by template status", type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
      { name: "courseId", in: "query", description: "Filter by course ID", type: "string" },
      { name: "search", in: "query", description: "Search templates by name", type: "string" },
    ],
    responses: {
      200: { description: "Paginated list of certificate templates" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role — STUDENT cannot access" },
    },
  },
  POST: {
    summary: "Create a certificate template",
    description:
      "Creates a new certificate template with optional design data, branding, and course association. Requires ADMIN role.",
    adminOnly: true,
    requestBody: {
      description: "Template details",
      fields: {
        name: { type: "string", description: "Template name (required)" },
        description: { type: "string", description: "Template description" },
        designData: { type: "object", description: "Element layout/style JSON" },
        status: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"], description: "Template status (default: DRAFT)" },
        orientation: { type: "string", enum: ["LANDSCAPE", "PORTRAIT"], description: "Certificate orientation (default: LANDSCAPE)" },
        courseId: { type: "string", description: "Attach to specific course (null = global)" },
        logoUrl: { type: "string", description: "Logo image URL" },
        instructorSignatureUrl: { type: "string", description: "Instructor signature image URL" },
        backgroundColor: { type: "string", description: "Background color" },
        borderStyle: { type: "string", description: "Border style preset" },
      },
    },
    responses: {
      201: { description: "Created certificate template" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      422: { description: "Validation error — name is required" },
    },
  },
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const status = url.searchParams.get("status") as "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
  const courseId = url.searchParams.get("courseId");
  const search = url.searchParams.get("search");

  const where = {
    ...(status && { status }),
    ...(courseId && { courseId }),
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    ...(session.user.role === "INSTRUCTOR" && {
      OR: [
        { courseId: null },
        { course: { instructorId: session.user.id } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.certificateTemplate.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { certificates: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.certificateTemplate.count({ where }),
  ]);

  return Response.json({
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, designData, status, orientation, courseId, logoUrl, instructorSignatureUrl, backgroundColor, borderStyle } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Template name is required" }, { status: 422 });
  }

  const template = await prisma.certificateTemplate.create({
    data: {
      name: name.trim(),
      ...(description !== undefined && { description }),
      designData: designData ?? { elements: [], background: {}, dimensions: { width: 1056, height: 816 } },
      ...(status !== undefined && { status }),
      ...(orientation !== undefined && { orientation }),
      ...(courseId !== undefined && { courseId }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(instructorSignatureUrl !== undefined && { instructorSignatureUrl }),
      ...(backgroundColor !== undefined && { backgroundColor }),
      ...(borderStyle !== undefined && { borderStyle }),
      createdById: session.user.id,
    },
    include: {
      course: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { certificates: true } },
    },
  });

  return Response.json(template, { status: 201 });
}
