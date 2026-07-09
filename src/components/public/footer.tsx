import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const hours = [
  { day: "Monday", hours: "5:30 AM – 8:00 PM" },
  { day: "Tuesday", hours: "5:30 AM – 8:00 PM" },
  { day: "Wednesday", hours: "5:30 AM – 8:00 PM" },
  { day: "Thursday", hours: "5:30 AM – 9:00 PM" },
  { day: "Friday", hours: "5:30 AM – 11:00 PM" },
  { day: "Saturday", hours: "7:00 AM – 11:00 PM" },
  { day: "Sunday", hours: "7:00 AM – 9:00 PM" },
];

export function PublicFooter() {
  return (
    <footer className="bg-brown-dark text-cream mt-auto" style={{ backgroundColor: "oklch(0.28 0.06 45)", color: "oklch(0.93 0.02 80)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-3" style={{ color: "oklch(0.93 0.02 80)" }}>
              Sassy&apos;s
            </h3>
            <p className="text-sm leading-relaxed opacity-80">
              Family-owned bakery, deli & pizzeria in the heart of Thorndale, Ontario since 1990.
            </p>
            <div className="mt-4 space-y-2">
              <a href="tel:+15194611234" className="flex items-center gap-2 text-sm hover:opacity-100 opacity-80 transition-opacity">
                <Phone className="w-4 h-4 shrink-0" />
                (519) 461-1234
              </a>
              <a href="mailto:inquiry@mysassys.com" className="flex items-center gap-2 text-sm hover:opacity-100 opacity-80 transition-opacity">
                <Mail className="w-4 h-4 shrink-0" />
                inquiry@mysassys.com
              </a>
              <div className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>225 King St, Thorndale, ON N0M 2P0</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-3" style={{ color: "oklch(0.93 0.02 80)" }}>
              Hours
            </h4>
            <ul className="space-y-1.5">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between text-sm opacity-80">
                  <span>{h.day}</span>
                  <span>{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-3" style={{ color: "oklch(0.93 0.02 80)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/menu", label: "Our Menu" },
                { href: "/order", label: "Order Online" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact Us" },
                { href: "/wholesale/login", label: "Wholesale Login" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-xs opacity-50 flex flex-col sm:flex-row justify-between gap-2" style={{ borderColor: "oklch(0.42 0.07 45)" }}>
          <p>© {new Date().getFullYear()} Sassy&apos;s Bakery. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:opacity-80">Privacy Policy</Link>
            <Link href="/terms" className="hover:opacity-80">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
