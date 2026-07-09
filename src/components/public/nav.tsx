"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Our Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/order", label: "Order Online" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-heading text-2xl font-bold text-primary">
              Sassy&apos;s
            </span>
            <span className="hidden sm:block text-sm text-muted-foreground font-medium tracking-wide">
              Bakery & Deli
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === l.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Phone + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+15194611234"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
              (519) 461-1234
            </a>
            <button
              className="md:hidden p-2 rounded-md hover:bg-secondary"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="md:hidden py-3 border-t border-border space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium",
                  pathname === l.href
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="tel:+15194611234"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary"
            >
              <Phone className="w-4 h-4" />
              (519) 461-1234
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
