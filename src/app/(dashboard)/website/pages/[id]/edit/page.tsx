import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../../auth";
import { redirect, notFound } from "next/navigation";
import { PageEditorClient } from "@/components/website/PageEditorClient";
import type { PageSection } from "@/components/page-builder/schemas";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSitePagePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const page = await prisma.sitePage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <PageEditorClient
      pageId={page.id}
      pageTitle={page.title}
      pageSlug={page.slug}
      pageStatus={page.status}
      pageType={page.type}
      seoTitle={page.seoTitle}
      seoDescription={page.seoDescription}
      initialSections={page.sections as PageSection[] | null}
    />
  );
}
