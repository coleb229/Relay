import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Stripe webhook",
    description: "Handles Stripe webhook events for payment processing.",
    responses: {
      200: { description: "Webhook processed" },
      400: { description: "Invalid signature" },
    },
  },
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED", stripePaymentId: session.payment_intent as string },
      });
    }

    if (userId && courseId) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const paymentIntent = charge.payment_intent as string;
    if (paymentIntent) {
      await prisma.order.updateMany({
        where: { stripePaymentId: paymentIntent },
        data: { status: "REFUNDED" },
      });
    }
  }

  return Response.json({ received: true });
}
