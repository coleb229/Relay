import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { Award, BookOpen } from "lucide-react";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export default async function MyCertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          orientation: true,
          designData: true,
          logoUrl: true,
          backgroundColor: true,
          borderStyle: true,
        },
      },
      course: { select: { id: true, title: true, imageUrl: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Certificates" description="Your earned certificates and credentials" />

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={JSON.parse(JSON.stringify(cert))}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate. Your certificates will appear here for download and sharing."
          variant="centered"
        >
          <Button
            size="sm"
            render={(props) => <Link {...props} href="/my-courses" />}
            nativeButton={false}
          >
            <BookOpen className="size-4" />
            Browse My Courses
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
