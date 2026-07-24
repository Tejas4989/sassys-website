"use client";

import { useEffect, useState } from "react";

// Card-shuffle hero: pizza / bakery / deli sit as a small stack of cards. Every
// few seconds the front card tucks to the back of the deck and the next card
// slides forward — echoing the "Bakery. Deli. Pizzeria." headline. Uses only
// translate/scale/opacity (no 3D transforms) so it stays smooth on Chrome,
// mobile and tablet.
const SLIDES = [
  { src: "/site/hero-pizza.jpg", label: "Fresh-baked margherita pizza" },
  { src: "/site/hero-bakery.jpg", label: "Bakery case full of pastries and breads" },
  { src: "/site/hero-deli.jpg", label: "Deli sub sandwich made to order" },
];

// Visual state for each depth in the deck (0 = front).
const DECK = [
  { transform: "translate3d(0,0,0) scale(1) rotate(0deg)", z: 30, shadow: "0 22px 45px rgba(43,33,24,0.24)" },
  { transform: "translate3d(2.5%,3.5%,0) scale(0.965) rotate(1.8deg)", z: 20, shadow: "0 14px 30px rgba(43,33,24,0.15)" },
  { transform: "translate3d(4.5%,6.5%,0) scale(0.935) rotate(3.4deg)", z: 10, shadow: "0 9px 20px rgba(43,33,24,0.12)" },
];

export function HeroShowcase({ className }: { className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % SLIDES.length),
      3600
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative ${className ?? ""}`} role="group" aria-label="Sassy's — bakery, deli and pizzeria">
      {SLIDES.map((slide, idx) => {
        const depth = (idx - active + SLIDES.length) % SLIDES.length;
        const d = DECK[depth];
        return (
          <div
            key={slide.src}
            aria-hidden={depth !== 0}
            className="absolute inset-0 rounded-[28px] overflow-hidden bg-cream-alt transition-[transform,box-shadow] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{ transform: d.transform, zIndex: d.z, boxShadow: d.shadow }}
          >
            <div
              className={`w-full h-full bg-cover bg-center ${depth === 0 ? "animate-kenburns" : ""}`}
              style={{ backgroundImage: `url(${slide.src})` }}
            />
            {depth === 0 && (
              <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
            )}
          </div>
        );
      })}

      {/* Slide indicators */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-2 z-[40]">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(idx)}
            aria-label={`Show ${slide.label}`}
            aria-current={idx === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === active ? "w-6 bg-cream" : "w-2 bg-cream/60 hover:bg-cream/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
