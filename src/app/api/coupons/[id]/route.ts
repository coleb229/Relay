import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get coupon",
    description: "Admin endpoint to get a single coupon by ID.",
    responses: {
      200: { description: "Coupon details" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
      404: { description: "Not found" },
    },
  },
  PATCH: {
    summary: "Update coupon",
    description: "Admin endpoint to update a coupon.",
    requestBody: {
      description: "Coupon update data",
      fields: {
        code: { type: "string", description: "Coupon code" },
        type: { type: "string", description: "PERCENTAGE or FIXED" },
        value: { type: "number", description: "Discount value" },
        isActive: { type: "boolean", description: "Active status" },
        maxRedemptions: { type: "number", description: "Max uses" },
        expiresAt: { type: "string", description: "Expiration date" },
      },
    },
    responses: {
      200: { description: "Coupon updated" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
      404: { description: "Not found" },
    },
  },
  DELETE: {
    summary: "Delete coupon",
    description: "Admin endpoint to delete a coupon.",
    responses: {
      200: { description: "Coupon deleted" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
      404: { description: "Not found" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(coupon);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return Response.json({ error: "Not found" }, { status: 404 });

  const data = await req.json();
  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      ...(data.code !== undefined && { code: data.code }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.maxRedemptions !== undefined && { maxRedemptions: data.maxRedemptions }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.coupon.delete({ where: { id } });
  return Response.json({ success: true });
}
