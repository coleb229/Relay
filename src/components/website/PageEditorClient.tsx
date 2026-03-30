"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Globe,
  Settings,
  Trash2,
  ExternalLink,
  EyeOff,
  CheckIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageSection } from "@/components/page-builder/schemas";

interface PageEditorClientProps {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  pageStatus: string;
  pageType: string;
  seoTitle: string | null;
  seoDescription: string | null;
  initialSections: PageSection[] | null;
}

export function PageEditorClient({
  pageId,
  pageTitle: initialTitle,
  pageSlug: initialSlug,
  pageStatus: initialStatus,
  pageType,
  seoTitle: initialSeoTitle,
  seoDescription: initialSeoDescription,
  initialSections,
}: PageEditorClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState(initialStatus);
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription ?? "");
  const [showSettings, setShowSettings] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const metaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMetadata = useCallback(
    async (data: Record<string, unknown>) => {
      setMetaSaving(true);
      setMetaSaved(false);
      try {
        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setMetaSaved(true);
          if (metaTimerRef.current) clearTimeout(metaTimerRef.current);
          metaTimerRef.current = setTimeout(() => setMetaSaved(false), 2000);
        }
      } finally {
        setMetaSaving(false);
      }
    },
    [pageId]
  );

  // Debounced title/slug save
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (title === initialTitle && slug === initialSlug) return;
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      saveMetadata({ title, slug });
    }, 800);
    return () => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, [title, slug, initialTitle, initialSlug, saveMetadata]);

  async function togglePublish() {
    const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setStatus(newStatus);
    await saveMetadata({ status: newStatus });
  }

  async function handleDelete() {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
    router.push("/website");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            render={<Link href="/website" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-sm font-semibold outline-none border-none min-w-0 w-48 focus:ring-1 focus:ring-ring rounded px-1"
          />
          <span className="text-xs text-muted-foreground shrink-0">/{slug}</span>
          {metaSaving && <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />}
          {metaSaved && <CheckIcon className="size-3.5 text-emerald-500" />}
        </div>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href={`/${slug}`} target="_blank" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <ExternalLink className="size-3.5" />
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn("gap-1.5 text-xs", showSettings && "bg-muted")}
          >
            <Settings className="size-3.5" />
            Settings
          </Button>
          <Button
            variant={status === "PUBLISHED" ? "outline" : "default"}
            size="sm"
            onClick={togglePublish}
            className="gap-1.5 text-xs"
          >
            {status === "PUBLISHED" ? (
              <>
                <EyeOff className="size-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="size-3.5" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings drawer */}
      {showSettings && (
        <div className="border-b bg-muted/30 px-4 py-4 shrink-0">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Page Type</label>
                <p className="mt-1 px-3 py-1.5 text-sm text-muted-foreground">{pageType}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                onBlur={() => saveMetadata({ seoTitle: seoTitle || null })}
                placeholder={title}
                className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                onBlur={() => saveMetadata({ seoDescription: seoDescription || null })}
                placeholder="Page description for search engines..."
                rows={2}
                className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none resize-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                {deleting ? "Deleting..." : "Delete Page"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page builder */}
      <div className="flex-1 min-h-0">
        <PageBuilder
          saveEndpoint={`/api/pages/${pageId}`}
          savePayloadKey="sections"
          initialSections={initialSections}
          defaultSectionsConfig={{
            title,
            description: null,
            imageUrl: null,
          }}
        />
      </div>
    </div>
  );
}
