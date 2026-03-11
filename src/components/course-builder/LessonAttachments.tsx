"use client";

import { useState, useEffect } from "react";
import type { LessonData, AttachmentData } from "./types";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Trash2Icon, DownloadIcon, PaperclipIcon } from "lucide-react";

interface Props {
  lesson: LessonData;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonAttachments({ lesson }: Props) {
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lessons/${lesson.id}/attachments`)
      .then((r) => r.json())
      .then((data) => {
        setAttachments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lesson.id]);

  async function handleDelete(attachmentId: string) {
    const res = await fetch(`/api/lessons/${lesson.id}/attachments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachmentId }),
    });
    if (res.ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Attachments</h3>

      <UploadButton<OurFileRouter, "lessonAttachment">
        endpoint="lessonAttachment"
        onClientUploadComplete={async (res) => {
          if (!res?.[0]) return;
          const file = res[0];
          const postRes = await fetch(`/api/lessons/${lesson.id}/attachments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              url: file.url,
              size: file.size,
            }),
          });
          if (postRes.ok) {
            const attachment: AttachmentData = await postRes.json();
            setAttachments((prev) => [...prev, attachment]);
          }
        }}
        onUploadError={(err) => console.error("Upload error:", err)}
        appearance={{
          button: "ut-ready:bg-primary ut-ready:text-primary-foreground ut-uploading:opacity-60 text-xs h-8 px-3 rounded-md font-medium",
          allowedContent: "text-muted-foreground text-xs",
        }}
      />

      {loading && (
        <p className="text-xs text-muted-foreground">Loading attachments…</p>
      )}

      {!loading && attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-1.5">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate min-w-0 font-medium">{a.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(a.size)}
              </span>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Download"
              >
                <DownloadIcon className="size-3.5" />
              </a>
              <button
                onClick={() => handleDelete(a.id)}
                className="shrink-0 p-1 rounded hover:bg-destructive/10 text-destructive"
                aria-label="Delete attachment"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
