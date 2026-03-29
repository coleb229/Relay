import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get my certificates",
    description:
      "Returns the authenticated user's certificates with pagination. Available to all roles — each user sees only their own certificates.",
    parameters: [
      { name: "page", in: "query", description: "Page number", type: "number" },
      { name: "limit", in: "query", description: "Items per page (max 100)", type: "number" },
    ],
    responses: {
      200: { description: "Paginated list of the user's certificates" },
      401: { description: "Not authenticated" },
    },
  },
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  const where = { userId: session.user.id };

  const [data, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        template: { select: { id: true, name: true, orientation: true, designData: true, logoUrl: true, backgroundColor: true, borderStyle: true } },
        course: { select: { id: true, title: true, imageUrl: true } },
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
