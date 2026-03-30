import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get a published course by slug",
    description:
      "Returns a published course by its URL slug. No authentication required. " +
      "Includes instructor info, category, modules with published lessons, and enrollment count. " +
      "Returns 404 for draft, archived, or non-existent courses. " +
      "Use this endpoint to fetch course data for client-side rendering or external integrations.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "Course URL slug (e.g. 'intro-to-react', 'advanced-python')",
        type: "string",
      },
    ],
    responses: {
      200: { description: "Published course object with modules, lessons, instructor, and category" },
      404: { description: "Course not found or not published" },
    },
  },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      price: true,
      compareAtPrice: true,
      pricingType: true,
      tags: true,
      status: true,
      category: { select: { id: true, name: true, color: true } },
      instructor: { select: { id: true, name: true, image: true, bio: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const { status: _, ...courseData } = course;
  return Response.json(courseData);
}
