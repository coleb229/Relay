import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: courseId } = await params;
  const body = await req.json();
  const { moduleIds } = body as { moduleIds: string[] };

  if (!Array.isArray(moduleIds)) {
    return Response.json({ error: "moduleIds must be an array" }, { status: 400 });
  }

  // Update each module's order in a transaction
  await prisma.$transaction(
    moduleIds.map((moduleId, index) =>
      prisma.module.updateMany({
        where: { id: moduleId, courseId },
        data: { order: index },
      })
    )
  );

  return Response.json({ ok: true });
}
