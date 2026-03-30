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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
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
            className="ml-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-zinc-200 bg-white transition-all duration-200 ease-in-out md:hidden",
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
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
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
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
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
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        {item.label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
        {item.children.map((child) => (
          <Link
            key={child.id}
            href={child.href}
            target={child.target ?? undefined}
            className="block px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
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
        className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        {item.label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
        />
      </button>
      {expanded && (
        <div className="ml-4 space-y-1 border-l border-zinc-200 pl-3">
          <Link
            href={item.href}
            target={item.target ?? undefined}
            onClick={onNavigate}
            className="block rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            {item.label}
          </Link>
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              target={child.target ?? undefined}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
