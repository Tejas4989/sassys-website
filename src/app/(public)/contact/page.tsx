import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getHours, DAY_NAMES } from "@/lib/data/hours";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Sassy's Bakery in Thorndale, ON. Call, email, or visit us at 225 King St.",
};

export const revalidate = 3600;

export default async function ContactPage() {
  const { regular: hours, upcoming } = await getHours();
  const todayIdx = new Date().getDay();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-lg">
          We&apos;d love to hear from you — stop in, call, or send us an email.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    225 King St, Thorndale, Ontario N0M 2P0
                  </p>
                  <a
                    href="https://maps.google.com/?q=225+King+St+Thorndale+ON"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Get directions →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a
                    href="tel:+15194611234"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    (519) 461-1234
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href="mailto:inquiry@mysassys.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    inquiry@mysassys.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catering note */}
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-2">Catering?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Planning an event? We handle catering for pizza, subs,
                chicken, and more. Place your catering order online or call
                us directly — we&apos;ll reach out if we have any questions.
              </p>
              <a
                href="/order"
                className="text-sm text-primary hover:underline mt-2 inline-block font-medium"
              >
                Place a catering order →
              </a>
            </CardContent>
          </Card>

          {/* Wholesale note */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-2">
                Wholesale Inquiries
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We supply fresh-baked goods to grocery stores, restaurants,
                golf courses, and more across a 40-mile radius.
              </p>
              <a
                href="mailto:inquiry@mysassys.com"
                className="text-sm text-primary hover:underline mt-2 inline-block font-medium"
              >
                Email us about wholesale →
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Hours */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-semibold mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hours of Operation
              </h3>
              <ul className="space-y-2">
                {hours.map((h) => (
                  <li
                    key={h.dayOfWeek}
                    className={`flex justify-between text-sm py-2 border-b border-border last:border-0 ${h.dayOfWeek === todayIdx ? "font-semibold text-primary" : ""}`}
                  >
                    <span>{DAY_NAMES[h.dayOfWeek]}</span>
                    <span className={h.dayOfWeek !== todayIdx ? "text-muted-foreground" : ""}>
                      {h.isClosed ? "Closed" : `${h.opensAt} – ${h.closesAt}`}
                    </span>
                  </li>
                ))}
              </ul>

              {upcoming.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Upcoming Holiday Hours
                  </p>
                  <ul className="space-y-1.5">
                    {upcoming.map((ov) => (
                      <li key={ov.date} className="text-sm flex justify-between">
                        <span>
                          {ov.label} ({ov.date})
                        </span>
                        <span className="text-muted-foreground">
                          {ov.isClosed ? "Closed" : `${ov.opensAt} – ${ov.closesAt}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map embed placeholder */}
          <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video bg-secondary flex items-center justify-center">
            <a
              href="https://maps.google.com/?q=225+King+St+Thorndale+ON"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-6"
            >
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">
                225 King St, Thorndale ON
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to open in Google Maps
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
