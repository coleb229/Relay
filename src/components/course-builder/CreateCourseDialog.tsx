"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { PlusIcon, LoaderCircleIcon } from "lucide-react";

interface Props {
  instructorId: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCourseDialog({ instructorId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugify(title),
          instructorId,
          status: "DRAFT",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create course.");
        setSaving(false);
        return;
      }

      const course = await res.json();
      setOpen(false);
      setTitle("");
      router.push(`/courses/${course.id}/edit?new=1`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTitle("");
      setError(null);
    }
    setOpen(next);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        New Course
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="new-course-title">Course title</Label>
              <Input
                id="new-course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Python"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>

            {title && (
              <p className="text-xs text-muted-foreground">
                Slug:{" "}
                <span className="font-mono">{slugify(title) || "—"}</span>
              </p>
            )}

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={saving} />}>
              Cancel
            </DialogClose>
            <Button onClick={handleCreate} disabled={saving || !title.trim()}>
              {saving && <LoaderCircleIcon className="size-3.5 animate-spin" />}
              {saving ? "Creating…" : "Create & Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
