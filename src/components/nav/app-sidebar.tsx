"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/nav/user-menu";
import {
  BookOpen,
  Users,
  BarChart3,
  LayoutDashboard,
  BookMarked,
  Tag,
  GraduationCap,
  Key,
} from "lucide-react";
import type { Session } from "next-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

function getNavGroups(role: "ADMIN" | "INSTRUCTOR" | "STUDENT"): NavGroup[] {
  if (role === "STUDENT") {
    return [
      {
        items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
      },
      {
        label: "LEARNING",
        items: [{ label: "Browse Courses", href: "/courses", icon: BookOpen }],
      },
      {
        label: "MY LEARNING",
        items: [{ label: "My Courses", href: "/my-courses", icon: GraduationCap }],
      },
    ];
  }

  return [
    {
      items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
    },
    {
      label: "LEARNING",
      items: [
        { label: "Courses", href: "/courses", icon: BookOpen },
        { label: "Categories", href: "/categories", icon: Tag },
      ],
    },
    {
      label: "PEOPLE",
      items: [
        { label: "Users", href: "/students", icon: Users },
        { label: "Enrollments", href: "/enrollments", icon: GraduationCap },
      ],
    },
    {
      label: "INSIGHTS",
      items: [{ label: "Analytics", href: "/analytics", icon: BarChart3 }],
    },
    {
      label: "DEVELOPER",
      items: [
        { label: "API Reference", href: "/docs", icon: BookMarked },
        { label: "API Keys", href: "/settings/api-keys", icon: Key, disabled: true },
      ],
    },
  ];
}

interface AppSidebarProps {
  user: Session["user"];
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  const visibleGroups = getNavGroups(user.role);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 text-sidebar-primary-foreground"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none text-sidebar-foreground">Relay</p>
            <p className="text-[11px] text-sidebar-foreground/50 leading-none mt-0.5">LMS Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {visibleGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label ?? groupIndex}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, href, icon: Icon, disabled }) => (
                  <SidebarMenuItem key={href}>
                    {disabled ? (
                      <SidebarMenuButton
                        className="gap-3 h-9 pointer-events-none opacity-50"
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="font-medium">{label}</span>
                        <span className="ml-auto text-[10px] font-semibold uppercase text-muted-foreground">
                          Soon
                        </span>
                      </SidebarMenuButton>
                    ) : (
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
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
