import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List orders",
    description: "Admin endpoint to list all orders with pagination and filters.",
    responses: {
      200: { description: "Paginated order list" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        course: { select: { id: true, title: true, slug: true, imageUrl: true } },
        coupon: { select: { id: true, code: true, type: true, value: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return Response.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}
