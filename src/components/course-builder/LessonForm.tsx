"use client";

import { useState } from "react";
import type { LessonData, LessonType } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

interface Props {
  lesson: LessonData;
  onUpdate: (moduleId: string, lessonId: string, data: Partial<LessonData>) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function LessonForm({ lesson, onUpdate }: Props) {
  const [title, setTitle] = useState(lesson.title);
  const [type, setType] = useState<LessonType>(lesson.type);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [content, setContent] = useState(lesson.content ?? "");
  const [duration, setDuration] = useState(
    lesson.duration != null ? String(Math.round(lesson.duration / 60)) : ""
  );
  const [isPublished, setIsPublished] = useState(lesson.isPublished);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    if (!title.trim()) return;
    setSaveStatus("saving");
    try {
      const durationSeconds =
        duration !== "" ? Math.round(parseFloat(duration) * 60) : null;

      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          description: description.trim() || null,
          videoUrl: videoUrl.trim() || null,
          content: content || null,
          duration: durationSeconds,
          isPublished,
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      const updated: LessonData = await res.json();
      onUpdate(lesson.moduleId, lesson.id, updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Lesson Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="lesson-title">Title</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="lesson-description">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="lesson-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
          />
        </div>

        {/* Video URL — only for VIDEO type */}
        {type === "VIDEO" && (
          <div className="space-y-1.5">
            <Label htmlFor="lesson-video-url">Video URL</Label>
            <Input
              id="lesson-video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        {/* Duration — only for VIDEO type */}
        {type === "VIDEO" && (
          <div className="space-y-1.5">
            <Label htmlFor="lesson-duration">
              Duration{" "}
              <span className="text-muted-foreground font-normal">(minutes)</span>
            </Label>
            <Input
              id="lesson-duration"
              type="number"
              min="0"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="w-32"
            />
          </div>
        )}

        {/* Content — only for TEXT type */}
        {type === "TEXT" && (
          <div className="space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        )}

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isPublished ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                isPublished ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <Label className="cursor-pointer" onClick={() => setIsPublished((v) => !v)}>
            {isPublished ? "Published" : "Draft"}
          </Label>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving" || !title.trim()}
          size="sm"
        >
          {saveStatus === "saving" && (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          )}
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </Button>
        {saveStatus === "saved" && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckIcon className="size-3.5" /> Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-destructive">Failed to save. Try again.</span>
        )}
      </div>
    </div>
  );
}
