import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Revoke a certificate",
    description:
      "Revokes a certificate with a required reason. Sets revokedAt timestamp and revokedReason. Public verification will reflect the revocation. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      { name: "id", in: "path", description: "Certificate ID", required: true, type: "string" },
    ],
    requestBody: {
      description: "Revocation details",
      fields: {
        reason: { type: "string", description: "Reason for revocation (required)" },
      },
    },
    responses: {
      200: { description: "Revoked certificate object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Certificate not found" },
      422: { description: "Certificate already revoked or reason missing" },
    },
  },
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { reason } = body;

  if (!reason?.trim()) {
    return Response.json({ error: "Revocation reason is required" }, { status: 422 });
  }

  const certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate) return Response.json({ error: "Certificate not found" }, { status: 404 });
  if (certificate.revokedAt) {
    return Response.json({ error: "Certificate is already revoked" }, { status: 422 });
  }

  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      revokedAt: new Date(),
      revokedReason: reason.trim(),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
      template: { select: { id: true, name: true } },
    },
  });

  return Response.json(updated);
}
