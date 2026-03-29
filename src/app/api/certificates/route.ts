import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

function generateCertificateNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CERT-${code}`;
}

export const definition: RouteDefinition = {
  GET: {
    summary: "List issued certificates",
    description:
      "Returns paginated list of issued certificates. ADMIN sees all; INSTRUCTOR sees certificates for their courses. Supports filtering by course, student, template, status, and date range.",
    parameters: [
      { name: "page", in: "query", description: "Page number", type: "number" },
      { name: "limit", in: "query", description: "Items per page (max 100)", type: "number" },
      { name: "courseId", in: "query", description: "Filter by course ID", type: "string" },
      { name: "userId", in: "query", description: "Filter by student ID", type: "string" },
      { name: "templateId", in: "query", description: "Filter by template ID", type: "string" },
      { name: "status", in: "query", description: "Filter by derived status: active, expired, revoked", type: "string", enum: ["active", "expired", "revoked"] },
      { name: "from", in: "query", description: "Issued after this ISO date", type: "string" },
      { name: "to", in: "query", description: "Issued before this ISO date", type: "string" },
      { name: "search", in: "query", description: "Search by certificate number or student name", type: "string" },
    ],
    responses: {
      200: { description: "Paginated list of issued certificates" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role — STUDENT should use /api/certificates/my" },
    },
  },
  POST: {
    summary: "Issue a certificate",
    description:
      "Issues a certificate to a student for a course. Auto-generates certificate number and verification code. Auto-populates metadata from user/course/enrollment if not provided. INSTRUCTOR can only issue for their own courses.",
    requestBody: {
      description: "Certificate issuance details",
      fields: {
        templateId: { type: "string", description: "Certificate template ID (required)" },
        userId: { type: "string", description: "Student user ID (required)" },
        courseId: { type: "string", description: "Course ID (required)" },
        enrollmentId: { type: "string", description: "Enrollment ID (required)" },
        expiresAt: { type: "string", description: "Expiration date ISO string (optional)" },
        metadata: { type: "object", description: "Override snapshot data (auto-populated if omitted)" },
      },
    },
    responses: {
      201: { description: "Created certificate object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Template, user, course, or enrollment not found" },
      422: { description: "Validation error or duplicate certificate" },
    },
  },
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") {
    return Response.json({ error: "Use /api/certificates/my for student certificates" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const courseId = url.searchParams.get("courseId");
  const userId = url.searchParams.get("userId");
  const templateId = url.searchParams.get("templateId");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const search = url.searchParams.get("search");

  const now = new Date();
  const where = {
    ...(courseId && { courseId }),
    ...(userId && { userId }),
    ...(templateId && { templateId }),
    ...(status === "revoked" && { revokedAt: { not: null } }),
    ...(status === "expired" && { revokedAt: null, expiresAt: { lt: now } }),
    ...(status === "active" && {
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    }),
    ...(from && { issuedAt: { gte: new Date(from) } }),
    ...(to && { issuedAt: { ...(from ? { gte: new Date(from) } : {}), lte: new Date(to) } }),
    ...(search && {
      OR: [
        { certificateNumber: { contains: search, mode: "insensitive" as const } },
        { user: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
    ...(session.user.role === "INSTRUCTOR" && {
      course: { instructorId: session.user.id },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        template: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.certificate.count({ where }),
  ]);

  return Response.json({
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { templateId, userId, courseId, enrollmentId, expiresAt, metadata } = body;

  if (!templateId || !userId || !courseId || !enrollmentId) {
    return Response.json({ error: "templateId, userId, courseId, and enrollmentId are required" }, { status: 422 });
  }

  // Verify all referenced records exist
  const [template, student, course, enrollment] = await Promise.all([
    prisma.certificateTemplate.findUnique({ where: { id: templateId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true, instructor: { select: { name: true } } },
    }),
    prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { id: true, completedAt: true } }),
  ]);

  if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  if (!enrollment) return Response.json({ error: "Enrollment not found" }, { status: 404 });

  // INSTRUCTOR can only issue for their own courses
  if (session.user.role === "INSTRUCTOR" && course.instructorId !== session.user.id) {
    return Response.json({ error: "Cannot issue certificates for courses you don't instruct" }, { status: 403 });
  }

  // Check for duplicate
  const existing = await prisma.certificate.findFirst({
    where: { templateId, enrollmentId },
  });
  if (existing) {
    return Response.json({ error: "Certificate already issued for this enrollment with this template" }, { status: 422 });
  }

  // Generate unique certificate number
  let certificateNumber: string;
  let attempts = 0;
  do {
    certificateNumber = generateCertificateNumber();
    const dup = await prisma.certificate.findUnique({ where: { certificateNumber } });
    if (!dup) break;
    attempts++;
  } while (attempts < 10);

  const certificateMetadata = metadata ?? {
    studentName: student.name ?? "Unknown Student",
    courseTitle: course.title,
    completionDate: enrollment.completedAt?.toISOString() ?? new Date().toISOString(),
    grade: null,
    instructorName: course.instructor?.name ?? "Unknown Instructor",
  };

  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      templateId,
      userId,
      courseId,
      enrollmentId,
      metadata: certificateMetadata,
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
      template: { select: { id: true, name: true } },
    },
  });

  return Response.json(certificate, { status: 201 });
}
