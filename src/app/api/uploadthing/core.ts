import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "../../../../auth";

const f = createUploadthing();

async function requireInstructor() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    throw new Error("Forbidden");
  }
  return { userId: session.user.id };
}

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(requireInstructor)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  lessonAttachment: f(["image", "pdf", "text", "video", "audio"])
    .middleware(requireInstructor)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
