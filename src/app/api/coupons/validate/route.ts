import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Validate coupon",
    description: "Validates a coupon code for a specific course and returns discount information.",
    requestBody: {
      description: "Validation request",
      fields: {
        code: { type: "string", required: true, description: "Coupon code" },
        courseId: { type: "string", required: true, description: "Course ID" },
      },
    },
    responses: {
      200: { description: "Validation result" },
      400: { description: "Missing fields" },
      401: { description: "Not authenticated" },
    },
  },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { code, courseId } = await req.json();
  if (!code || !courseId) {
    return Response.json({ error: "code and courseId required" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) {
    return Response.json({ valid: false, reason: "Coupon not found" });
  }

  if (!coupon.isActive) {
    return Response.json({ valid: false, reason: "Coupon is inactive" });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return Response.json({ valid: false, reason: "Coupon has expired" });
  }

  if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
    return Response.json({ valid: false, reason: "Coupon has reached maximum redemptions" });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { price: true },
  });

  if (!course || !course.price) {
    return Response.json({ valid: false, reason: "Course not found or is free" });
  }

  const discount = coupon.type === "PERCENTAGE"
    ? (course.price * coupon.value) / 100
    : Math.min(coupon.value, course.price);

  return Response.json({
    valid: true,
    discount,
    finalPrice: Math.max(0, course.price - discount),
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
  });
}
