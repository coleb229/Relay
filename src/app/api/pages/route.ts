import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List site pages",
    description:
      "Returns all site pages with pagination. Admins see all pages; public consumers see only published pages.",
    parameters: [
      { name: "page", in: "query", description: "Page number (default 1)", type: "number" },
      { name: "limit", in: "query", description: "Items per page, max 100 (default 20)", type: "number" },
      { name: "status", in: "query", description: "Filter by status: DRAFT or PUBLISHED", type: "string" },
      { name: "type", in: "query", description: "Filter by page type: HOME, ABOUT, CONTACT, COURSES, BLOG, CUSTOM, TERMS, PRIVACY", type: "string" },
    ],
    responses: {
      200: { description: "Paginated list of site pages" },
      401: { description: "Not authenticated" },
    },
  },
  POST: {
    summary: "Create a site page",
    description:
      "Creates a new site page. Requires ADMIN role. The slug must be unique and is auto-generated from the title if not provided.",
    adminOnly: true,
    requestBody: {
      description: "Page creation fields",
      fields: {
        title: { type: "string", required: true, description: "Page title" },
        slug: { type: "string", description: "URL slug (auto-generated from title if omitted)" },
        description: { type: "string", description: "Page description" },
        type: { type: "string", description: "Page type enum (default CUSTOM)" },
        status: { type: "string", description: "DRAFT or PUBLISHED (default DRAFT)" },
        sections: { type: "object", description: "Page sections JSON array (same format as course landing page sections)" },
        seoTitle: { type: "string", description: "SEO title override" },
        seoDescription: { type: "string", description: "SEO meta description" },
        ogImageUrl: { type: "string", description: "Open Graph image URL" },
      },
    },
    responses: {
      201: { description: "Created page object" },
      400: { description: "Validation error — missing title or duplicate slug" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
    },
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  const where: Record<string, unknown> = {};
  if (!isAdmin) where.status = "PUBLISHED";
  if (status && isAdmin) where.status = status;
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.sitePage.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sitePage.count({ where }),
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
  const { title, slug, description, type, status, sections, seoTitle, seoDescription, ogImageUrl } = body;

  if (!title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const finalSlug = slug?.trim() || slugify(title);

  try {
    const pageData = await prisma.sitePage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(sections !== undefined && { sections }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(ogImageUrl !== undefined && { ogImageUrl }),
      },
    });
    return Response.json(pageData, { status: 201 });
  } catch {
    return Response.json({ error: "Slug already in use" }, { status: 400 });
  }
}
