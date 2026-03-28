import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List categories",
    description:
      "Returns all categories ordered by their display order, including the number of courses in each category.",
    responses: {
      200: { description: "Array of categories with course counts" },
      401: { description: "Not authenticated" },
    },
  },
  POST: {
    summary: "Create a category",
    description: "Creates a new category. Requires ADMIN role.",
    adminOnly: true,
    requestBody: {
      description: "Category fields",
      fields: {
        name: { type: "string", required: true, description: "Category name (must be unique)" },
        slug: { type: "string", description: "URL-safe identifier (auto-generated from name if omitted)" },
        description: { type: "string", description: "Category description" },
        color: { type: "string", description: "Display color (e.g. hex code)" },
      },
    },
    responses: {
      201: { description: "Created category object" },
      400: { description: "Validation error — missing name or duplicate slug/name" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { courses: true } },
    },
  });

  return Response.json(categories);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, description, color } = body;

  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const finalSlug = slug || slugify(name);

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        color,
      },
    });
    return Response.json(category, { status: 201 });
  } catch {
    return Response.json({ error: "Name or slug already in use" }, { status: 400 });
  }
}
