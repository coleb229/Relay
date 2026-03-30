"use client";

import { useState } from "react";
import type { ApiEndpoint, HttpMethod } from "@/lib/api-docs";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DocCategory {
  name: string;
  description: string;
  tags: string[];
}

// ─── Method / Status badge styling ───────────────────────────────────────────

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET:    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  POST:   "bg-primary/10 text-primary border-primary/20",
  PATCH:  "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  PUT:    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  "2": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "4": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "5": "bg-red-500/10 text-red-700 dark:text-red-400",
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold font-mono tracking-wider ${METHOD_STYLES[method]}`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const tier = String(code)[0];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-semibold ${STATUS_STYLES[tier] ?? "bg-muted text-muted-foreground"}`}
    >
      {code}
    </span>
  );
}

// ─── Endpoint Card ───────────────────────────────────────────────────────────

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const { method, path, def } = endpoint;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
        <MethodBadge method={method} />
        <code className="text-sm font-mono font-medium flex-1">{path}</code>
        {def.adminOnly && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Admin only
          </Badge>
        )}
      </div>

      <div className="px-4 py-4 space-y-5">
        <div>
          <p className="font-semibold text-sm">{def.summary}</p>
          {def.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {def.description}
            </p>
          )}
        </div>

        {def.parameters && def.parameters.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Parameters
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-32">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-20">In</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-24">Type</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-16">Req.</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {def.parameters.map((p) => (
                    <tr key={p.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <code className="text-xs font-mono text-foreground">{p.name}</code>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-muted-foreground">{p.in}</span>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-xs font-mono text-muted-foreground">
                          {p.enum ? p.enum.join(" | ") : p.type}
                        </code>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {p.required ? (
                          <span className="text-foreground font-medium">yes</span>
                        ) : (
                          "no"
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {p.description}
                        {p.default !== undefined && (
                          <span className="ml-1 text-muted-foreground/60">
                            (default: {p.default})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {def.requestBody && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Request Body
            </p>
            <p className="text-xs text-muted-foreground mb-2">{def.requestBody.description}</p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-32">Field</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-28">Type</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-16">Req.</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(def.requestBody.fields).map(([field, schema]) => (
                    <tr key={field} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <code className="text-xs font-mono text-foreground">{field}</code>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-xs font-mono text-muted-foreground">
                          {schema.enum ? schema.enum.join(" | ") : schema.type}
                        </code>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {schema.required ? (
                          <span className="text-foreground font-medium">yes</span>
                        ) : (
                          "no"
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {schema.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Responses
          </p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(def.responses).map(([code, resp]) => (
              <div key={code} className="flex items-center gap-3 text-sm">
                <StatusBadge code={Number(code)} />
                <span className="text-muted-foreground text-xs">{resp.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main client shell ───────────────────────────────────────────────────────

export function DocsClient({
  categories,
  groups,
  totalEndpoints,
}: {
  categories: DocCategory[];
  groups: Record<string, ApiEndpoint[]>;
  totalEndpoints: number;
}) {
  // Resolve the first available tag as the default
  const allTags = categories.flatMap((c) => c.tags).filter((t) => groups[t]);
  const [activeTag, setActiveTag] = useState(allTags[0] ?? "");

  // Find which category the active tag belongs to
  const activeCat = categories.find((c) => c.tags.includes(activeTag));
  const activeEndpoints = groups[activeTag] ?? [];

  return (
    <div className="flex gap-8 max-w-7xl h-full">
      {/* ── Sidebar nav ── */}
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-0 pt-1 max-h-[calc(100vh-5rem)] overflow-y-auto pb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">
            API Reference
          </p>
          <nav className="flex flex-col gap-5">
            {categories.map((cat) => {
              const visibleTags = cat.tags.filter((t) => groups[t]);
              if (visibleTags.length === 0) return null;
              return (
                <div key={cat.name}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1.5">
                    {cat.name}
                  </p>
                  <div className="flex flex-col gap-px">
                    {visibleTags.map((tag) => {
                      const isActive = activeTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(tag)}
                          className={`group flex items-center justify-between text-sm px-2 py-1.5 rounded-lg transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) text-left ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{tag}</span>
                          <span
                            className={`text-[10px] font-mono tabular-nums ${
                              isActive
                                ? "text-primary/60"
                                : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
                            }`}
                          >
                            {groups[tag]?.length ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Content panel ── */}
      <div className="flex-1 min-w-0 space-y-8 pb-24">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-xl font-semibold tracking-tight">API Reference</h1>
            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground">
              {totalEndpoints} endpoints
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            All endpoints require an active session (Google OAuth via NextAuth). Unauthenticated
            requests return <code className="font-mono text-xs">401 Unauthorized</code>. Endpoints
            marked <strong>Admin only</strong> additionally require the{" "}
            <code className="font-mono text-xs">ADMIN</code> or{" "}
            <code className="font-mono text-xs">INSTRUCTOR</code> role.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-muted-foreground font-medium">Base URL:</span>
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md">/api</code>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {(["GET", "POST", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
              <MethodBadge key={m} method={m} />
            ))}
          </div>
        </div>

        {/* Active section */}
        {activeEndpoints.length > 0 && (
          <div className="space-y-6">
            {/* Section header */}
            <div className="border-b border-border pb-3">
              {activeCat && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                  {activeCat.name}
                </p>
              )}
              <h2 className="text-lg font-bold tracking-tight">{activeTag}</h2>
              {activeCat && (
                <p className="text-sm text-muted-foreground mt-1">{activeCat.description}</p>
              )}
              <p className="text-xs text-muted-foreground/50 font-mono mt-2">
                {activeEndpoints.length} endpoint{activeEndpoints.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Endpoint cards */}
            <div className="space-y-4">
              {activeEndpoints.map((endpoint) => (
                <EndpointCard
                  key={`${endpoint.method}-${endpoint.path}`}
                  endpoint={endpoint}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
