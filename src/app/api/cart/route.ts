import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get cart",
    description: "Get the current user's cart with items.",
    responses: {
      200: { description: "Cart with items" },
      401: { description: "Not authenticated" },
    },
  },
  POST: {
    summary: "Add to cart",
    description: "Add a course to the user's cart.",
    requestBody: {
      description: "Cart item",
      fields: {
        courseId: { type: "string", required: true, description: "Course to add" },
      },
    },
    responses: {
      200: { description: "Item added" },
      400: { description: "Invalid request" },
      401: { description: "Not authenticated" },
    },
  },
  DELETE: {
    summary: "Clear cart",
    description: "Remove all items from the user's cart.",
    responses: {
      200: { description: "Cart cleared" },
      401: { description: "Not authenticated" },
    },
  },
};

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          course: {
            select: { id: true, title: true, slug: true, price: true, imageUrl: true, compareAtPrice: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, price: true, imageUrl: true, compareAtPrice: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return Response.json(cart);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return Response.json({ error: "courseId required" }, { status: 400 });

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, price: true },
  });

  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });

  // Check if already enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (enrollment) return Response.json({ error: "Already enrolled" }, { status: 400 });

  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } });
  }

  // Check if already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, courseId },
  });
  if (existingItem) return Response.json({ error: "Already in cart" }, { status: 400 });

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      courseId,
    },
    include: {
      course: {
        select: { id: true, title: true, slug: true, price: true, imageUrl: true },
      },
    },
  });

  return Response.json(item);
}

export async function DELETE() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return Response.json({ success: true });
}
