import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getHours, DAY_NAMES, formatTime } from "@/lib/data/hours";
import { PhotoSlot } from "@/components/public/photo-slot";
import { ContactForm } from "@/components/public/contact-form";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export const metadata: Metadata = {
  title: "Visit or Contact Us",
  description:
    "Visit Sassy's Bakery at 225 King St, Thorndale, ON. Call, email, or send us a message — we'd love to hear from you.",
  alternates: { canonical: `${BASE}/contact` },
  openGraph: {
    title: "Contact | Sassy's Bakery",
    description: "225 King St, Thorndale, ON. Call, email or message us.",
    url: `${BASE}/contact`,
  },
};

export const revalidate = 3600;

const MAPS_URL = SITE.mapsUrl;

export default async function ContactPage() {
  const { regular: hours } = await getHours();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <div className="mx-auto max-w-[1280px] px-5 nav:px-7 pt-7 nav:pt-11 pb-16 nav:pb-20 font-body text-ink">
        <h1 className="font-editorial font-semibold text-[28px] nav:text-[38px] mb-[30px]">
          Visit or Contact Us
        </h1>

        <div className="grid grid-cols-1 nav:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10">
          {/* Info */}
          <div>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block mb-4">
              <PhotoSlot
                label="Map / storefront photo — open in Google Maps"
                src="/site/contact.jpg"
                className="w-full h-[240px] rounded-2xl"
              />
            </a>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-forest text-cream rounded-full px-5 py-2.5 font-display font-bold text-sm hover:brightness-110 transition mb-[26px]"
            >
              <MapPin className="w-4 h-4" /> Get Directions
            </a>

            <div className="mb-5">
              <div className="font-display font-bold text-[15px] mb-1">Address</div>
              <div className="text-[15px] text-ink-soft">{SITE.address}</div>
            </div>

            <div className="mb-5">
              <div className="font-display font-bold text-[15px] mb-1">Phone</div>
              <a href={SITE.phoneHref} className="text-[15px] text-ink-soft hover:text-sassy-red transition-colors">
                {SITE.phone}
              </a>
            </div>

            <div>
              <div className="font-display font-bold text-[15px] mb-2">Hours</div>
              <div className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-1.5 text-sm text-ink-soft max-w-[280px]">
                {hours.map((h) => (
                  <div key={h.dayOfWeek} className="contents">
                    <span>{DAY_NAMES[h.dayOfWeek]}</span>
                    <span className="text-right">
                      {h.isClosed ? "Closed" : `${formatTime(h.opensAt)} – ${formatTime(h.closesAt)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </>
  );
}
