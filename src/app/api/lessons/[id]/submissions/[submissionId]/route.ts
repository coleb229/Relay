import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  PATCH: {
    summary: "Grade an assignment submission",
    description:
      "Allows an admin or instructor to grade a student's assignment submission, providing a score and optional feedback.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID",
      },
      {
        name: "submissionId",
        in: "path",
        required: true,
        type: "string",
        description: "Submission ID",
      },
    ],
    requestBody: {
      description: "Grading data for the submission",
      fields: {
        score: { type: "number", description: "Grade score" },
        feedback: { type: "string", description: "Instructor feedback" },
        status: {
          type: "string",
          enum: ["GRADED", "RETURNED"],
          description: "Submission status after grading",
        },
      },
    },
    responses: {
      200: { description: "Submission graded successfully" },
      401: { description: "Not authenticated" },
      403: { description: "Not authorized (admin/instructor only)" },
      404: { description: "Submission not found" },
    },
  },
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const body = await req.json();
  const { score, feedback, status } = body;

  try {
    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        ...(score !== undefined && { score: Number(score) }),
        ...(feedback !== undefined && { feedback: feedback?.trim() ?? null }),
        ...(status !== undefined && { status }),
        gradedAt: new Date(),
        gradedById: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        gradedBy: { select: { id: true, name: true } },
      },
    });

    return Response.json(submission);
  } catch {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }
}
