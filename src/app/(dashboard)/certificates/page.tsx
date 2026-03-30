import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { Card } from "@/components/ui/card";
import { Award, FileText, TrendingUp, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatMetric, MetricGrid } from "@/components/ui/stat-metric";
import { CertificateTemplateList } from "@/components/certificates/CertificateTemplateList";
import { CertificateStatusBadge } from "@/components/certificates/CertificateStatusBadge";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/my-certificates");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [templates, certificates, totalIssued, recentIssued, activeCerts] = await Promise.all([
    prisma.certificateTemplate.findMany({
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { certificates: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.certificate.findMany({
      take: 20,
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        template: { select: { id: true, name: true } },
      },
    }),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { issuedAt: { gte: sevenDaysAgo } } }),
    prisma.certificate.count({
      where: {
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Certificates" description="Manage certificate templates and issued certificates" />

      {/* Stats */}
      <MetricGrid>
        <StatMetric label="Templates" value={templates.length} description="Certificate designs" icon={FileText} />
        <StatMetric label="Total Issued" value={totalIssued} description="All-time certificates" icon={Award} />
        <StatMetric label="Active" value={activeCerts} description="Valid certificates" icon={TrendingUp} />
        <StatMetric label="Recent" value={recentIssued} description="Last 7 days" icon={Clock} />
      </MetricGrid>

      {/* Templates Section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Templates</h2>
        <CertificateTemplateList templates={JSON.parse(JSON.stringify(templates))} />
      </div>

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Recently Issued</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Certificate</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Student</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Course</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Template</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Issued</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)">
                      <td className="px-4 py-2.5">
                        <Link href={`/certificates/${cert.id}`} className="font-mono text-xs text-primary hover:underline">
                          {cert.certificateNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{cert.user.name ?? cert.user.email}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{cert.course.title}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{cert.template.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5">
                        <CertificateStatusBadge expiresAt={cert.expiresAt} revokedAt={cert.revokedAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
