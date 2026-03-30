import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a published page by slug",
    description:
      "Returns a published site page by its URL slug. No authentication required for published pages. " +
      "Authenticated admin/instructor users can also retrieve draft pages for preview. " +
      "Returns 404 for non-existent pages or draft pages when unauthenticated.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "Page URL slug (e.g. 'about', 'pricing')",
        type: "string",
      },
    ],
    responses: {
      200: { description: "Page object with sections JSON" },
      404: { description: "Page not found or not published (for non-staff)" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const [{ slug }, session] = await Promise.all([params, auth()]);

  const page = await prisma.sitePage.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      status: true,
      type: true,
      sections: true,
      seoTitle: true,
      seoDescription: true,
      ogImageUrl: true,
    },
  });

  if (!page) {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "INSTRUCTOR";
  if (page.status !== "PUBLISHED" && !isStaff) {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  return Response.json(page);
}
