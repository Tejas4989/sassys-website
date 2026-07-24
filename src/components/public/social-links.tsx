import { SITE } from "@/lib/site";

/**
 * Brand icon links for Facebook / Google reviews / Yelp. Only renders a link
 * when its URL is set in SITE.social, so nothing shows until the owner supplies
 * the real profiles. `className` styles each circular icon button.
 */
export function SocialLinks({
  className = "",
  iconClassName = "w-[18px] h-[18px]",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const links = [
    { url: SITE.social.facebookUrl, label: "Facebook", icon: FacebookIcon },
    { url: SITE.social.googleReviewsUrl, label: "Google reviews", icon: GoogleIcon },
    { url: SITE.social.yelpUrl, label: "Yelp", icon: YelpIcon },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5">
      {links.map(({ url, label, icon: Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.76Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.26a12 12 0 0 0 0 10.78l4.01-3.12Z" />
      <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.12C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

function YelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#D32323" className={className} aria-hidden="true">
      <path d="M20.16 12.6c-.29-.9-1.94-1.18-3.68-1.42-.32-.05-.85-.13-1.06-.16-.02 0-.03 0-.05-.01a.6.6 0 0 1-.34-.99c.13-.16.5-.55.72-.79 1.2-1.28 2.32-2.53 2.03-3.44-.13-.4-.5-.7-1.13-.9a5.6 5.6 0 0 0-3.66-.02c-.63.2-1 .5-1.13.9-.29.91.42 2.24 1.19 3.75.15.29.4.79.5 1a.6.6 0 0 1-.55.86h-.06c-.29-.02-.83-.1-1.16-.15C8.03 11.72 6.38 11.44 6.1 12.34c-.13.4 0 .87.4 1.4.6.82 1.62 1.6 2.53 1.6.09 0 .18 0 .26-.02.32-.06.85-.24 1.16-.35a.6.6 0 0 1 .77.75c-.09.32-.28.83-.4 1.12-.63 1.52-1.09 2.87-.5 3.55.26.3.66.44 1.19.44h.05c.94-.03 2.13-.66 2.6-1.5.16-.28.24-.83.29-1.16.01-.08.02-.16.04-.24a.6.6 0 0 1 .98-.34c.2.16.6.53.83.76 1.13 1.13 2.2 2.19 3.03 1.86.38-.15.64-.56.79-1.24.28-1.29.03-3.02-.53-3.61a1.5 1.5 0 0 0-.05-.05c-.24-.24-.7-.53-.98-.71a.6.6 0 0 1 .18-1.08c.32-.08.86-.19 1.19-.24.14-.02.28-.04.42-.07 1.16-.24 2.28-.53 2.5-1.44.09-.4-.05-.87-.4-1.4Z" />
    </svg>
  );
}
