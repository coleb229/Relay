import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Revenue stats",
    description: "Admin endpoint to get revenue statistics and analytics.",
    responses: {
      200: { description: "Revenue data" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized" },
    },
  },
};

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true, createdAt: true, courseId: true },
  });

  const refundedCount = await prisma.order.count({ where: { status: "REFUNDED" } });
  const totalOrders = completedOrders.length + refundedCount;

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const refundRate = totalOrders > 0 ? (refundedCount / totalOrders) * 100 : 0;

  // Revenue by month (last 12 months)
  const revenueByMonth: { month: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthRevenue = completedOrders
      .filter((o) => o.createdAt >= date && o.createdAt <= monthEnd)
      .reduce((sum, o) => sum + o.amount, 0);
    revenueByMonth.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      revenue: monthRevenue,
    });
  }

  // Top courses by revenue
  const courseRevenue: Record<string, number> = {};
  completedOrders.forEach((o) => {
    courseRevenue[o.courseId] = (courseRevenue[o.courseId] || 0) + o.amount;
  });

  const topCourseIds = Object.entries(courseRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  const topCoursesData = await prisma.course.findMany({
    where: { id: { in: topCourseIds } },
    select: { id: true, title: true, imageUrl: true },
  });

  const topCourses = topCourseIds.map((id) => {
    const course = topCoursesData.find((c) => c.id === id);
    return {
      id,
      title: course?.title || "Unknown",
      imageUrl: course?.imageUrl,
      revenue: courseRevenue[id],
    };
  });

  return Response.json({
    totalRevenue,
    totalOrders: completedOrders.length,
    avgOrderValue,
    refundRate,
    revenueByMonth,
    topCourses,
  });
}
