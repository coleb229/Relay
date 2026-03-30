"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PublicNavItem {
  id: string;
  label: string;
  href: string;
  target: string | null;
  children: {
    id: string;
    label: string;
    href: string;
    target: string | null;
  }[];
}

interface PublicHeaderProps {
  siteName: string;
  logoUrl: string | null;
  navItems: PublicNavItem[];
}

export function PublicHeader({ siteName, logoUrl, navItems }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-lg">{siteName}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavItemDesktop key={item.id} item={item} />
          ))}
          <Link
            href="/login"
            className="ml-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-all duration-(--dur-layout) ease-(--ease-out-quart) md:hidden",
          mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="space-y-1 px-4 py-3">
          {navItems.map((item) => (
            <NavItemMobile key={item.id} item={item} onNavigate={() => setMobileOpen(false)} />
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavItemDesktop({ item }: { item: PublicNavItem }) {
  if (item.children.length === 0) {
    return (
      <Link
        href={item.href}
        target={item.target ?? undefined}
        className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={item.href}
        target={item.target ?? undefined}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
      >
        {item.label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-(--dur-state) ease-(--ease-out-quart) group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-border bg-popover py-1 opacity-0 shadow-lg transition-all duration-(--dur-state) ease-(--ease-out-quart) group-hover:visible group-hover:opacity-100">
        {item.children.map((child) => (
          <Link
            key={child.id}
            href={child.href}
            target={child.target ?? undefined}
            className="block px-4 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted/50 hover:text-foreground"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavItemMobile({
  item,
  onNavigate,
}: {
  item: PublicNavItem;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (item.children.length === 0) {
    return (
      <Link
        href={item.href}
        target={item.target ?? undefined}
        onClick={onNavigate}
        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
      >
        {item.label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-(--dur-state) ease-(--ease-out-quart)", expanded && "rotate-180")}
        />
      </button>
      {expanded && (
        <div className="ml-4 space-y-1 border-l border-border pl-3">
          <Link
            href={item.href}
            target={item.target ?? undefined}
            onClick={onNavigate}
            className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted/50 hover:text-foreground"
          >
            {item.label}
          </Link>
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              target={child.target ?? undefined}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted/50 hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
