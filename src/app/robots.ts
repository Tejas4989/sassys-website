import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://mysassys.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/gallery", "/contact", "/order", "/privacy", "/terms"],
        disallow: [
          "/admin/",
          "/baker/",
          "/wholesale/",
          "/api/",
          "/order/confirmation",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
