import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

function generateCertificateNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CERT-${code}`;
}

export const definition: RouteDefinition = {
  POST: {
    summary: "Bulk issue certificates",
    description:
      "Issues certificates to all completed enrollments in a course that don't already have one for the given template. Requires ADMIN role.",
    adminOnly: true,
    requestBody: {
      description: "Bulk issuance parameters",
      fields: {
        templateId: { type: "string", description: "Certificate template ID (required)" },
        courseId: { type: "string", description: "Course ID (required)" },
        expiresAt: { type: "string", description: "Expiration date ISO string (optional)" },
      },
    },
    responses: {
      200: { description: "Bulk issuance results with counts" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Template or course not found" },
      422: { description: "Missing required fields" },
    },
  },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const body = await request.json();
  const { templateId, courseId, expiresAt } = body;

  if (!templateId || !courseId) {
    return Response.json({ error: "templateId and courseId are required" }, { status: 422 });
  }

  const [template, course] = await Promise.all([
    prisma.certificateTemplate.findUnique({ where: { id: templateId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });

  // Find completed enrollments without a certificate for this template
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      completedAt: { not: null },
      certificates: { none: { templateId } },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  let issued = 0;
  let errors = 0;

  for (const enrollment of completedEnrollments) {
    try {
      let certificateNumber: string;
      let attempts = 0;
      do {
        certificateNumber = generateCertificateNumber();
        const dup = await prisma.certificate.findUnique({ where: { certificateNumber } });
        if (!dup) break;
        attempts++;
      } while (attempts < 10);

      await prisma.certificate.create({
        data: {
          certificateNumber: certificateNumber!,
          templateId,
          userId: enrollment.userId,
          courseId,
          enrollmentId: enrollment.id,
          metadata: {
            studentName: enrollment.user.name ?? "Unknown Student",
            courseTitle: course.title,
            completionDate: enrollment.completedAt!.toISOString(),
            grade: null,
            instructorName: null,
          },
          ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        },
      });
      issued++;
    } catch {
      errors++;
    }
  }

  const skipped = await prisma.enrollment.count({
    where: {
      courseId,
      completedAt: { not: null },
      certificates: { some: { templateId } },
    },
  });

  return Response.json({
    issued,
    skipped,
    errors,
    total: issued + skipped + errors,
  });
}
