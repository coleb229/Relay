import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { Award } from "lucide-react";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { Button } from "@/components/ui/button";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Certificates</h1>
        <p className="text-sm text-muted-foreground">
          Your earned certificates and credentials
        </p>
      </div>

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
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Award className="h-8 w-8 text-violet-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No certificates yet</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            Complete a course to earn your first certificate. Your certificates will appear here for download and sharing.
          </p>
          <Button
            size="sm"
            className="mt-4"
            render={(props) => <Link {...props} href="/my-courses" />}
            nativeButton={false}
          >
            Browse My Courses
          </Button>
        </div>
      )}
    </div>
  );
}
