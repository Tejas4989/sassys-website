/**
 * Database seed script — populates Sassy's Bakery with real menu data.
 *
 *   DATABASE_URL=your-neon-url pnpm tsx scripts/seed.ts
 *
 * Run AFTER migrations: pnpm db:migrate
 * Safe to re-run — uses ON CONFLICT DO NOTHING or TRUNCATE first if preferred.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "argon2";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱  Seeding Sassy's Bakery database...\n");

  // ─── Hours ────────────────────────────────────────────────────────────────
  console.log("📅  Seeding hours...");
  const hoursData = [
    { dayOfWeek: 0, opensAt: "7:00", closesAt: "21:00", isClosed: false },
    { dayOfWeek: 1, opensAt: "5:30", closesAt: "20:00", isClosed: false },
    { dayOfWeek: 2, opensAt: "5:30", closesAt: "20:00", isClosed: false },
    { dayOfWeek: 3, opensAt: "5:30", closesAt: "20:00", isClosed: false },
    { dayOfWeek: 4, opensAt: "5:30", closesAt: "21:00", isClosed: false },
    { dayOfWeek: 5, opensAt: "5:30", closesAt: "23:00", isClosed: false },
    { dayOfWeek: 6, opensAt: "7:00", closesAt: "23:00", isClosed: false },
  ];
  for (const h of hoursData) {
    await db.insert(schema.hours).values(h).onConflictDoNothing();
  }

  // ─── Menu categories ──────────────────────────────────────────────────────
  console.log("📂  Seeding menu categories...");
  const cats = await db
    .insert(schema.menuCategories)
    .values([
      { name: "Pizza", slug: "pizza", sortOrder: 1 },
      { name: "Panzerottis & Garlic Strips", slug: "panzerottis", sortOrder: 2 },
      { name: "Southern Fried Chicken", slug: "chicken", sortOrder: 3 },
      { name: "Hamburgers", slug: "burgers", sortOrder: 4 },
      { name: "Submarine Sandwiches & Wraps", slug: "subs-wraps", sortOrder: 5 },
      { name: "Appetizers, Sides & Salads", slug: "sides", sortOrder: 6 },
      { name: "Breakfast", slug: "breakfast", sortOrder: 7 },
      { name: "Beverages", slug: "beverages", sortOrder: 8 },
    ])
    .onConflictDoNothing()
    .returning();

  // Fetch all categories (in case some already existed)
  const allCats = await db.select().from(schema.menuCategories);
  const catId = (slug: string) => allCats.find((c) => c.slug === slug)?.id ?? 0;

  // ─── Menu items ───────────────────────────────────────────────────────────
  console.log("🍕  Seeding menu items...");
  const items: Array<typeof schema.menuItems.$inferInsert> = [
    // Pizza
    { categoryId: catId("pizza"), name: "Cheese Pizza", description: "Sauce, Mozzarella & Cheddar Cheese", priceCents: 1299, sortOrder: 1 },
    { categoryId: catId("pizza"), name: "Pepperoni", description: "Sauce, Mozzarella Cheese & Pepperoni", priceCents: 1549, sortOrder: 2 },
    { categoryId: catId("pizza"), name: "Delux", description: "Sauce, Mozzarella, Pepperoni, Mushrooms, Bacon & Green Peppers", priceCents: 1899, sortOrder: 3 },
    { categoryId: catId("pizza"), name: "Vegetarian", description: "Sauce, Mozzarella, Mushrooms, Green Peppers, Onion, Green Olives & Tomatoes", priceCents: 1850, sortOrder: 4 },
    { categoryId: catId("pizza"), name: "Mega Meat", description: "Sauce, Mozzarella, Pepperoni, Bacon, Beef & Sausage", priceCents: 1899, sortOrder: 5 },
    { categoryId: catId("pizza"), name: "Garlic Chicken", description: "Garlic Spread, Mozzarella, Cheddar, Bacon, Chicken & Onion", priceCents: 1899, sortOrder: 6 },
    { categoryId: catId("pizza"), name: "Hawaiian", description: "Sauce, Mozzarella, Ham & Pineapple", priceCents: 1899, sortOrder: 7 },
    { categoryId: catId("pizza"), name: "Sassy's Chicken", description: "Garlic Spread, BBQ Sauce, Mozzarella, Mushrooms, Chicken, Onion & Tomatoes", priceCents: 1899, sortOrder: 8 },
    { categoryId: catId("pizza"), name: "Canadian", description: "Sauce, Mozzarella, Pepperoni, Mushrooms & Bacon", priceCents: 1899, sortOrder: 9 },
    { categoryId: catId("pizza"), name: "Smoked Pulled Pork", description: "Pizza & BBQ Sauce, Mozzarella, Pulled Pork, Mushrooms, Green Peppers & Onions", priceCents: 2099, sortOrder: 10 },
    { categoryId: catId("pizza"), name: "Bacon Cheese Burger", description: "Sauce, Mozzarella, Cheddar, Bacon & Beef", priceCents: 1899, sortOrder: 11 },
    { categoryId: catId("pizza"), name: "Tropical Pulled Pork", description: "Sauce, Mozzarella, Pulled Pork, Pineapple, Hot Peppers and BBQ Sauce", priceCents: 1949, sortOrder: 12 },

    // Panzerottis
    { categoryId: catId("panzerottis"), name: "Panzarotti", description: "Cheese & Pepperoni. Additional toppings $1.50 each", priceCents: 1099, sortOrder: 1 },
    { categoryId: catId("panzerottis"), name: "Garlic Strips", description: "Medium pizza crust topped with garlic spread, Mozzarella & Cheddar Cheese", priceCents: 1299, sortOrder: 2 },
    { categoryId: catId("panzerottis"), name: "Loaded Nachos", description: "Green Peppers, Beef, Onion, Tomato, Mozzarella & Cheddar. Served with Salsa", priceCents: 1799, sortOrder: 3 },

    // Chicken
    { categoryId: catId("chicken"), name: "Snack — 2 PC Chicken", description: "2 Piece Chicken with Fries & Can of Pop", priceCents: 899, sortOrder: 1 },
    { categoryId: catId("chicken"), name: "Lunch — 2 PC Chicken", description: "2 Piece Chicken with Fries, Salad, Roll & Can of Pop", priceCents: 1099, sortOrder: 2 },
    { categoryId: catId("chicken"), name: "Dinner — 3 PC Chicken", description: "3 Piece Chicken with Fries, Salad, Roll & Can of Pop", priceCents: 1250, sortOrder: 3 },
    { categoryId: catId("chicken"), name: "Hungry Man — 4 PC", description: "4 Piece Chicken with Fries, Salad, Roll & Can of Pop", priceCents: 1499, sortOrder: 4 },
    { categoryId: catId("chicken"), name: "10 PC Bucket Deal", description: "Medium Fry & 2 Medium Salads", priceCents: 3199, sortOrder: 5 },
    { categoryId: catId("chicken"), name: "15 PC Bucket Deal", description: "Large Fry & 2 Large Salads", priceCents: 3999, sortOrder: 6 },
    { categoryId: catId("chicken"), name: "Chicken Fingers", description: "With Small Fries and a Can of Pop", priceCents: 1249, sortOrder: 7 },
    { categoryId: catId("chicken"), name: "Chicken Wings", description: "Mild, Medium, Hot, Honey Garlic or BBQ — 10 Wings", priceCents: 1499, sortOrder: 8 },
    { categoryId: catId("chicken"), name: "Chicken Wings 20 PC", description: "Mild, Medium, Hot, Honey Garlic or BBQ — 20 Wings", priceCents: 2599, sortOrder: 9 },

    // Burgers
    { categoryId: catId("burgers"), name: "Hamburger", description: "1/4 lb beef patty on a fresh bun with lettuce, tomato & condiments", priceCents: 999, sortOrder: 1 },
    { categoryId: catId("burgers"), name: "Cheeseburger", description: "1/4 lb beef with cheddar, lettuce, tomato & condiments", priceCents: 1099, sortOrder: 2 },
    { categoryId: catId("burgers"), name: "Bacon Cheeseburger", description: "1/4 lb beef with bacon, cheddar, lettuce, tomato & condiments", priceCents: 1199, sortOrder: 3 },
    { categoryId: catId("burgers"), name: "Double Burger", description: "Two 1/4 lb beef patties with all the fixings", priceCents: 1399, sortOrder: 4 },

    // Subs & Wraps
    { categoryId: catId("subs-wraps"), name: "Italian Sub", description: "Ham, salami, pepperoni, lettuce, tomato, onion & dressing on a 12\" bun", priceCents: 1099, sortOrder: 1 },
    { categoryId: catId("subs-wraps"), name: "Club Sub", description: "Turkey, ham, bacon, lettuce, tomato & mayo on a 12\" bun", priceCents: 1199, sortOrder: 2 },
    { categoryId: catId("subs-wraps"), name: "Meatball Sub", description: "Meatballs in marinara sauce with mozzarella on a toasted 12\" bun", priceCents: 1099, sortOrder: 3 },
    { categoryId: catId("subs-wraps"), name: "Chicken Caesar Wrap", description: "Grilled chicken, romaine, bacon bits, parmesan & Caesar dressing", priceCents: 999, sortOrder: 4 },
    { categoryId: catId("subs-wraps"), name: "Buffalo Chicken Wrap", description: "Crispy buffalo chicken, lettuce, tomato, cheddar & ranch dressing", priceCents: 999, sortOrder: 5 },
    { categoryId: catId("subs-wraps"), name: "Butter Chicken Wrap", description: "Our butter chicken masala in a warm tortilla with rice & greens", priceCents: 1199, sortOrder: 6 },

    // Sides
    { categoryId: catId("sides"), name: "French Fries (Small)", description: "", priceCents: 549, sortOrder: 1 },
    { categoryId: catId("sides"), name: "French Fries (Medium)", description: "", priceCents: 649, sortOrder: 2 },
    { categoryId: catId("sides"), name: "French Fries (Large)", description: "", priceCents: 749, sortOrder: 3 },
    { categoryId: catId("sides"), name: "Poutine", description: "Fries topped with cheese curds and gravy", priceCents: 799, sortOrder: 4 },
    { categoryId: catId("sides"), name: "Chilli Cheese Fries", description: "", priceCents: 999, sortOrder: 5 },
    { categoryId: catId("sides"), name: "Onion Rings", description: "", priceCents: 575, sortOrder: 6 },
    { categoryId: catId("sides"), name: "Mozzarella Sticks", description: "6 pieces served with Marinara Sauce", priceCents: 649, sortOrder: 7 },
    { categoryId: catId("sides"), name: "Fish & Chips", description: "Served with Tartar Sauce", priceCents: 1399, sortOrder: 8 },
    { categoryId: catId("sides"), name: "Potato Wedges", description: "Spicy/Seasoned", priceCents: 799, sortOrder: 9 },
    { categoryId: catId("sides"), name: "Taco Salad", description: "Lettuce, nacho chips, cheddar, onion, tomato, green pepper & chili", priceCents: 849, sortOrder: 10 },

    // Breakfast
    { categoryId: catId("breakfast"), name: "Breakfast Sandwich", description: "Egg, cheese & your choice of bacon or sausage on a toasted English muffin", priceCents: 549, sortOrder: 1 },
    { categoryId: catId("breakfast"), name: "Breakfast Wrap", description: "Scrambled eggs, cheese, bacon & hashbrown in a warm tortilla", priceCents: 749, sortOrder: 2 },
    { categoryId: catId("breakfast"), name: "Butter Chicken with Rice", description: "Available 2 PM onward", priceCents: 1499, sortOrder: 3 },

    // Beverages
    { categoryId: catId("beverages"), name: "Can of Pop", description: "Pepsi, Diet Pepsi, 7UP, Dr Pepper, or Root Beer", priceCents: 199, sortOrder: 1 },
    { categoryId: catId("beverages"), name: "Bottle of Water", description: "", priceCents: 199, sortOrder: 2 },
    { categoryId: catId("beverages"), name: "Shaw's Ice Cream — Regular Cone", description: "Single scoop", priceCents: 499, sortOrder: 3 },
    { categoryId: catId("beverages"), name: "Shaw's Ice Cream — Waffle Cone", description: "Single scoop", priceCents: 599, sortOrder: 4 },
    { categoryId: catId("beverages"), name: "Extra Scoop", description: "", priceCents: 149, sortOrder: 5 },
  ];

  for (const item of items) {
    await db.insert(schema.menuItems).values(item).onConflictDoNothing();
  }

  // ─── Weekly special ───────────────────────────────────────────────────────
  console.log("⭐  Seeding weekly special...");
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await db
    .insert(schema.weeklySpecials)
    .values({
      title: "Weekly Specials",
      body: `<ul>
        <li><strong>Monday:</strong> Any 2 Medium Pizzas + 2 Cans of Pop — <strong>$31.99+tax</strong></li>
        <li><strong>Tuesday:</strong> Butter Chicken or Chicken Tikka Masala with Rice — <strong>$14.99+tax</strong></li>
        <li><strong>Wednesday:</strong> Any Footlong Sub — <strong>$9.99+tax</strong></li>
        <li><strong>Thursday:</strong> Chicken Caesar Wrap or Buffalo Caesar Wrap — <strong>$9.99+tax</strong></li>
        <li><strong>Friday:</strong> Butter Chicken or Chicken Tikka Masala with Rice — <strong>$14.99+tax</strong></li>
        <li><strong>Saturday:</strong> Any 2 Medium Pizzas + 2 Cans of Pop — <strong>$31.99+tax</strong></li>
        <li><strong>Sunday:</strong> Chicken Caesar Wrap or Buffalo Caesar Wrap — <strong>$9.99+tax</strong></li>
      </ul>`,
      startsOn: now,
      endsOn: nextWeek,
      isActive: true,
    })
    .onConflictDoNothing();

  // ─── Wholesale categories & catalog ──────────────────────────────────────
  console.log("📦  Seeding wholesale catalog...");
  await db
    .insert(schema.wholesaleCategories)
    .values([
      { name: "Breads & Rolls", slug: "breads-rolls", sortOrder: 1 },
      { name: "Sweet Baked Goods", slug: "sweet-baked", sortOrder: 2 },
      { name: "Pizza Products", slug: "pizza-products", sortOrder: 3 },
    ])
    .onConflictDoNothing();

  const wCats = await db.select().from(schema.wholesaleCategories);
  const wCatId = (slug: string) => wCats.find((c) => c.slug === slug)?.id ?? 0;

  await db
    .insert(schema.wholesaleItems)
    .values([
      {
        categoryId: wCatId("breads-rolls"),
        name: "White Sandwich Loaf",
        description: "Standard white sandwich bread, sliced",
        wholesalePriceCents: 280,
        moq: 6,
        caseSize: 6,
        availabilityDays: ["monday","tuesday","wednesday","thursday","friday"],
        sortOrder: 1,
      },
      {
        categoryId: wCatId("breads-rolls"),
        name: "Whole Wheat Loaf",
        description: "100% whole wheat, sliced",
        wholesalePriceCents: 310,
        moq: 6,
        caseSize: 6,
        availabilityDays: ["monday","wednesday","friday"],
        sortOrder: 2,
      },
      {
        categoryId: wCatId("breads-rolls"),
        name: "Dinner Rolls",
        description: "Soft white dinner rolls, bag of 12",
        wholesalePriceCents: 420,
        moq: 4,
        caseSize: 4,
        availabilityDays: ["monday","tuesday","wednesday","thursday","friday","saturday"],
        sortOrder: 3,
      },
      {
        categoryId: wCatId("breads-rolls"),
        name: "Hamburger Buns",
        description: "Classic sesame hamburger buns, bag of 8",
        wholesalePriceCents: 380,
        moq: 6,
        caseSize: 6,
        availabilityDays: ["monday","tuesday","wednesday","thursday","friday","saturday"],
        sortOrder: 4,
      },
      {
        categoryId: wCatId("sweet-baked"),
        name: "Cinnamon Rolls",
        description: "Fresh glazed cinnamon rolls, tray of 6",
        wholesalePriceCents: 1200,
        moq: 2,
        caseSize: 2,
        availabilityDays: ["saturday","sunday"],
        sortOrder: 1,
      },
      {
        categoryId: wCatId("sweet-baked"),
        name: "Assorted Muffins",
        description: "Blueberry, chocolate chip & bran. Tray of 12",
        wholesalePriceCents: 1800,
        moq: 1,
        caseSize: 1,
        availabilityDays: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
        sortOrder: 2,
      },
      {
        categoryId: wCatId("pizza-products"),
        name: "Pizza Dough Balls",
        description: "Fresh 12\" dough balls, ready to stretch",
        wholesalePriceCents: 220,
        moq: 12,
        caseSize: 12,
        availabilityDays: ["monday","tuesday","wednesday","thursday","friday"],
        sortOrder: 1,
      },
    ])
    .onConflictDoNothing();

  // ─── Admin user ───────────────────────────────────────────────────────────
  console.log("👤  Seeding admin user...");
  const adminEmail = "admin@mysassys.com";
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail));

  if (existing.length === 0) {
    const adminPassword = await hash("Sassys2024!");
    await db.insert(schema.users).values({
      email: adminEmail,
      passwordHash: adminPassword,
      role: "admin",
      name: "Sassy's Admin",
      isActive: true,
    });
    console.log("   Admin created → admin@mysassys.com / Sassys2024!");
    console.log("   ⚠️  Change the password immediately after first login.");
  } else {
    console.log("   Admin user already exists — skipping.");
  }

  console.log("\n✅  Seed complete!\n");
  console.log("   Menu categories:", allCats.length + cats.length);
  console.log("   Menu items:", items.length);
  console.log("   Wholesale items: 7");
  console.log("   Weekly special: 1 (active through next week)\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
