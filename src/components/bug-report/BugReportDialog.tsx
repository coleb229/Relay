"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { LoaderCircleIcon, CheckCircle2, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name?: string | null; email?: string | null };
}

type Status = "idle" | "submitting" | "success" | "error";

const SEVERITY_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export function BugReportDialog({ open, onOpenChange, user }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("bug");
  const [severity, setSeverity] = useState<string>("medium");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [issueNumber, setIssueNumber] = useState<number | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setType("bug");
    setSeverity("medium");
    setImageUrls([]);
    setStatus("idle");
    setError(null);
    setIssueUrl(null);
    setIssueNumber(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) return;
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          severity,
          pageUrl: window.location.href,
          imageUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit report.");
        setStatus("error");
        return;
      }

      const data = await res.json();
      setIssueUrl(data.issueUrl);
      setIssueNumber(data.issueNumber);
      setStatus("success");

      setTimeout(() => handleOpenChange(false), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium">Report submitted!</p>
            {issueUrl && (
              <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Issue #{issueNumber} created on GitHub
              </a>
            )}
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {type === "feature"
                  ? "Request a Feature"
                  : type === "question"
                    ? "Ask a Question"
                    : "Report a Bug"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="space-y-1.5">
                <Label htmlFor="report-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v ?? "bug")}>
                  <SelectTrigger id="report-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-title">Title</Label>
                <Input
                  id="report-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect?"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-severity">Severity</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v ?? "medium")}>
                  <SelectTrigger id="report-severity" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["low", "medium", "high", "critical"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className={`inline-block size-2 rounded-full ${SEVERITY_DOT[s]}`} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Screenshots</Label>
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imageUrls.map((url, i) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt={`Screenshot ${i + 1}`}
                          className="h-16 w-auto rounded border border-border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground size-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageUrls.length < 4 && (
                  <UploadButton<OurFileRouter, "bugReportImage">
                    endpoint="bugReportImage"
                    onClientUploadComplete={(res) => {
                      if (res) {
                        setImageUrls((prev) => [
                          ...prev,
                          ...res.map((f) => f.url),
                        ]);
                      }
                    }}
                    onUploadError={(err) => {
                      console.error("Upload error:", err);
                    }}
                    appearance={{
                      button:
                        "bg-muted text-muted-foreground text-xs hover:bg-muted/80 ut-uploading:bg-muted/60",
                      allowedContent: "text-xs text-muted-foreground",
                    }}
                  />
                )}
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" disabled={status === "submitting"} />
                }
              >
                Cancel
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={
                  status === "submitting" || !title.trim() || !description.trim()
                }
              >
                {status === "submitting" && (
                  <LoaderCircleIcon className="size-3.5 animate-spin" />
                )}
                {status === "submitting" ? "Submitting…" : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
