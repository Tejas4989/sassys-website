import Link from "next/link";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/public/social-links";
import { ProudlyCanadian, CanadianSeal } from "@/components/public/canadian-badges";

const EXPLORE = [
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const ORDER = [
  { href: "/order", label: "Order Pickup" },
  { href: "/wholesale/login", label: "Wholesale Login" },
];

export function PublicFooter() {
  return (
    <footer className="bg-ink text-footer-text mt-auto px-5 nav:px-7 pt-10 nav:pt-[50px] pb-6 nav:pb-[30px]">
      <div className="mx-auto max-w-[1280px] grid grid-cols-2 nav:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        {/* Brand */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sassys-logo.png" alt="Sassy's" className="h-[60px] w-auto mb-3.5" />
          <p className="text-[13px] leading-relaxed text-footer-muted max-w-[260px]">
            Family-owned bakery, deli &amp; pizzeria in Thorndale, Ontario, since {SITE.foundingYear}.
          </p>
          <ProudlyCanadian className="mt-4 bg-[#453A2E] text-footer-text text-[13px] px-3 py-[7px] rounded-full" />
          <div className="mt-4">
            <SocialLinks className="w-9 h-9 rounded-full bg-[#453A2E] text-footer-text flex items-center justify-center hover:bg-gold hover:text-ink transition-colors" />
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="font-display font-bold text-[13px] text-cream mb-3">Explore</div>
          <div className="flex flex-col gap-2 text-[13px]">
            {EXPLORE.map((l) => (
              <Link key={l.href} href={l.href} className="text-footer-text hover:text-gold transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Order */}
        <div>
          <div className="font-display font-bold text-[13px] text-cream mb-3">Order</div>
          <div className="flex flex-col gap-2 text-[13px]">
            {ORDER.map((l) => (
              <Link key={l.href} href={l.href} className="text-footer-text hover:text-gold transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Visit */}
        <div className="flex flex-col">
          <div className="font-display font-bold text-[13px] text-cream mb-3">Visit</div>
          <div className="text-[13px] leading-[1.7] text-footer-text">
            {SITE.street}<br />
            {SITE.city}, {SITE.region}<br />
            <a href={SITE.phoneHref} className="hover:text-gold transition-colors">{SITE.phone}</a>
          </div>
        </div>

      </div>

      {/* Small-town Canadian seal — shown on mobile (header carries it on desktop) */}
      <div className="nav:hidden flex justify-center mt-10">
        <CanadianSeal size={96} className="animate-float" />
      </div>

      <div className="mx-auto max-w-[1280px] mt-[34px] border-t border-[#453A2E] pt-[18px] text-xs text-label-soft flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Sassy&apos;s Bakery. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-footer-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-footer-text transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
