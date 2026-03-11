"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/nav/user-menu";
import { BookOpen, Users, BarChart3, LayoutDashboard, BookMarked } from "lucide-react";
import type { Session } from "next-auth";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Users", href: "/students", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "API Docs", href: "/docs", icon: BookMarked },
];

interface AppSidebarProps {
  user: Session["user"];
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none">Relay</p>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">LMS Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={
                      href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(href)
                    }
                    className="gap-3 h-9"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="font-medium">{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
