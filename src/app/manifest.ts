import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sassy's Bakery",
    short_name: "Sassy's",
    description:
      "Family-owned bakery, deli & pizzeria in Thorndale, Ontario. Order online for pickup.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f0e6",
    theme_color: "#6b3f1f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["food", "shopping"],
    lang: "en-CA",
    orientation: "portrait-primary",
    shortcuts: [
      {
        name: "Order Online",
        url: "/order",
        description: "Place a pickup order",
      },
      {
        name: "Our Menu",
        url: "/menu",
        description: "Browse our full menu",
      },
    ],
  };
}
