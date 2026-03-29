"use client";

import Link from "next/link";
import { Download, ExternalLink, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CertificateStatusBadge } from "./CertificateStatusBadge";
import { CertificatePreview } from "./CertificatePreview";

interface CertificateCardProps {
  certificate: {
    id: string;
    certificateNumber: string;
    verificationCode: string;
    issuedAt: string;
    expiresAt?: string | null;
    revokedAt?: string | null;
    metadata: Record<string, unknown>;
    template: {
      id: string;
      name: string;
      orientation?: string;
      designData?: unknown;
      logoUrl?: string | null;
      backgroundColor?: string | null;
      borderStyle?: string | null;
    };
    course: { id: string; title: string; imageUrl?: string | null };
    user?: { id: string; name?: string | null; email?: string | null };
  };
  showStudent?: boolean;
}

export function CertificateCard({ certificate, showStudent = false }: CertificateCardProps) {
  const meta = certificate.metadata as Record<string, string | null>;
  const verifyUrl = `/certificates/verify/${certificate.verificationCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${verifyUrl}`);
  };

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <div className="px-4 pt-4">
        <CertificatePreview
          designData={certificate.template.designData as Parameters<typeof CertificatePreview>[0]["designData"]}
          orientation={(certificate.template.orientation as "LANDSCAPE" | "PORTRAIT") ?? "LANDSCAPE"}
          backgroundColor={certificate.template.backgroundColor}
          borderStyle={certificate.template.borderStyle}
          logoUrl={certificate.template.logoUrl}
          compact
          variables={{
            studentName: meta.studentName ?? "Student",
            courseTitle: meta.courseTitle ?? certificate.course.title,
            completionDate: meta.completionDate ? new Date(meta.completionDate).toLocaleDateString() : "",
            instructorName: meta.instructorName ?? "",
            certificateNumber: certificate.certificateNumber,
          }}
        />
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{certificate.course.title}</p>
            {showStudent && certificate.user && (
              <p className="truncate text-xs text-muted-foreground">{certificate.user.name ?? certificate.user.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Issued {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
          </div>
          <CertificateStatusBadge expiresAt={certificate.expiresAt} revokedAt={certificate.revokedAt} />
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="xs" onClick={handleCopyLink}>
            <Share2 className="h-3 w-3" data-icon="inline-start" />
            Share
          </Button>
          <Button variant="outline" size="xs" render={(props) => <Link {...props} href={verifyUrl} target="_blank" />} nativeButton={false}>
            <ExternalLink className="h-3 w-3" data-icon="inline-start" />
            Verify
          </Button>
          <Button variant="outline" size="xs">
            <Download className="h-3 w-3" data-icon="inline-start" />
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
