"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { CanadianSeal } from "@/components/public/canadian-badges";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: "/order", label: "Order Pickup" },
  { href: "/wholesale/login", label: "Wholesale Login" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close the mobile dropdown when the viewport crosses to desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 860) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Utility ribbon — scrolls away with the page (not sticky) */}
      <div className="bg-forest-dark text-gold text-center font-display font-semibold text-xs tracking-wide px-3 py-[7px]">
        <span aria-hidden>🍁</span> Proudly Canadian · Family owned · Serving Thorndale since {SITE.foundingYear}&nbsp; · &nbsp;{SITE.address}
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-[6px] border-b-2 border-line">
        <div className="mx-auto max-w-[1280px] px-5 py-2.5 flex items-center justify-between gap-4">
          {/* Logo + small-town seal */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center" aria-label="Sassy's Bakery — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sassys-logo.png"
                alt="Sassy's Bakery"
                className="h-11 nav:h-[58px] w-auto block"
              />
            </Link>
            <span className="hidden nav:flex items-center shrink-0">
              <CanadianSeal
                size={54}
                className="drop-shadow-[0_2px_5px_rgba(43,33,24,0.18)]"
              />
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden nav:flex items-center gap-1 font-body text-[15px] font-semibold flex-wrap">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-[9px] transition-colors ${
                  isActive(l.href)
                    ? "bg-ink text-cream"
                    : "text-ink hover:bg-cream-alt"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden nav:flex items-center gap-2.5 shrink-0">
            <Link
              href="/wholesale/login"
              className="font-body font-semibold text-sm text-ink px-1.5 py-2 hover:text-sassy-red transition-colors"
            >
              Wholesale Login
            </Link>
            <Link
              href="/order"
              className="bg-sassy-red text-cream-hi rounded-full px-[22px] py-[11px] font-display font-bold text-[15px] whitespace-nowrap shadow-[0_3px_0_var(--color-red-dark)] hover:brightness-105 transition"
            >
              Order Pickup
            </Link>
          </div>

          {/* Mobile CTAs */}
          <div className="flex nav:hidden items-center gap-2.5">
            <Link
              href="/order"
              className="bg-sassy-red text-cream-hi rounded-full px-4 py-[9px] font-display font-bold text-[13px] whitespace-nowrap"
            >
              Order
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
              className="border-2 border-ink rounded-lg w-10 h-10 flex items-center justify-center text-lg text-ink shrink-0"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown (inline panel, pushes content down) */}
        {open && (
          <div className="nav:hidden border-t border-line px-5 pt-2.5 pb-[18px] flex flex-col gap-0.5">
            {MOBILE_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-[10px] px-3 py-[13px] font-body font-semibold text-base text-ink text-left ${
                  isActive(l.href) ? "bg-cream-alt" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
