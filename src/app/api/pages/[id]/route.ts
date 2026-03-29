import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a site page",
    description: "Returns a single site page by ID. Admins can view any page; non-admins can only view published pages.",
    parameters: [
      { name: "id", in: "path", required: true, description: "Page ID", type: "string" },
    ],
    responses: {
      200: { description: "Page object" },
      401: { description: "Not authenticated" },
      404: { description: "Page not found" },
    },
  },
  PATCH: {
    summary: "Update a site page",
    description:
      "Updates a site page. Supports partial updates — only provided fields are changed. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      { name: "id", in: "path", required: true, description: "Page ID", type: "string" },
    ],
    requestBody: {
      description: "Fields to update (all optional)",
      fields: {
        title: { type: "string", description: "Page title" },
        slug: { type: "string", description: "URL slug (must be unique)" },
        description: { type: "string", description: "Page description" },
        status: { type: "string", description: "DRAFT or PUBLISHED" },
        type: { type: "string", description: "Page type enum" },
        sections: { type: "object", description: "Page sections JSON array" },
        seoTitle: { type: "string", description: "SEO title override" },
        seoDescription: { type: "string", description: "SEO meta description" },
        ogImageUrl: { type: "string", description: "Open Graph image URL" },
        order: { type: "number", description: "Display order" },
      },
    },
    responses: {
      200: { description: "Updated page object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Page not found" },
    },
  },
  DELETE: {
    summary: "Delete a site page",
    description:
      "Permanently deletes a site page. System pages (isSystem: true) cannot be deleted. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      { name: "id", in: "path", required: true, description: "Page ID", type: "string" },
    ],
    responses: {
      200: { description: "Deleted confirmation" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Page not found" },
      422: { description: "Cannot delete a system page" },
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
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const page = await prisma.sitePage.findUnique({ where: { id } });
  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });
  if (!isAdmin && page.status !== "PUBLISHED") {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  return Response.json(page);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.sitePage.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Page not found" }, { status: 404 });

  const body = await req.json();
  const { title, slug, description, status, type, sections, seoTitle, seoDescription, ogImageUrl, order } = body;

  try {
    const updated = await prisma.sitePage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(type !== undefined && { type }),
        ...(sections !== undefined && { sections }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(ogImageUrl !== undefined && { ogImageUrl }),
        ...(order !== undefined && { order }),
      },
    });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Update failed — slug may already be in use" }, { status: 400 });
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
  const page = await prisma.sitePage.findUnique({ where: { id } });
  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });
  if (page.isSystem) {
    return Response.json({ error: "Cannot delete a system page" }, { status: 422 });
  }

  await prisma.sitePage.delete({ where: { id } });
  return Response.json({ deleted: true });
}
