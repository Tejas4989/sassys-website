"use client";

import { useState } from "react";
import { PhotoSlot } from "@/components/public/photo-slot";

type Photo = {
  id: string;
  url: string;
  imageKey: string;
  caption: string | null;
  category: string;
};

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 nav:grid-cols-4 gap-[18px]">
        {photos.map((p) => {
          const label = p.caption ?? p.category;
          const hasImage = Boolean(p.imageKey && p.url);
          if (!hasImage) {
            return (
              <PhotoSlot
                key={p.id}
                label={label}
                className="w-full h-[220px] rounded-[14px]"
              />
            );
          }
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setLightbox(p)}
              className="w-full h-[220px] rounded-[14px] overflow-hidden border border-line group"
              aria-label={`View ${label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption ?? "Sassy's Bakery"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.caption ?? "Sassy's Bakery"}
            className="max-w-full max-h-full rounded-[14px] object-contain"
          />
        </div>
      )}
    </>
  );
}
