import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";
import { CertificateTemplateEditorPage } from "./editor";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/certificates");

  const { id } = await params;
  const template = await prisma.certificateTemplate.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!template) notFound();

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <CertificateTemplateEditorPage
      template={JSON.parse(JSON.stringify(template))}
      courses={courses}
    />
  );
}
