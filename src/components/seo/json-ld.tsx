// Renders JSON-LD structured data in a <script> tag.
// Usage: <JsonLd data={mySchemaObject} />

interface Props {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Pre-built schemas ────────────────────────────────────────────────────────

export function localBusinessSchema() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Bakery", "FoodEstablishment"],
    "@id": `${base}/#business`,
    name: "Sassy's Bakery",
    alternateName: ["Sassy's", "Sassy's Bakery & Deli"],
    url: base,
    telephone: "+15194611234",
    email: "inquiry@mysassys.com",
    image: `${base}/icon-512.png`,
    description:
      "Family-owned bakery, deli & pizzeria in Thorndale, Ontario since 1990. Fresh baked breads, pizza, subs, fried chicken, deli meats, and Shaw's Ice Cream. Commercial wholesale bakery supplying a 40-mile radius.",
    priceRange: "$$",
    servesCuisine: ["Bakery", "Pizza", "Deli", "Canadian"],
    hasMenu: `${base}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "225 King St",
      addressLocality: "Thorndale",
      addressRegion: "ON",
      postalCode: "N0M 2P0",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.1123,
      longitude: -81.1456,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday"], opens: "05:30", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Thursday"], opens: "05:30", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday"], opens: "05:30", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "07:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "07:00", closes: "21:00" },
    ],
    sameAs: [],
    potentialAction: {
      "@type": "OrderAction",
      target: `${base}/order`,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${base}${item.url}`,
    })),
  };
}
