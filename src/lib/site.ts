/**
 * Single source of truth for Sassy's business facts used across the public site
 * (nav, footer, contact, home, JSON-LD). Change a value here and it updates
 * everywhere — no more hunting for hardcoded phone numbers or addresses.
 */
export const SITE = {
  name: "Sassy's Bakery",

  // Phone — display + tel: href. Standardized to the correct store line.
  phone: "(519) 461-1234",
  phoneHref: "tel:+15194611234",

  email: "inquiry@mysassys.com",

  // Address
  street: "225 King St",
  city: "Thorndale",
  region: "ON",
  get address() {
    return `${this.street}, ${this.city}, ${this.region}`;
  },

  // Google Maps "Get Directions" link (shared by contact + home visit band).
  mapsUrl: "https://maps.app.goo.gl/nGiziYxjzQMqWoa49",

  // ⚠️ PLACEHOLDER — the one knob to flip once the real founding year is
  // confirmed. Drives the "since {year}" reputation cue site-wide.
  foundingYear: 2009,

  // Social + reviews. Fill these in and the links/buttons light up
  // automatically; empty strings stay hidden.
  social: {
    facebookUrl: "https://www.facebook.com/mysassys/",
    googleReviewsUrl: "https://www.google.com/searchviewer/10?svid=CAwSHBIaCgNwdnESE0Nnd3ZaeTh4YUdNeE16bHNObmcYCg#sv=CAESzQEKuQEStgEKd0FKaVQ0dEt5S2ZhMXhCbUduRjIxTHR0cTVyVVhkM1NVejhmLXd4V1A4TDVOemlHcUVsMExOR0V3WTVzOUdQMTd0MlRySk1OT2w5anZaT0phUlp6ZVhOXzJ5V0lTUWhQNW92QXYtbXN1RUNvX2x3Rk4xZkdJb193EhdGYWxpYXVUOExPdmNydUVQcTR6dWdRURoiQURzcjlmVHpwNVdrXzJreVhVSVlIcTAwNk9melJCSXc0dxIEODA1MRoBMyoAMAA4AUAAGAAg25vM8wRKAhAC",
    yelpUrl: "https://www.yelp.com/biz/sassys-bakery-thorndale",
  },
} as const;
