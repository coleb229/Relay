import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get analytics summary",
    description:
      "Returns platform-wide aggregate statistics: course counts, student counts, enrollment counts, completion rate, and top 5 courses by enrollment.",
    responses: {
      200: {
        description:
          "Analytics object with courseCount, studentCount, enrollmentCount, completionRate (0–1), topCourses[]",
      },
      401: { description: "Not authenticated" },
    },
  },
};

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [courseCount, studentCount, enrollmentCount, completedCount, topCourses] =
    await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { enrollments: { _count: "desc" } },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

  const completionRate = enrollmentCount > 0 ? completedCount / enrollmentCount : 0;

  return Response.json({
    courseCount,
    studentCount,
    enrollmentCount,
    completedCount,
    completionRate,
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      enrollmentCount: c._count.enrollments,
    })),
  });
}
