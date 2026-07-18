/**
 * Photo slot for the site's fixed imagery (hero, category tiles, about,
 * contact, gallery). Renders the image when `src` is provided, otherwise a
 * labelled placeholder box (design-prototype drag-and-drop slot).
 */
export function PhotoSlot({
  label,
  src,
  className,
}: {
  label?: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`bg-cream-alt border border-line flex items-center justify-center text-center overflow-hidden ${className ?? ""}`}
    >
      {src ? (
        <img
          src={src}
          alt={label ?? ""}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        label && (
          <span className="font-body text-sm text-label-soft px-3">{label}</span>
        )
      )}
    </div>
  );
}
