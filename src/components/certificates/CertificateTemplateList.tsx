"use client";

import { useState, useCallback } from "react";
import { Plus, Search, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CertificateTemplateCard } from "./CertificateTemplateCard";

interface Template {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  orientation: string;
  designData?: unknown;
  backgroundColor?: string | null;
  borderStyle?: string | null;
  logoUrl?: string | null;
  course?: { id: string; title: string } | null;
  _count?: { certificates: number };
  updatedAt: string;
}

interface CertificateTemplateListProps {
  templates: Template[];
}

const statusFilters = ["ALL", "ACTIVE", "DRAFT", "ARCHIVED"] as const;

export function CertificateTemplateList({ templates: initialTemplates }: CertificateTemplateListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = initialTemplates.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = useCallback(async () => {
    try {
      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Template" }),
      });
      if (res.ok) {
        const template = await res.json();
        router.push(`/certificates/templates/${template.id}`);
      }
    } catch {
      // Handle error
    }
  }, [router]);

  const handleDuplicate = useCallback(async (id: string) => {
    const original = initialTemplates.find((t) => t.id === id);
    if (!original) return;
    try {
      const res = await fetch("/api/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${original.name} (Copy)`,
          description: original.description,
          designData: original.designData,
          orientation: original.orientation,
          backgroundColor: original.backgroundColor,
          borderStyle: original.borderStyle,
          logoUrl: original.logoUrl,
        }),
      });
      if (res.ok) router.refresh();
    } catch {
      // Handle error
    }
  }, [initialTemplates, router]);

  const handleArchive = useCallback(async (id: string) => {
    try {
      await fetch(`/api/certificates/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      router.refresh();
    } catch {
      // Handle error
    }
  }, [router]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this template? All certificates using it will also be deleted.")) return;
    try {
      await fetch(`/api/certificates/templates/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      // Handle error
    }
  }, [router]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" data-icon="inline-start" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <CertificateTemplateCard
              key={template.id}
              template={template}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
            <Award className="h-7 w-7 text-violet-600" />
          </div>
          <h3 className="mt-4 font-medium text-foreground">No templates found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first certificate template to get started"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Button size="sm" className="mt-4" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" data-icon="inline-start" />
              Create Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
