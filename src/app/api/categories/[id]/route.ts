import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  PATCH: {
    summary: "Update a category",
    description: "Partially updates category fields. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Category ID",
        required: true,
        type: "string",
      },
    ],
    requestBody: {
      description: "Fields to update (all optional)",
      fields: {
        name: { type: "string", description: "Category name" },
        slug: { type: "string", description: "URL-safe identifier" },
        description: { type: "string", description: "Category description" },
        color: { type: "string", description: "Display color" },
        order: { type: "integer", description: "Display order" },
      },
    },
    responses: {
      200: { description: "Updated category object" },
      400: { description: "Validation error" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Category not found" },
    },
  },
  DELETE: {
    summary: "Delete a category",
    description:
      "Permanently deletes a category. Courses in this category will have their categoryId set to null. Requires ADMIN role.",
    adminOnly: true,
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Category ID",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: { description: "Deletion confirmed" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      404: { description: "Category not found" },
    },
  },
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, slug, description, color, order } = body;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
      },
    });
    return Response.json(category);
  } catch {
    return Response.json({ error: "Category not found or name/slug conflict" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }
}
