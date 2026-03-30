"use client";

import { useState } from "react";
import type { LessonData, LessonType } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RichTextEditor = dynamic(
  () =>
    import("./RichTextEditor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-input overflow-hidden">
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/30">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="size-7 rounded" />
          ))}
        </div>
        <Skeleton className="h-50 w-full" />
      </div>
    ),
  }
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckIcon,
  LoaderCircleIcon,
  FileTextIcon,
  VideoIcon,
  HelpCircleIcon,
  FileIcon,
  HeadphonesIcon,
  PresentationIcon,
  DownloadIcon,
  CodeIcon,
  ClipboardCheckIcon,
  RadioIcon,
  ClipboardListIcon,
  BookOpenIcon,
  MessageSquareIcon,
  PackageIcon,
} from "lucide-react";
import { LessonAttachments } from "./LessonAttachments";

interface Props {
  lesson: LessonData;
  onUpdate: (moduleId: string, lessonId: string, data: Partial<LessonData>) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string; icon: React.ReactNode }[] = [
  { value: "TEXT", label: "Text", icon: <FileTextIcon className="size-3.5" /> },
  { value: "VIDEO", label: "Video", icon: <VideoIcon className="size-3.5" /> },
  { value: "QUIZ", label: "Quiz", icon: <HelpCircleIcon className="size-3.5" /> },
  { value: "PDF", label: "PDF", icon: <FileIcon className="size-3.5" /> },
  { value: "AUDIO", label: "Audio", icon: <HeadphonesIcon className="size-3.5" /> },
  { value: "PRESENTATION", label: "Presentation", icon: <PresentationIcon className="size-3.5" /> },
  { value: "DOWNLOAD", label: "Download", icon: <DownloadIcon className="size-3.5" /> },
  { value: "EMBED", label: "Embed", icon: <CodeIcon className="size-3.5" /> },
  { value: "ASSIGNMENT", label: "Assignment", icon: <ClipboardCheckIcon className="size-3.5" /> },
  { value: "LIVE_SESSION", label: "Live Session", icon: <RadioIcon className="size-3.5" /> },
  { value: "SURVEY", label: "Survey", icon: <ClipboardListIcon className="size-3.5" /> },
  { value: "EBOOK", label: "Ebook", icon: <BookOpenIcon className="size-3.5" /> },
  { value: "DISCUSSION", label: "Discussion", icon: <MessageSquareIcon className="size-3.5" /> },
  { value: "SCORM", label: "SCORM", icon: <PackageIcon className="size-3.5" /> },
];

const PLATFORM_OPTIONS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "webex", label: "Webex" },
  { value: "other", label: "Other" },
];

const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "TEXT", label: "Text Submission" },
  { value: "FILE", label: "File Upload" },
  { value: "VIDEO", label: "Video Recording" },
  { value: "AUDIO", label: "Audio Recording" },
];

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

  // File-based fields
  const [fileUrl, setFileUrl] = useState(lesson.fileUrl ?? "");
  const [fileName, setFileName] = useState(lesson.fileName ?? "");

  // Audio
  const [audioUrl, setAudioUrl] = useState(lesson.audioUrl ?? "");

  // Embed
  const [embedCode, setEmbedCode] = useState(lesson.embedCode ?? "");

  // Live Session
  const [meetingUrl, setMeetingUrl] = useState(lesson.meetingUrl ?? "");
  const [meetingPlatform, setMeetingPlatform] = useState(lesson.meetingPlatform ?? "zoom");
  const [scheduledAt, setScheduledAt] = useState(
    lesson.scheduledAt ? new Date(lesson.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [recordingUrl, setRecordingUrl] = useState(lesson.recordingUrl ?? "");

  // Assignment
  const [assignmentType, setAssignmentType] = useState(lesson.assignmentType ?? "TEXT");
  const [maxScore, setMaxScore] = useState(lesson.maxScore != null ? String(lesson.maxScore) : "100");
  const [dueDate, setDueDate] = useState(
    lesson.dueDate ? new Date(lesson.dueDate).toISOString().slice(0, 16) : ""
  );
  const [allowLate, setAllowLate] = useState(lesson.allowLate);
  const [instructions, setInstructions] = useState(lesson.instructions ?? "");

  // SCORM
  const [scormPackageUrl, setScormPackageUrl] = useState(lesson.scormPackageUrl ?? "");
  const [scormVersion, setScormVersion] = useState(lesson.scormVersion ?? "1.2");
  const [scormEntryPoint, setScormEntryPoint] = useState(lesson.scormEntryPoint ?? "");

  // Discussion
  const [discussionPrompt, setDiscussionPrompt] = useState(lesson.discussionPrompt ?? "");

  async function handleSave() {
    if (!title.trim()) return;
    setSaveStatus("saving");
    try {
      const durationSeconds =
        duration !== "" ? Math.round(parseFloat(duration) * 60) : null;

      const payload: Record<string, unknown> = {
        title: title.trim(),
        type,
        description: description.trim() || null,
        isPublished,
        duration: durationSeconds,
      };

      // Type-specific fields
      if (type === "TEXT") {
        payload.content = content || null;
      } else if (type === "VIDEO") {
        payload.videoUrl = videoUrl.trim() || null;
      } else if (type === "PDF" || type === "PRESENTATION" || type === "DOWNLOAD") {
        payload.fileUrl = fileUrl.trim() || null;
        payload.fileName = fileName.trim() || null;
      } else if (type === "AUDIO") {
        payload.audioUrl = audioUrl.trim() || null;
        payload.fileUrl = fileUrl.trim() || null;
        payload.fileName = fileName.trim() || null;
      } else if (type === "EMBED") {
        payload.embedCode = embedCode || null;
      } else if (type === "LIVE_SESSION") {
        payload.meetingUrl = meetingUrl.trim() || null;
        payload.meetingPlatform = meetingPlatform || null;
        payload.scheduledAt = scheduledAt || null;
        payload.recordingUrl = recordingUrl.trim() || null;
      } else if (type === "ASSIGNMENT") {
        payload.assignmentType = assignmentType;
        payload.maxScore = maxScore !== "" ? Number(maxScore) : null;
        payload.dueDate = dueDate || null;
        payload.allowLate = allowLate;
        payload.instructions = instructions || null;
      } else if (type === "SCORM") {
        payload.scormPackageUrl = scormPackageUrl.trim() || null;
        payload.scormVersion = scormVersion || null;
        payload.scormEntryPoint = scormEntryPoint.trim() || null;
      } else if (type === "EBOOK") {
        payload.content = content || null;
      } else if (type === "DISCUSSION") {
        payload.discussionPrompt = discussionPrompt || null;
      }

      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
              {LESSON_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
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

        {/* ── TEXT type fields ── */}
        {type === "TEXT" && (
          <div className="space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        )}

        {/* ── VIDEO type fields ── */}
        {type === "VIDEO" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-video-url">Video URL</Label>
              <Input
                id="lesson-video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
              />
            </div>
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
          </>
        )}

        {/* ── PDF type fields ── */}
        {type === "PDF" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-file-url">PDF URL</Label>
              <Input
                id="lesson-file-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://... (upload via attachments or paste URL)"
              />
              <p className="text-xs text-muted-foreground">
                Upload a PDF file or paste a direct URL. The PDF will be rendered in the course player.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-file-name">
                Display Name{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="lesson-file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Chapter 3 - Design Principles.pdf"
              />
            </div>
          </>
        )}

        {/* ── AUDIO type fields ── */}
        {type === "AUDIO" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-audio-url">Audio URL</Label>
              <Input
                id="lesson-audio-url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://... (MP3, WAV, OGG, or streaming URL)"
              />
              <p className="text-xs text-muted-foreground">
                Paste a direct audio file URL or streaming link. Supports MP3, WAV, OGG formats.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-duration-audio">
                Duration{" "}
                <span className="text-muted-foreground font-normal">(minutes)</span>
              </Label>
              <Input
                id="lesson-duration-audio"
                type="number"
                min="0"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-32"
              />
            </div>
          </>
        )}

        {/* ── PRESENTATION type fields ── */}
        {type === "PRESENTATION" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-pres-url">Presentation URL</Label>
              <Input
                id="lesson-pres-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://... (.pptx, .pdf, or Google Slides link)"
              />
              <p className="text-xs text-muted-foreground">
                Upload a PowerPoint/PDF file or paste a Google Slides embed URL.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-pres-name">
                Display Name{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="lesson-pres-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Week 3 Slides"
              />
            </div>
          </>
        )}

        {/* ── DOWNLOAD type fields ── */}
        {type === "DOWNLOAD" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-download-url">File URL</Label>
              <Input
                id="lesson-download-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://... (any downloadable file)"
              />
              <p className="text-xs text-muted-foreground">
                Upload any file for students to download — worksheets, templates, resources, etc.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-download-name">File Name</Label>
              <Input
                id="lesson-download-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. project-template.zip"
              />
            </div>
          </>
        )}

        {/* ── EMBED type fields ── */}
        {type === "EMBED" && (
          <div className="space-y-1.5">
            <Label htmlFor="lesson-embed">Embed Code or URL</Label>
            <Textarea
              id="lesson-embed"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder={'<iframe src="https://..." ...></iframe>\nor\nhttps://example.com/page'}
              rows={5}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Paste an iframe embed code or an external URL. The content will be displayed inline in the course player.
            </p>
          </div>
        )}

        {/* ── LIVE_SESSION type fields ── */}
        {type === "LIVE_SESSION" && (
          <>
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={meetingPlatform} onValueChange={(v) => v && setMeetingPlatform(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-meeting-url">Meeting URL</Label>
              <Input
                id="lesson-meeting-url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lesson-scheduled">Scheduled Date & Time</Label>
                <Input
                  id="lesson-scheduled"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-session-duration">
                  Duration{" "}
                  <span className="text-muted-foreground font-normal">(minutes)</span>
                </Label>
                <Input
                  id="lesson-session-duration"
                  type="number"
                  min="0"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-recording-url">
                Recording URL{" "}
                <span className="text-muted-foreground font-normal">(optional, add after session)</span>
              </Label>
              <Input
                id="lesson-recording-url"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {/* ── ASSIGNMENT type fields ── */}
        {type === "ASSIGNMENT" && (
          <>
            <div className="space-y-1.5">
              <Label>Submission Type</Label>
              <Select value={assignmentType} onValueChange={(v) => v && setAssignmentType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Instructions for Students</Label>
              <RichTextEditor value={instructions} onChange={setInstructions} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lesson-max-score">Max Score</Label>
                <Input
                  id="lesson-max-score"
                  type="number"
                  min="0"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-due-date">
                  Due Date{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="lesson-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={allowLate}
                onClick={() => setAllowLate((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  allowLate ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-(--dur-feedback) ease-(--ease-out-quart) ${
                    allowLate ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <Label className="cursor-pointer" onClick={() => setAllowLate((v) => !v)}>
                Allow late submissions
              </Label>
            </div>
          </>
        )}

        {/* ── SURVEY type fields ── */}
        {type === "SURVEY" && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
            <p className="text-sm font-medium">Survey Builder</p>
            <p className="text-xs text-muted-foreground">
              Save this lesson, then use the Survey Builder below to add and manage questions.
              Supports free text, star ratings, multiple choice, checkboxes, and numeric scale (1-10) questions.
            </p>
          </div>
        )}

        {/* ── EBOOK type fields ── */}
        {type === "EBOOK" && (
          <div className="space-y-1.5">
            <Label>Ebook Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
            <p className="text-xs text-muted-foreground">
              Write or paste your ebook content. Supports rich text formatting, images, and embedded media.
              Students will read this in a clean, paginated reader view.
            </p>
          </div>
        )}

        {/* ── DISCUSSION type fields ── */}
        {type === "DISCUSSION" && (
          <div className="space-y-1.5">
            <Label>Discussion Prompt</Label>
            <RichTextEditor value={discussionPrompt} onChange={setDiscussionPrompt} />
            <p className="text-xs text-muted-foreground">
              Set the topic or question for students to discuss. Students can create threaded posts and react to each other&apos;s comments.
            </p>
          </div>
        )}

        {/* ── SCORM type fields ── */}
        {type === "SCORM" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-scorm-url">SCORM Package URL</Label>
              <Input
                id="lesson-scorm-url"
                value={scormPackageUrl}
                onChange={(e) => setScormPackageUrl(e.target.value)}
                placeholder="https://... (URL to your uploaded SCORM .zip package)"
              />
              <p className="text-xs text-muted-foreground">
                Upload your SCORM package (.zip) via attachments, then paste the URL here.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>SCORM Version</Label>
                <Select value={scormVersion} onValueChange={(v) => v && setScormVersion(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">SCORM 1.2</SelectItem>
                    <SelectItem value="2004">SCORM 2004</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-scorm-entry">
                  Entry Point{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="lesson-scorm-entry"
                  value={scormEntryPoint}
                  onChange={(e) => setScormEntryPoint(e.target.value)}
                  placeholder="index.html"
                />
              </div>
            </div>
          </>
        )}

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isPublished ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-(--dur-feedback) ease-(--ease-out-quart) ${
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

      <div className="border-t border-border pt-5">
        <LessonAttachments lesson={lesson} />
      </div>
    </div>
  );
}
