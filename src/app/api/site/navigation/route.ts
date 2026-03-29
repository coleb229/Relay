import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get site navigation",
    description:
      "Returns all navigation items grouped by location (header/footer), ordered by display order. Nested items are included via the children relation.",
    parameters: [
      { name: "location", in: "query", description: "Filter by location: header or footer", type: "string" },
    ],
    responses: {
      200: { description: "Array of navigation items with children" },
      401: { description: "Not authenticated" },
    },
  },
  PUT: {
    summary: "Replace site navigation",
    description:
      "Replaces all navigation items for a given location. Deletes existing items and creates new ones in a transaction. Requires ADMIN role.",
    adminOnly: true,
    requestBody: {
      description: "Navigation replacement payload",
      fields: {
        location: { type: "string", required: true, description: "Navigation location: header or footer" },
        items: {
          type: "array",
          required: true,
          description: "Array of nav items: { label, href, target?, order, visible?, children?: [...] }",
        },
      },
    },
    responses: {
      200: { description: "Updated navigation items" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
      422: { description: "Missing location or items" },
    },
  },
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const location = url.searchParams.get("location");

  const where: Record<string, unknown> = { parentId: null };
  if (location) where.location = location;

  const items = await prisma.siteNavItem.findMany({
    where,
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return Response.json(items);
}

interface NavItemInput {
  label: string;
  href: string;
  target?: string;
  order?: number;
  visible?: boolean;
  children?: NavItemInput[];
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const body = await request.json();
  const { location, items } = body as { location?: string; items?: NavItemInput[] };

  if (!location || !items) {
    return Response.json({ error: "location and items are required" }, { status: 422 });
  }

  // Transaction: delete all existing items for this location, then create new ones
  await prisma.$transaction(async (tx) => {
    // Delete children first (to avoid FK constraint issues)
    await tx.siteNavItem.deleteMany({
      where: { location, parentId: { not: null } },
    });
    await tx.siteNavItem.deleteMany({ where: { location } });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parent = await tx.siteNavItem.create({
        data: {
          label: item.label,
          href: item.href,
          target: item.target ?? null,
          order: item.order ?? i,
          visible: item.visible ?? true,
          location,
        },
      });

      if (item.children?.length) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          await tx.siteNavItem.create({
            data: {
              label: child.label,
              href: child.href,
              target: child.target ?? null,
              order: child.order ?? j,
              visible: child.visible ?? true,
              location,
              parentId: parent.id,
            },
          });
        }
      }
    }
  });

  // Return fresh data
  const result = await prisma.siteNavItem.findMany({
    where: { location, parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return Response.json(result);
}
