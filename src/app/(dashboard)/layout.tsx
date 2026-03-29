import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { BugReportButton } from "@/components/bug-report/BugReportButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 shrink-0 border-b bg-background/95 backdrop-blur-sm px-4 flex items-center justify-between shadow-[0_1px_4px_0_rgb(0_0_0/0.08)]">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-1.5">
            <BugReportButton user={session.user} />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
