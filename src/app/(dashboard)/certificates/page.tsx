import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, FileText, TrendingUp, Clock } from "lucide-react";
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

  const stats = [
    {
      label: "Templates",
      value: templates.length,
      description: "Certificate designs",
      icon: FileText,
      gradient: "from-violet-500/15 to-purple-500/5",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/15",
    },
    {
      label: "Total Issued",
      value: totalIssued,
      description: "All-time certificates",
      icon: Award,
      gradient: "from-emerald-500/15 to-teal-500/5",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15",
    },
    {
      label: "Active",
      value: activeCerts,
      description: "Valid certificates",
      icon: TrendingUp,
      gradient: "from-blue-500/15 to-cyan-500/5",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15",
    },
    {
      label: "Recent",
      value: recentIssued,
      description: "Last 7 days",
      icon: Clock,
      gradient: "from-amber-500/15 to-orange-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Certificates</h1>
          <p className="text-sm text-muted-foreground">Manage certificate templates and issued certificates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                    <tr key={cert.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
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
