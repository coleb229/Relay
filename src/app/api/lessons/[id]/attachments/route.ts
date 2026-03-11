import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const attachments = await prisma.lessonAttachment.findMany({
    where: { lessonId: id },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(attachments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { name, url, size } = await req.json();

  if (!name || !url || size == null) {
    return Response.json({ error: "name, url, and size are required" }, { status: 400 });
  }

  const attachment = await prisma.lessonAttachment.create({
    data: { lessonId: id, name, url, size: Number(size) },
  });
  return Response.json(attachment, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { attachmentId } = await req.json();
  if (!attachmentId) {
    return Response.json({ error: "attachmentId is required" }, { status: 400 });
  }

  try {
    await prisma.lessonAttachment.delete({ where: { id: attachmentId } });
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
