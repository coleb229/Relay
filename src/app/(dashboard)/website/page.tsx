import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Globe,
  Plus,
  FileText,
  Settings,
  Navigation,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_TYPE_LABELS: Record<string, string> = {
  HOME: "Home",
  ABOUT: "About",
  CONTACT: "Contact",
  COURSES: "Courses",
  BLOG: "Blog",
  CUSTOM: "Custom",
  TERMS: "Terms",
  PRIVACY: "Privacy",
};

export default async function WebsitePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/");

  const [pages, navItemCount, settings] = await Promise.all([
    prisma.sitePage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.siteNavItem.count(),
    prisma.siteSettings.findFirst(),
  ]);

  const publishedCount = pages.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = pages.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Website"
        description="Manage your site pages, navigation, and branding"
      >
        <Button
          render={<Link href="/website/pages/new" />}
          nativeButton={false}
          className="gap-2"
        >
          <Plus className="size-4" />
          New Page
        </Button>
      </PageHeader>

      <MetricGrid>
        <StatMetric label="Pages" value={pages.length} description={`${publishedCount} published, ${draftCount} draft`} icon={FileText} href="/website" />
        <StatMetric label="Navigation Items" value={navItemCount} icon={Navigation} href="/website/navigation" />
        <StatMetric label="Site Branding" value={settings ? "Configured" : "Not set"} icon={Settings} href="/website/settings" />
      </MetricGrid>

      {/* Pages list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No pages yet"
              description="Create your first page to start building your website. Pages use the same visual editor as course landing pages."
            >
              <Button
                render={<Link href="/website/pages/new" />}
                nativeButton={false}
                variant="outline"
                className="gap-2"
              >
                <Plus className="size-4" />
                Create your first page
              </Button>
            </EmptyState>
          ) : (
            <div className="divide-y">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                        page.status === "PUBLISHED"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {page.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{page.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">/{page.slug}</span>
                        <span className="text-border">|</span>
                        <span>{PAGE_TYPE_LABELS[page.type] ?? page.type}</span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            page.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          {page.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      render={<Link href={`/${page.slug}`} target="_blank" />}
                      nativeButton={false}
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title="Preview page"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                    <Button
                      render={<Link href={`/website/pages/${page.id}/edit`} />}
                      nativeButton={false}
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title="Edit page"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
