import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  DELETE: {
    summary: "Remove cart item",
    description: "Remove a specific item from the user's cart.",
    responses: {
      200: { description: "Item removed" },
      401: { description: "Not authenticated" },
      404: { description: "Item not found" },
    },
  },
};

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return Response.json({ error: "Cart not found" }, { status: 404 });

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) return Response.json({ error: "Item not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: itemId } });

  return Response.json({ success: true });
}
