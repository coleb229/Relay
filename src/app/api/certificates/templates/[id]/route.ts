import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a certificate template",
    description: "Returns a single certificate template by ID with full design data.",
    parameters: [
      { name: "id", in: "path", description: "Template ID", required: true, type: "string" },
    ],
    responses: {
      200: { description: "Certificate template object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Template not found" },
    },
  },
  PUT: {
    summary: "Update a certificate template",
    description: "Partially updates a certificate template. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      { name: "id", in: "path", description: "Template ID", required: true, type: "string" },
    ],
    requestBody: {
      description: "Fields to update (all optional)",
      fields: {
        name: { type: "string", description: "Template name" },
        description: { type: "string", description: "Template description" },
        designData: { type: "object", description: "Element layout/style JSON" },
        status: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"], description: "Template status" },
        orientation: { type: "string", enum: ["LANDSCAPE", "PORTRAIT"], description: "Certificate orientation" },
        courseId: { type: "string", description: "Course ID (null to make global)" },
        logoUrl: { type: "string", description: "Logo image URL" },
        instructorSignatureUrl: { type: "string", description: "Instructor signature URL" },
        backgroundColor: { type: "string", description: "Background color" },
        borderStyle: { type: "string", description: "Border style preset" },
      },
    },
    responses: {
      200: { description: "Updated template object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Template not found" },
    },
  },
  DELETE: {
    summary: "Delete a certificate template",
    description:
      "Permanently deletes a certificate template and all certificates using it. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      { name: "id", in: "path", description: "Template ID", required: true, type: "string" },
    ],
    responses: {
      200: { description: "Deletion confirmed" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Template not found" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const template = await prisma.certificateTemplate.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { certificates: true } },
    },
  });

  if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
  return Response.json(template);
}

export async function PUT(
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
  const { name, description, designData, status, orientation, courseId, logoUrl, instructorSignatureUrl, backgroundColor, borderStyle } = body;

  try {
    const template = await prisma.certificateTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(designData !== undefined && { designData }),
        ...(status !== undefined && { status }),
        ...(orientation !== undefined && { orientation }),
        ...(courseId !== undefined && { courseId }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(instructorSignatureUrl !== undefined && { instructorSignatureUrl }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(borderStyle !== undefined && { borderStyle }),
      },
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { certificates: true } },
      },
    });
    return Response.json(template);
  } catch {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.certificateTemplate.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }
}
