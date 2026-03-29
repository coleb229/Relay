import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { SiteSettingsEditor } from "@/components/website/SiteSettingsEditor";

export default async function SiteSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }

  return (
    <SiteSettingsEditor
      initialSettings={{
        siteName: settings.siteName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        fontFamily: settings.fontFamily,
        footerText: settings.footerText,
        socialLinks: settings.socialLinks as Record<string, string> | null,
        customCss: settings.customCss,
        analyticsId: settings.analyticsId,
      }}
    />
  );
}
