"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Home, Info, Phone, BookOpen, Newspaper, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PAGE_TYPES = [
  { type: "CUSTOM", label: "Custom Page", description: "A blank page you can customize", icon: FileText },
  { type: "HOME", label: "Home", description: "Your site's landing page", icon: Home },
  { type: "ABOUT", label: "About", description: "Tell visitors about your school", icon: Info },
  { type: "CONTACT", label: "Contact", description: "Contact form and info", icon: Phone },
  { type: "COURSES", label: "Courses", description: "Course catalog page", icon: BookOpen },
  { type: "BLOG", label: "Blog", description: "Blog listing page", icon: Newspaper },
  { type: "TERMS", label: "Terms of Service", description: "Legal terms and conditions", icon: Shield },
  { type: "PRIVACY", label: "Privacy Policy", description: "Privacy and data policy", icon: Lock },
] as const;

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<string>("CUSTOM");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type: selectedType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to create page");
        setCreating(false);
        return;
      }

      const page = await res.json();
      router.push(`/website/pages/${page.id}/edit`);
    } catch {
      alert("Failed to create page");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/website" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          className="size-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Create New Page</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page Title</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. About Us, FAQ, Getting Started..."
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) handleCreate();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAGE_TYPES.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  selectedType === type
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    selectedType === type
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          render={<Link href="/website" />}
          nativeButton={false}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!title.trim() || creating}
        >
          {creating ? "Creating..." : "Create Page"}
        </Button>
      </div>
    </div>
  );
}
