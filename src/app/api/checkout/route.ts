import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Create Stripe checkout session",
    description: "Creates a Stripe Checkout session for purchasing a course.",
    requestBody: {
      description: "Checkout request",
      fields: {
        courseId: { type: "string", required: true, description: "Course to purchase" },
        couponCode: { type: "string", description: "Optional coupon code" },
      },
    },
    responses: {
      200: { description: "Checkout session URL" },
      400: { description: "Invalid request" },
      401: { description: "Not authenticated" },
      404: { description: "Course not found" },
    },
  },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, couponCode } = await req.json();
  if (!courseId) return Response.json({ error: "courseId required" }, { status: 400 });

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, title: true, price: true, imageUrl: true, slug: true },
  });

  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  if (!course.price || course.price <= 0) return Response.json({ error: "Course is free" }, { status: 400 });

  let discount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.maxRedemptions || coupon.currentRedemptions < coupon.maxRedemptions)) {
      discount = coupon.type === "PERCENTAGE" ? (course.price * coupon.value) / 100 : coupon.value;
      couponId = coupon.id;
    }
  }

  const finalAmount = Math.max(0, course.price - discount);

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      amount: finalAmount,
      originalAmount: course.price,
      couponId,
      status: "PENDING",
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: course.title,
          ...(course.imageUrl ? { images: [course.imageUrl] } : {}),
        },
        unit_amount: Math.round(finalAmount * 100),
      },
      quantity: 1,
    }],
    metadata: { orderId: order.id, courseId: course.id, userId: session.user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return Response.json({ url: checkoutSession.url });
}
