import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Self-enroll in a course",
    description:
      "Allows any authenticated user to enroll themselves in a free, published course.",
    requestBody: {
      description: "Enrollment request",
      fields: {
        courseId: {
          type: "string",
          required: true,
          description: "Course ID to enroll in",
        },
      },
    },
    responses: {
      201: { description: "Enrollment created" },
      400: { description: "Missing courseId" },
      401: { description: "Not authenticated" },
      402: { description: "Course requires payment" },
      404: { description: "Course not found or not published" },
      409: { description: "Already enrolled" },
    },
  },
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { courseId } = body;

  if (!courseId) {
    return Response.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, price: true },
  });

  if (!course) {
    return Response.json({ error: "Course not found or not published" }, { status: 404 });
  }

  if (course.price && course.price > 0) {
    return Response.json(
      { error: "Payment required", price: course.price },
      { status: 402 }
    );
  }

  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });
    return Response.json(enrollment, { status: 201 });
  } catch {
    return Response.json({ error: "Already enrolled" }, { status: 409 });
  }
}
