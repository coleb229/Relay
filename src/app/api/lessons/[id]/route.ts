import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    title, description, content, videoUrl, duration, type, isPublished,
    fileUrl, fileName, fileSize, audioUrl, embedCode,
    meetingUrl, meetingPlatform, scheduledAt, recordingUrl,
    assignmentType, maxScore, dueDate, allowLate, instructions,
    scormPackageUrl, scormVersion, scormEntryPoint,
    discussionPrompt,
  } = body;

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(content !== undefined && { content: content ?? null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl?.trim() ?? null }),
        ...(duration !== undefined && { duration: duration != null ? Number(duration) : null }),
        ...(type !== undefined && { type }),
        ...(isPublished !== undefined && { isPublished }),
        // File-based fields
        ...(fileUrl !== undefined && { fileUrl: fileUrl?.trim() ?? null }),
        ...(fileName !== undefined && { fileName: fileName ?? null }),
        ...(fileSize !== undefined && { fileSize: fileSize != null ? Number(fileSize) : null }),
        // Audio
        ...(audioUrl !== undefined && { audioUrl: audioUrl?.trim() ?? null }),
        // Embed
        ...(embedCode !== undefined && { embedCode: embedCode ?? null }),
        // Live session
        ...(meetingUrl !== undefined && { meetingUrl: meetingUrl?.trim() ?? null }),
        ...(meetingPlatform !== undefined && { meetingPlatform: meetingPlatform ?? null }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(recordingUrl !== undefined && { recordingUrl: recordingUrl?.trim() ?? null }),
        // Assignment
        ...(assignmentType !== undefined && { assignmentType: assignmentType ?? null }),
        ...(maxScore !== undefined && { maxScore: maxScore != null ? Number(maxScore) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(allowLate !== undefined && { allowLate }),
        ...(instructions !== undefined && { instructions: instructions ?? null }),
        // SCORM
        ...(scormPackageUrl !== undefined && { scormPackageUrl: scormPackageUrl?.trim() ?? null }),
        ...(scormVersion !== undefined && { scormVersion: scormVersion ?? null }),
        ...(scormEntryPoint !== undefined && { scormEntryPoint: scormEntryPoint?.trim() ?? null }),
        // Discussion
        ...(discussionPrompt !== undefined && { discussionPrompt: discussionPrompt ?? null }),
      },
    });
    return Response.json(lesson);
  } catch {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.lesson.delete({ where: { id } });
    return Response.json({ deleted: true, id });
  } catch {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }
}
