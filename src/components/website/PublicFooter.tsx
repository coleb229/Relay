import Link from "next/link";
import {
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  Github,
} from "lucide-react";
import type { ReactNode } from "react";

interface FooterNavItem {
  id: string;
  label: string;
  href: string;
  target: string | null;
}

interface PublicFooterProps {
  siteName: string;
  logoUrl: string | null;
  footerText: string | null;
  socialLinks: Record<string, string> | null;
  navItems: FooterNavItem[];
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  twitter: <Twitter className="h-5 w-5" />,
  x: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />,
};

export function PublicFooter({
  siteName,
  logoUrl,
  footerText,
  socialLinks,
  navItems,
}: PublicFooterProps) {
  const activeSocials = socialLinks
    ? Object.entries(socialLinks).filter(([, url]) => url)
    : [];

  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Branding */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 w-auto brightness-0 invert" />
            ) : (
              <span className="text-lg font-semibold text-white">{siteName}</span>
            )}
          </div>

          {/* Footer nav */}
          {navItems.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target ?? undefined}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Social links */}
          {activeSocials.length > 0 && (
            <div className="flex items-center gap-3">
              {activeSocials.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 transition-colors hover:text-white"
                  aria-label={key}
                >
                  {SOCIAL_ICONS[key.toLowerCase()] ?? (
                    <span className="text-xs font-medium uppercase">{key}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-sm text-zinc-500">
          {footerText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
