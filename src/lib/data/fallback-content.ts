/**
 * Static marketing content used to render the public site when the Neon DB is
 * empty or unreachable. A provisioned + seeded DB always overrides this — the
 * data functions only fall back here when a query returns nothing.
 *
 * Menu names/descriptions come from Sassy's real recipe sheets (via the design
 * handoff); prices are illustrative placeholders — replace before launch.
 */
import type { menuCategories, menuItems, weeklySpecials, galleryPhotos } from "@/db/schema";

type MenuCategory = typeof menuCategories.$inferSelect;
type MenuItem = typeof menuItems.$inferSelect;
export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };

type Special = typeof weeklySpecials.$inferSelect;
export type SpecialView = Special & { tag?: string; accent?: string };

type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type GalleryPhotoWithUrl = GalleryPhoto & { url: string };

const now = new Date();

// ─── Menu ───────────────────────────────────────────────────────────────────

type RawItem = { name: string; description: string; priceCents: number };

const RAW_MENU: { name: string; slug: string; items: RawItem[] }[] = [
  {
    name: "Pizza",
    slug: "pizza",
    items: [
      { name: "Cheese Pizza", description: "Sauce, mozzarella & cheddar.", priceCents: 1499 },
      { name: "Pepperoni", description: "Sauce, mozzarella & pepperoni.", priceCents: 1649 },
      { name: "Deluxe", description: "Pepperoni, mushroom, bacon & green pepper.", priceCents: 1999 },
      { name: "Vegetarian", description: "Mushroom, green pepper, olives & tomato.", priceCents: 1849 },
      { name: "Sassy's Chicken", description: "Garlic spread, BBQ sauce, chicken, mushroom, onion & tomato.", priceCents: 2099 },
      { name: "Tropical Pulled Pork", description: "Pulled pork, pineapple, hot peppers & BBQ sauce.", priceCents: 2099 },
      { name: "Hawaiian", description: "Ham & pineapple.", priceCents: 1799 },
      { name: "Mega Meat", description: "Pepperoni, bacon, beef & sausage.", priceCents: 2199 },
    ],
  },
  {
    name: "Subs",
    slug: "subs",
    items: [
      { name: "BLT Sub", description: "Bacon, lettuce & tomato with your choice of cheese.", priceCents: 899 },
      { name: "Turkey Club", description: "Turkey, bacon & cheese.", priceCents: 949 },
      { name: "Chicken Club", description: "Grilled chicken, bacon & cheese.", priceCents: 949 },
      { name: "Roast Beef", description: "Sliced roast beef & cheese.", priceCents: 949 },
      { name: "BBQ Chicken", description: "Chicken piece, cheese & BBQ.", priceCents: 949 },
      { name: "Meatball Sub", description: "Meatballs, pizza sauce & mozzarella.", priceCents: 899 },
      { name: "Assorted", description: "Ham, luncheon meat & salami with cheese.", priceCents: 849 },
      { name: "Veggie Cheese", description: "Your choice of cheese, veggies on request.", priceCents: 699 },
    ],
  },
  {
    name: "Burgers & Wraps",
    slug: "burgers",
    items: [
      { name: "Bacon Cheese Burger", description: "Kaiser bun, double patty, cheddar & bacon.", priceCents: 899 },
      { name: "Peameal Cheddar Burger", description: "Kaiser bun, double patty, cheddar & peameal bacon.", priceCents: 949 },
      { name: "Buffalo Chicken Caesar Wrap", description: "Crispy chicken tossed in sauce with romaine & caesar.", priceCents: 999 },
      { name: "Chicken Caesar Wrap", description: "Diced chicken, bacon, mozzarella, romaine & caesar.", priceCents: 949 },
    ],
  },
  {
    name: "Chicken Meals",
    slug: "chicken",
    items: [
      { name: "Snack", description: "1 small + 1 large piece, small fry, can of pop.", priceCents: 999 },
      { name: "Lunch", description: "1 small + 1 large piece, fry, deli salad, bun, pop.", priceCents: 1199 },
      { name: "Dinner", description: "2 large + 1 small piece, fry, deli salad, bun, pop.", priceCents: 1499 },
      { name: "Hungry Man", description: "2 large + 2 small pieces, fry, deli salad, roll, pop.", priceCents: 1799 },
      { name: "Meal A (feeds 3–4)", description: "10 pcs chicken, medium fry, two deli salads.", priceCents: 3499 },
      { name: "Meal B (feeds 5–6)", description: "15 pcs chicken, large fry, two deli salads.", priceCents: 4999 },
    ],
  },
  {
    name: "Salads",
    slug: "salads",
    items: [
      { name: "Garden Salad", description: "Iceberg, onion, green pepper, cucumber, tomato & cheddar.", priceCents: 749 },
      { name: "Taco Salad", description: "Iceberg, peppers, onion, tomato, nacho chips, cheddar & chili.", priceCents: 949 },
      { name: "Greek Salad", description: "Iceberg, black olives, onion, cucumber & feta.", priceCents: 849 },
      { name: "Chicken Caesar Salad", description: "Romaine, croutons, bacon, mozzarella & diced chicken.", priceCents: 999 },
      { name: "Chicken Club Salad", description: "Iceberg, peppers, cucumber, tomato, bacon & cheddar.", priceCents: 999 },
      { name: "Picnic Bowl", description: "Summer sausage, grapes, diced cheese & pepperettes.", priceCents: 899 },
    ],
  },
  {
    name: "Breakfast",
    slug: "breakfast",
    items: [
      { name: "Breakfast Sandwich", description: "Bagel, egg, bacon/ham/sausage & choice of cheese.", priceCents: 649 },
      { name: "BLT Breakfast Sandwich", description: "Bagel, bacon, lettuce, tomato, mayo & cheese.", priceCents: 699 },
      { name: "Western Sandwich", description: "Toast, egg, ham, green pepper, onion & cheese.", priceCents: 699 },
      { name: "Peameal Breakfast Sandwich", description: "Bagel, egg, peameal bacon & cheese.", priceCents: 699 },
      { name: "Farmer's Breakfast Wrap", description: "Egg, bacon, hashbrown & cheddar in a wrap.", priceCents: 749 },
    ],
  },
];

export const FALLBACK_MENU: MenuCategoryWithItems[] = RAW_MENU.map((cat, ci) => {
  const categoryId = ci + 1;
  return {
    id: categoryId,
    name: cat.name,
    slug: cat.slug,
    sortOrder: ci,
    isActive: true,
    items: cat.items.map((it, ii) => ({
      id: `fallback-${cat.slug}-${ii}`,
      categoryId,
      name: it.name,
      description: it.description,
      priceCents: it.priceCents,
      imageKey: null,
      isActive: true,
      sortOrder: ii,
      createdAt: now,
      updatedAt: now,
    })),
  };
});

/** Home "What we make" tiles — link into the menu, preselecting a category. */
export const HOME_CATEGORIES: { label: string; slug: string }[] = [
  { label: "Pizza", slug: "pizza" },
  { label: "Subs & Sandwiches", slug: "subs" },
  { label: "Chicken", slug: "chicken" },
  { label: "Salads", slug: "salads" },
  { label: "Breakfast", slug: "breakfast" },
  { label: "Fresh Baking", slug: "" },
];

// ─── Weekly specials ──────────────────────────────────────────────────────────

export const FALLBACK_SPECIALS: SpecialView[] = [
  {
    id: "fallback-special-1",
    title: "Large 2-Topping Pizza",
    body: "Any two toppings on a fresh 12\" crust.",
    tag: "Pizza Night",
    accent: "#D2352B",
    imageKey: null,
    startsOn: now,
    endsOn: now,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "fallback-special-2",
    title: "Wing Basket + Fries",
    body: "Tossed in your choice of sauce, served with fries.",
    tag: "Wing Day",
    accent: "#DDA43A",
    imageKey: null,
    startsOn: now,
    endsOn: now,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "fallback-special-3",
    title: "Baker's Dozen Buns",
    body: "Fresh from the oven every morning.",
    tag: "Fresh Baked",
    accent: "#1E6B3B",
    imageKey: null,
    startsOn: now,
    endsOn: now,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

/** Rotating accent colors for DB-driven specials that carry no accent field. */
export const SPECIAL_ACCENTS = ["#D2352B", "#DDA43A", "#1E6B3B"];

// ─── Gallery ──────────────────────────────────────────────────────────────────

const GALLERY_LABELS: { category: GalleryPhoto["category"]; caption: string }[] = [
  { category: "cakes", caption: "Cakes" },
  { category: "cakes", caption: "Cakes" },
  { category: "breads", caption: "Breads" },
  { category: "breads", caption: "Breads" },
  { category: "storefront", caption: "Storefront" },
  { category: "storefront", caption: "Storefront" },
  { category: "catering", caption: "Catering" },
  { category: "catering", caption: "Catering" },
];

export const FALLBACK_GALLERY: GalleryPhotoWithUrl[] = GALLERY_LABELS.map((g, i) => ({
  id: `fallback-gallery-${i}`,
  imageKey: "",
  caption: g.caption,
  category: g.category,
  sortOrder: i,
  isActive: true,
  createdAt: now,
  url: "",
}));
