import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { NavigationEditor } from "@/components/website/NavigationEditor";

export default async function NavigationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [headerItems, footerItems, pages] = await Promise.all([
    prisma.siteNavItem.findMany({
      where: { location: "header", parentId: null },
      include: { children: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.siteNavItem.findMany({
      where: { location: "footer", parentId: null },
      include: { children: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.sitePage.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <NavigationEditor
      initialHeaderItems={headerItems}
      initialFooterItems={footerItems}
      pages={pages}
    />
  );
}
