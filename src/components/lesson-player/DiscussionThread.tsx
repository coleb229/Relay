"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LoaderCircleIcon,
  SendIcon,
  MessageSquareIcon,
  SmileIcon,
  ReplyIcon,
} from "lucide-react";

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
}

interface Post {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  user: UserInfo;
  reactions: Reaction[];
  replies?: Post[];
}

interface Props {
  lessonId: string;
  currentUserId: string;
  discussionPrompt: string | null;
}

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "💡", "👏"];

export function DiscussionThread({
  lessonId,
  currentUserId,
  discussionPrompt,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/lessons/${lessonId}/discussion`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.data);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleSubmitPost() {
    if (!newPost.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/lessons/${lessonId}/discussion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost.trim() }),
    });
    if (res.ok) {
      const post: Post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setNewPost("");
    }
    setSubmitting(false);
  }

  async function handleReply(parentId: string, content: string) {
    const res = await fetch(`/api/lessons/${lessonId}/discussion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (res.ok) {
      const reply: Post = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === parentId
            ? { ...p, replies: [...(p.replies ?? []), reply] }
            : p
        )
      );
    }
  }

  async function handleReaction(postId: string, emoji: string) {
    const res = await fetch(
      `/api/lessons/${lessonId}/discussion/${postId}/reactions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      }
    );
    if (!res.ok) return;
    const data = await res.json();

    const updateReactions = (post: Post): Post => {
      if (post.id === postId) {
        if (data.action === "added") {
          return {
            ...post,
            reactions: [
              ...post.reactions,
              { id: data.id, postId, userId: currentUserId, emoji },
            ],
          };
        } else {
          return {
            ...post,
            reactions: post.reactions.filter(
              (r) => !(r.userId === currentUserId && r.emoji === emoji)
            ),
          };
        }
      }
      if (post.replies) {
        return { ...post, replies: post.replies.map(updateReactions) };
      }
      return post;
    };

    setPosts((prev) => prev.map(updateReactions));
  }

  return (
    <div className="space-y-6">
      {/* Discussion prompt */}
      {discussionPrompt && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Discussion Topic
          </p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: discussionPrompt }}
          />
        </div>
      )}

      {/* New post form */}
      <div className="space-y-2">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmitPost();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press Cmd+Enter to post
          </p>
          <Button
            size="sm"
            onClick={handleSubmitPost}
            disabled={submitting || !newPost.trim()}
          >
            {submitting ? (
              <LoaderCircleIcon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
            Post
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
          <LoaderCircleIcon className="size-4 animate-spin" />
          Loading discussion...
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <MessageSquareIcon className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No posts yet. Be the first to start the discussion!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onReply={handleReply}
            onReaction={handleReaction}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onReply,
  onReaction,
  isReply = false,
}: {
  post: Post;
  currentUserId: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onReaction: (postId: string, emoji: string) => Promise<void>;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  async function handleSubmitReply() {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    await onReply(post.id, replyContent.trim());
    setReplyContent("");
    setShowReplyForm(false);
    setSubmittingReply(false);
  }

  // Group reactions by emoji
  const reactionGroups = post.reactions.reduce<
    Record<string, { count: number; hasCurrentUser: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasCurrentUser: false };
    acc[r.emoji].count++;
    if (r.userId === currentUserId) acc[r.emoji].hasCurrentUser = true;
    return acc;
  }, {});

  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className={isReply ? "" : "border rounded-lg p-4"}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
          {post.user.image ? (
            <img
              src={post.user.image}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {(post.user.name ?? post.user.email ?? "?")[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {post.user.name ?? post.user.email ?? "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {/* Content */}
          <p className="text-sm mt-1 whitespace-pre-wrap">{post.content}</p>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Existing reactions */}
            {Object.entries(reactionGroups).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => onReaction(post.id, emoji)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-colors ${
                  data.hasCurrentUser
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>{emoji}</span>
                <span className="tabular-nums">{data.count}</span>
              </button>
            ))}

            {/* Add reaction */}
            <div className="relative">
              <button
                onClick={() => setShowEmojis((v) => !v)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Add reaction"
              >
                <SmileIcon className="size-3.5" />
              </button>
              {showEmojis && (
                <div className="absolute bottom-full left-0 mb-1 flex items-center gap-0.5 bg-popover border border-border rounded-lg px-1.5 py-1 shadow-lg z-10">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(post.id, emoji);
                        setShowEmojis(false);
                      }}
                      className="p-1 rounded hover:bg-muted text-sm transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply button (only on top-level posts) */}
            {!isReply && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
              >
                <ReplyIcon className="size-3.5" />
                Reply
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmitReply();
                  }
                  if (e.key === "Escape") {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }
                }}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={submittingReply || !replyContent.trim()}
                >
                  {submittingReply && (
                    <LoaderCircleIcon className="size-3.5 animate-spin" />
                  )}
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {post.replies && post.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-1 border-l-2 border-border ml-1">
              {post.replies.map((reply) => (
                <div key={reply.id} className="pl-3">
                  <PostCard
                    post={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onReaction={onReaction}
                    isReply
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
