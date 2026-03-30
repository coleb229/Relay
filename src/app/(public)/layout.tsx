import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/website/PublicHeader";
import type { PublicNavItem } from "@/components/website/PublicHeader";
import { PublicFooter } from "@/components/website/PublicFooter";

async function getSiteData() {
  const [settings, headerItems, footerItems] = await Promise.all([
    prisma.siteSettings.findFirst().then(
      (s) =>
        s ?? prisma.siteSettings.create({ data: {} })
    ),
    prisma.siteNavItem.findMany({
      where: { location: "header", parentId: null, visible: true },
      include: {
        children: {
          where: { visible: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
    prisma.siteNavItem.findMany({
      where: { location: "footer", parentId: null, visible: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return { settings, headerItems, footerItems };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, headerItems, footerItems } = await getSiteData();

  const headerNav: PublicNavItem[] = headerItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    target: item.target,
    children: item.children.map((child) => ({
      id: child.id,
      label: child.label,
      href: child.href,
      target: child.target,
    })),
  }));

  const footerNav = footerItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    target: item.target,
  }));

  const themeStyle: React.CSSProperties = {
    ...(settings.primaryColor ? { "--color-primary": settings.primaryColor } : {}),
    ...(settings.accentColor ? { "--color-accent": settings.accentColor } : {}),
    ...(settings.fontFamily ? { fontFamily: settings.fontFamily } : {}),
  } as React.CSSProperties;

  return (
    <div className="flex min-h-screen flex-col" style={themeStyle}>
      <PublicHeader
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        navItems={headerNav}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        footerText={settings.footerText}
        socialLinks={settings.socialLinks as Record<string, string> | null}
        navItems={footerNav}
      />
      {settings.customCss && (
        <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />
      )}
    </div>
  );
}
