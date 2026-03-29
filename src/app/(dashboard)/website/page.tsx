import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Plus,
  FileText,
  Settings,
  Navigation,
  Eye,
  Pencil,
  MoreHorizontal,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your site pages, navigation, and branding
          </p>
        </div>
        <Button
          render={<Link href="/website/pages/new" />}
          nativeButton={false}
          className="gap-2"
        >
          <Plus className="size-4" />
          New Page
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/website" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/15">
                <FileText className="size-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pages.length}</p>
                <p className="text-xs text-muted-foreground">
                  {publishedCount} published, {draftCount} draft
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/website/navigation" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <Navigation className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{navItemCount}</p>
                <p className="text-xs text-muted-foreground">Navigation items</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/website/settings" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
                <Settings className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settings ? "Configured" : "Not set"}</p>
                <p className="text-xs text-muted-foreground">Site branding</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pages list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
                <Globe className="size-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">No pages yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                Create your first page to start building your website. Pages use
                the same visual editor as course landing pages.
              </p>
              <Button
                render={<Link href="/website/pages/new" />}
                nativeButton={false}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="size-4" />
                Create your first page
              </Button>
            </div>
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
                    {page.status === "PUBLISHED" && (
                      <Button
                        render={<Link href={`/p/${page.slug}`} target="_blank" />}
                        nativeButton={false}
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="View page"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    )}
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
