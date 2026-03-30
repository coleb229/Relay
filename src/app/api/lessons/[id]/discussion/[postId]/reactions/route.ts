import { auth } from "../../../../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  POST: {
    summary: "Toggle a reaction on a discussion post",
    description:
      "Adds or removes an emoji reaction on a discussion post. If the user already reacted with the same emoji, the reaction is removed (toggle behavior).",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        type: "string",
        description: "Lesson ID",
      },
      {
        name: "postId",
        in: "path",
        required: true,
        type: "string",
        description: "Discussion post ID",
      },
    ],
    requestBody: {
      description: "Reaction emoji",
      fields: {
        emoji: {
          type: "string",
          description: 'Emoji character (e.g. "👍", "❤️", "🔥")',
        },
      },
    },
    responses: {
      200: { description: "Reaction toggled (added or removed)" },
      400: { description: "Missing emoji" },
      401: { description: "Not authenticated" },
      404: { description: "Post not found" },
    },
  },
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const body = await req.json();
  const { emoji } = body;

  if (!emoji) {
    return Response.json({ error: "Emoji is required" }, { status: 400 });
  }

  // Check post exists
  const post = await prisma.discussionPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  // Toggle: find existing reaction
  const existing = await prisma.discussionReaction.findUnique({
    where: {
      postId_userId_emoji: {
        postId,
        userId: session.user.id,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.discussionReaction.delete({ where: { id: existing.id } });
    return Response.json({ action: "removed", emoji });
  }

  const reaction = await prisma.discussionReaction.create({
    data: {
      postId,
      userId: session.user.id,
      emoji,
    },
  });

  return Response.json({ action: "added", emoji, id: reaction.id });
}
