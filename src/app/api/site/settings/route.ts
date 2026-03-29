import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import type { RouteDefinition } from "@/lib/api-docs";

export const definition: RouteDefinition = {
  GET: {
    summary: "Get site settings",
    description:
      "Returns the global site settings (branding, colors, social links, etc.). Creates default settings if none exist.",
    responses: {
      200: { description: "Site settings object" },
      401: { description: "Not authenticated" },
    },
  },
  PATCH: {
    summary: "Update site settings",
    description:
      "Updates global site settings. Supports partial updates — only provided fields are changed. Requires ADMIN role.",
    adminOnly: true,
    requestBody: {
      description: "Settings fields to update (all optional)",
      fields: {
        siteName: { type: "string", description: "Site display name" },
        tagline: { type: "string", description: "Site tagline / subtitle" },
        logoUrl: { type: "string", description: "Logo image URL" },
        faviconUrl: { type: "string", description: "Favicon URL" },
        primaryColor: { type: "string", description: "Primary brand color (oklch or hex)" },
        accentColor: { type: "string", description: "Accent brand color (oklch or hex)" },
        fontFamily: { type: "string", description: "Google Fonts font family name" },
        footerText: { type: "string", description: "Custom footer text / copyright" },
        socialLinks: { type: "object", description: "Social media links: { twitter, facebook, linkedin, youtube, instagram }" },
        customCss: { type: "string", description: "Custom CSS to inject site-wide" },
        analyticsId: { type: "string", description: "Google Analytics measurement ID" },
      },
    },
    responses: {
      200: { description: "Updated settings object" },
      401: { description: "Not authenticated" },
      403: { description: "Insufficient role" },
    },
  },
};

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findFirst();
  if (existing) return existing;
  return prisma.siteSettings.create({ data: {} });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getOrCreateSettings();
  return Response.json(settings);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden — ADMIN only" }, { status: 403 });
  }

  const settings = await getOrCreateSettings();
  const body = await request.json();

  const {
    siteName,
    tagline,
    logoUrl,
    faviconUrl,
    primaryColor,
    accentColor,
    fontFamily,
    footerText,
    socialLinks,
    customCss,
    analyticsId,
  } = body;

  const updated = await prisma.siteSettings.update({
    where: { id: settings.id },
    data: {
      ...(siteName !== undefined && { siteName }),
      ...(tagline !== undefined && { tagline }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(faviconUrl !== undefined && { faviconUrl }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(accentColor !== undefined && { accentColor }),
      ...(fontFamily !== undefined && { fontFamily }),
      ...(footerText !== undefined && { footerText }),
      ...(socialLinks !== undefined && { socialLinks }),
      ...(customCss !== undefined && { customCss }),
      ...(analyticsId !== undefined && { analyticsId }),
    },
  });

  return Response.json(updated);
}
