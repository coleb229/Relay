import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a certificate",
    description:
      "Returns a single certificate by ID. ADMIN can view any certificate; INSTRUCTOR can view certificates for their courses; STUDENT can only view their own certificates.",
    parameters: [
      { name: "id", in: "path", description: "Certificate ID", required: true, type: "string" },
    ],
    responses: {
      200: { description: "Certificate object with template, user, course details" },
      401: { description: "Not authenticated" },
      403: { description: "Cannot view this certificate" },
      404: { description: "Certificate not found" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      template: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { id: true, title: true, instructorId: true } },
    },
  });

  if (!certificate) return Response.json({ error: "Certificate not found" }, { status: 404 });

  // Authorization: ADMIN sees all, INSTRUCTOR sees their courses, STUDENT sees own
  if (session.user.role === "STUDENT" && certificate.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "INSTRUCTOR" && certificate.course.instructorId !== session.user.id && certificate.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(certificate);
}
