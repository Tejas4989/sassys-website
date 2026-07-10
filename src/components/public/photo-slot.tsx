/**
 * Placeholder for real photography (hero, category tiles, about, gallery,
 * contact map). Mirrors the design prototype's drag-and-drop image slots —
 * swap for real <img>/next Image once photos are sourced.
 */
export function PhotoSlot({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-cream-alt border border-line flex items-center justify-center text-center overflow-hidden ${className ?? ""}`}
    >
      {label && (
        <span className="font-body text-sm text-label-soft px-3">{label}</span>
      )}
    </div>
  );
}
