import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { SectionRenderer } from "@/components/page-builder/renderers/SectionRenderer";
import type { PageSection } from "@/components/page-builder/schemas";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({
    where: { slug },
    select: { title: true, seoTitle: true, seoDescription: true, ogImageUrl: true, status: true },
  });

  if (!page) return {};

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    openGraph: page.ogImageUrl ? { images: [page.ogImageUrl] } : undefined,
  };
}

export default async function PublicPage({ params }: PageProps) {
  const [{ slug }, session] = await Promise.all([params, auth()]);

  const page = await prisma.sitePage.findUnique({
    where: { slug },
  });

  if (!page) notFound();

  // Admins/instructors can preview any status; public visitors only see PUBLISHED
  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "INSTRUCTOR";
  if (page.status !== "PUBLISHED" && !isStaff) {
    notFound();
  }

  const sections = ((page.sections as PageSection[]) ?? []).sort(
    (a, b) => a.order - b.order
  );

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
