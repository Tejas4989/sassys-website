import { SITE } from "@/lib/site";

/**
 * "Proudly Canadian" pill — a small maple-leaf chip for the footer / ribbon.
 */
export function ProudlyCanadian({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-display font-bold ${className}`}>
      <span aria-hidden className="text-[1.05em] leading-none">🍁</span>
      Proudly Canadian
    </span>
  );
}

/**
 * Circular "small-town Canadian bakery" seal/stamp — an original emblem (not a
 * copy of anyone else's) for overlaying on the hero. Curved text around a maple
 * leaf gives it that heritage-stamp feel.
 */
export function CanadianSeal({
  className = "",
  style,
  size = 104,
}: {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label={`Small-town Canadian bakery, Thorndale Ontario, established ${SITE.foundingYear}`}
    >
      <defs>
        {/* Top arc (sweep 1 → bulges over the top, text upright left→right) */}
        <path id="seal-arc-top" d="M28,100 A72,72 0 0 1 172,100" fill="none" />
        {/* Bottom arc (sweep 0 → bulges under the bottom, text upright left→right) */}
        <path id="seal-arc-bot" d="M34,100 A66,66 0 0 0 166,100" fill="none" />
      </defs>

      {/* Cream halo + bold gold rim so the seal reads on any background */}
      <circle cx="100" cy="100" r="99" fill="#FBF4E8" />
      <circle cx="100" cy="100" r="95" fill="#123D22" stroke="#DDA43A" strokeWidth="4" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="#DDA43A" strokeWidth="1.5" />
      <circle
        cx="100"
        cy="100"
        r="52"
        fill="none"
        stroke="#DDA43A"
        strokeWidth="1"
        strokeDasharray="1.5 3"
        opacity="0.7"
      />

      <text
        fill="#FBF4E8"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.6"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          SMALL-TOWN CANADIAN BAKERY
        </textPath>
      </text>

      <text
        fill="#DDA43A"
        fontSize="12.5"
        fontWeight="800"
        letterSpacing="2.4"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        <textPath href="#seal-arc-bot" startOffset="50%" textAnchor="middle">
          THORNDALE · ONTARIO
        </textPath>
      </text>

      <text x="100" y="98" textAnchor="middle" fontSize="34">🍁</text>
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fill="#FBF4E8"
        fontSize="13"
        fontWeight="800"
        letterSpacing="1.5"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        EST. {SITE.foundingYear}
      </text>
    </svg>
  );
}
