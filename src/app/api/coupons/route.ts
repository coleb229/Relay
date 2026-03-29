import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List coupons",
    description: "Admin endpoint to list all coupons with pagination.",
    responses: {
      200: { description: "Paginated coupon list" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
    },
  },
  POST: {
    summary: "Create coupon",
    description: "Admin endpoint to create a new coupon.",
    requestBody: {
      description: "Coupon data",
      fields: {
        code: { type: "string", required: true, description: "Unique coupon code" },
        type: { type: "string", required: true, description: "PERCENTAGE or FIXED" },
        value: { type: "number", required: true, description: "Discount value" },
        maxRedemptions: { type: "number", description: "Max number of uses" },
        expiresAt: { type: "string", description: "Expiration date ISO string" },
      },
    },
    responses: {
      201: { description: "Coupon created" },
      400: { description: "Invalid data" },
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
  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.coupon.count(),
  ]);

  return Response.json({ coupons, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { code, type, value, maxRedemptions, expiresAt } = await req.json();

  if (!code || !type || value === undefined) {
    return Response.json({ error: "code, type, and value are required" }, { status: 400 });
  }

  if (!["PERCENTAGE", "FIXED"].includes(type)) {
    return Response.json({ error: "type must be PERCENTAGE or FIXED" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return Response.json({ error: "Coupon code already exists" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type,
      value,
      maxRedemptions: maxRedemptions || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return Response.json(coupon, { status: 201 });
}
