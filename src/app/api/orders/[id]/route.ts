import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get order",
    description: "Admin endpoint to get a single order by ID.",
    responses: {
      200: { description: "Order details" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
      404: { description: "Not found" },
    },
  },
  POST: {
    summary: "Refund order",
    description: "Admin endpoint to refund an order via Stripe.",
    responses: {
      200: { description: "Refund processed" },
      400: { description: "Cannot refund" },
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
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { id: true, title: true, slug: true, imageUrl: true } },
      coupon: { select: { id: true, code: true, type: true, value: true } },
    },
  });

  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "COMPLETED") {
    return Response.json({ error: "Only completed orders can be refunded" }, { status: 400 });
  }
  if (!order.stripePaymentId) {
    return Response.json({ error: "No payment ID found" }, { status: 400 });
  }

  await stripe.refunds.create({ payment_intent: order.stripePaymentId });

  await prisma.order.update({
    where: { id },
    data: { status: "REFUNDED" },
  });

  return Response.json({ success: true });
}
