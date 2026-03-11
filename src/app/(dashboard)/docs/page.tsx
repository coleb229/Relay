import { auth } from "../../../../auth";
import { getEndpointsByTag } from "@/lib/api-registry";
import type { ApiEndpoint, HttpMethod } from "@/lib/api-docs";
import { Badge } from "@/components/ui/badge";

// ─── Method badge styling ─────────────────────────────────────────────────────

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

// ─── Endpoint Card ────────────────────────────────────────────────────────────

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const { method, path, def } = endpoint;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
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
        {/* Summary + description */}
        <div>
          <p className="font-semibold text-sm">{def.summary}</p>
          {def.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {def.description}
            </p>
          )}
        </div>

        {/* Parameters */}
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

        {/* Request body */}
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

        {/* Responses */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DocsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const allGroups = getEndpointsByTag();

  // Filter out adminOnly endpoints for non-admins
  const groups = new Map<string, ApiEndpoint[]>();
  for (const [tag, endpoints] of allGroups) {
    const visible = isAdmin ? endpoints : endpoints.filter((e) => !e.def.adminOnly);
    if (visible.length > 0) groups.set(tag, visible);
  }

  const tags = Array.from(groups.keys());

  return (
    <div className="flex gap-8 max-w-6xl">
      {/* Left nav — sticky */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-0 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            Resources
          </p>
          <nav className="flex flex-col gap-0.5">
            {tags.map((tag) => (
              <a
                key={tag}
                href={`#${tag.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                {tag}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right content */}
      <div className="flex-1 min-w-0 space-y-12">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold tracking-tight">API Reference</h1>
            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground">
              Base URL: /api
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            All endpoints require an active session (Google OAuth via NextAuth). Unauthenticated
            requests return <code className="font-mono text-xs">401 Unauthorized</code>. Endpoints
            marked <strong>Admin only</strong> additionally require the{" "}
            <code className="font-mono text-xs">ADMIN</code> or{" "}
            <code className="font-mono text-xs">INSTRUCTOR</code> role.
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(["GET", "POST", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
              <div key={m} className="flex items-center gap-1.5">
                <MethodBadge method={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint groups */}
        {tags.map((tag) => (
          <section key={tag} id={tag.toLowerCase()} className="space-y-4 scroll-mt-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-lg font-bold">{tag}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {groups.get(tag)!.length} endpoint{groups.get(tag)!.length !== 1 ? "s" : ""}
              </p>
            </div>
            {groups.get(tag)!.map((endpoint) => (
              <EndpointCard
                key={`${endpoint.method}-${endpoint.path}`}
                endpoint={endpoint}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
