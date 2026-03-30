import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Award, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";

export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      template: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) notFound();

  // Increment view count
  await prisma.certificate.update({
    where: { id: certificate.id },
    data: { viewCount: { increment: 1 } },
  });

  const now = new Date();
  const meta = certificate.metadata as Record<string, string | null>;
  let status: "active" | "expired" | "revoked" = "active";
  if (certificate.revokedAt) status = "revoked";
  else if (certificate.expiresAt && certificate.expiresAt < now) status = "expired";

  const statusConfig = {
    active: {
      icon: CheckCircle,
      label: "Valid Certificate",
      description: "This certificate is valid and active.",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
    expired: {
      icon: AlertTriangle,
      label: "Expired Certificate",
      description: "This certificate has expired.",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
    },
    revoked: {
      icon: XCircle,
      label: "Revoked Certificate",
      description: certificate.revokedReason
        ? `This certificate was revoked: ${certificate.revokedReason}`
        : "This certificate has been revoked.",
      color: "text-red-600",
      bg: "bg-red-500/10",
      ring: "ring-red-500/20",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Relay</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Certificate Verification</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Status banner */}
        <div className={`mb-8 flex items-center gap-3 rounded-xl ${config.bg} p-4 ring-1 ${config.ring}`}>
          <StatusIcon className={`h-6 w-6 ${config.color}`} />
          <div>
            <p className={`font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Certificate preview */}
          <div>
            <CertificatePreview
              designData={certificate.template.designData as Parameters<typeof CertificatePreview>[0]["designData"]}
              orientation={certificate.template.orientation as "LANDSCAPE" | "PORTRAIT"}
              backgroundColor={certificate.template.backgroundColor}
              borderStyle={certificate.template.borderStyle}
              logoUrl={certificate.template.logoUrl}
              variables={{
                studentName: meta.studentName ?? certificate.user.name ?? "Student",
                courseTitle: meta.courseTitle ?? certificate.course.title,
                completionDate: meta.completionDate ? new Date(meta.completionDate).toLocaleDateString() : "",
                instructorName: meta.instructorName ?? "",
                certificateNumber: certificate.certificateNumber,
                grade: meta.grade ?? "",
              }}
              className="shadow-lg"
            />
          </div>

          {/* Certificate details */}
          <div className="space-y-4">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Certificate Details</h1>

            <div className="space-y-3 rounded-xl bg-card p-5 ring-1 ring-border">
              <DetailRow label="Certificate Number" value={certificate.certificateNumber} mono />
              <DetailRow label="Recipient" value={meta.studentName ?? certificate.user.name ?? "—"} />
              <DetailRow label="Course" value={meta.courseTitle ?? certificate.course.title} />
              {meta.instructorName && <DetailRow label="Instructor" value={meta.instructorName} />}
              {meta.grade && <DetailRow label="Grade" value={meta.grade} />}
              <DetailRow label="Issued" value={certificate.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              {certificate.expiresAt && (
                <DetailRow label="Expires" value={certificate.expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-6 text-center text-xs text-muted-foreground">
        Powered by Relay LMS &middot; Certificate verification page
      </footer>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
