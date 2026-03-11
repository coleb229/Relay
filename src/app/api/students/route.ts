import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List students",
    description:
      "Returns a paginated list of users with the STUDENT role. Supports search by name or email.",
    parameters: [
      {
        name: "search",
        in: "query",
        description: "Search by name or email (case-insensitive)",
        type: "string",
      },
      {
        name: "page",
        in: "query",
        description: "Page number (1-indexed)",
        type: "integer",
        default: 1,
      },
      {
        name: "limit",
        in: "query",
        description: "Results per page",
        type: "integer",
        default: 20,
      },
    ],
    responses: {
      200: { description: "Paginated list of student users with enrollment count" },
      401: { description: "Not authenticated" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  const where = {
    role: "STUDENT" as const,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({ data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
}
