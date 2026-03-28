import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "List my enrollments",
    description:
      "Returns the current user's enrollments with course details and progress.",
    parameters: [
      {
        name: "page",
        in: "query",
        description: "Page number (1-indexed)",
        type: "integer",
        default: 1,
      },
      {
        name: "limit",
        in: "query",
        description: "Results per page",
        type: "integer",
        default: 20,
      },
    ],
    responses: {
      200: { description: "Paginated enrollments" },
      401: { description: "Not authenticated" },
    },
  },
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  const where = { userId };

  const [data, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            price: true,
            category: { select: { id: true, name: true, color: true } },
            instructor: { select: { id: true, name: true, image: true } },
            modules: {
              select: {
                lessons: {
                  where: { isPublished: true },
                  select: { id: true },
                },
              },
            },
          },
        },
        _count: { select: { progress: true } },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const enrollments = data.map((e) => {
    const totalLessons = e.course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
    return {
      id: e.id,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      progressCount: e._count.progress,
      totalLessons,
      course: {
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        description: e.course.description,
        imageUrl: e.course.imageUrl,
        price: e.course.price,
        category: e.course.category,
        instructor: e.course.instructor,
      },
    };
  });

  return Response.json({
    data: enrollments,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
