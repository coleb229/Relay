import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Verify a certificate",
    description:
      "Public endpoint — no authentication required. Verifies a certificate by its unique verification code. Returns certificate details and validity status (active, expired, or revoked). Increments the certificate's view count.",
    parameters: [
      { name: "code", in: "path", description: "Certificate verification code", required: true, type: "string" },
    ],
    responses: {
      200: { description: "Certificate verification result with status" },
      404: { description: "Invalid verification code" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    select: {
      id: true,
      certificateNumber: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      revokedReason: true,
      metadata: true,
      template: { select: { name: true, orientation: true, designData: true, logoUrl: true, backgroundColor: true, borderStyle: true } },
      course: { select: { title: true } },
      user: { select: { name: true } },
    },
  });

  if (!certificate) {
    return Response.json({ valid: false, error: "Invalid verification code" }, { status: 404 });
  }

  // Increment view count (fire-and-forget)
  prisma.certificate.update({
    where: { id: certificate.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const now = new Date();
  let status: "active" | "expired" | "revoked" = "active";
  if (certificate.revokedAt) status = "revoked";
  else if (certificate.expiresAt && certificate.expiresAt < now) status = "expired";

  const meta = certificate.metadata as Record<string, unknown>;

  return Response.json({
    valid: status === "active",
    status,
    certificate: {
      certificateNumber: certificate.certificateNumber,
      studentName: meta?.studentName ?? certificate.user.name,
      courseTitle: meta?.courseTitle ?? certificate.course.title,
      instructorName: meta?.instructorName ?? null,
      completionDate: meta?.completionDate ?? null,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      revokedAt: certificate.revokedAt,
      revokedReason: certificate.revokedReason,
      template: certificate.template,
    },
  });
}
