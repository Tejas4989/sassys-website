import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uuid,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "baker_retail",
  "baker_wholesale",
  "wholesale_customer",
]);

export const orderTypeEnum = pgEnum("order_type", ["retail", "wholesale"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "pending_review", // catering orders awaiting employee approval
  "confirmed",
  "ready",
  "completed",
  "cancelled",
]);

export const fulfillmentEnum = pgEnum("fulfillment", ["pickup", "delivery"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "clover_hosted",
  "pay_in_store",
  "net30",
]);

export const galleryCategoryEnum = pgEnum("gallery_category", [
  "cakes",
  "breads",
  "storefront",
  "catering",
]);

// ─── Users (staff + wholesale customers share this table) ────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // null for wholesale customers (passcode used instead)
  role: userRoleEnum("role").notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Wholesale customers (extends users) ─────────────────────────────────────

export const wholesaleCustomers = pgTable("wholesale_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  businessName: text("business_name").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  defaultFulfillment: fulfillmentEnum("default_fulfillment")
    .notNull()
    .default("pickup"),
  defaultDeliveryDay: text("default_delivery_day"), // 'monday','tuesday',...
  passcodeHash: text("passcode_hash").notNull(),
  passcodeMustChange: boolean("passcode_must_change").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Menu (retail) ───────────────────────────────────────────────────────────

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  imageKey: text("image_key"), // R2 object key
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Wholesale catalog ───────────────────────────────────────────────────────

export const wholesaleCategories = pgTable("wholesale_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const wholesaleItems = pgTable("wholesale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => wholesaleCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  wholesalePriceCents: integer("wholesale_price_cents").notNull(),
  moq: integer("moq").notNull().default(1), // minimum order quantity
  caseSize: integer("case_size").notNull().default(1), // order in multiples of
  availabilityDays: jsonb("availability_days").$type<string[]>().default([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  imageKey: text("image_key"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Weekly specials ─────────────────────────────────────────────────────────

export const weeklySpecials = pgTable("weekly_specials", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(), // rich text (TipTap JSON or HTML)
  imageKey: text("image_key"),
  startsOn: timestamp("starts_on").notNull(),
  endsOn: timestamp("ends_on").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Hours ───────────────────────────────────────────────────────────────────

export const hours = pgTable("hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 1=Mon, ..., 6=Sat
  opensAt: text("opens_at").notNull(), // "05:30"
  closesAt: text("closes_at").notNull(), // "20:00"
  isClosed: boolean("is_closed").notNull().default(false),
});

export const holidayOverrides = pgTable("holiday_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull().unique(), // "YYYY-MM-DD"
  label: text("label").notNull(), // "Christmas Day"
  isClosed: boolean("is_closed").notNull().default(true),
  opensAt: text("opens_at"), // only if not closed
  closesAt: text("closes_at"),
});

// ─── Gallery ─────────────────────────────────────────────────────────────────

export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageKey: text("image_key").notNull(), // R2 object key
  caption: text("caption"),
  category: galleryCategoryEnum("category").notNull().default("storefront"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Persistent wholesale carts ───────────────────────────────────────────────

export const wholesaleCarts = pgTable("wholesale_carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => wholesaleCustomers.id, { onDelete: "cascade" })
    .unique(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const wholesaleCartItems = pgTable("wholesale_cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => wholesaleCarts.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => wholesaleItems.id, { onDelete: "cascade" }),
  qty: integer("qty").notNull(),
});

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: orderTypeEnum("type").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  fulfillment: fulfillmentEnum("fulfillment").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  // Customer identifiers (retail = email+name only, wholesale = FK)
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  wholesaleCustomerId: uuid("wholesale_customer_id").references(
    () => wholesaleCustomers.id
  ),

  // Timing
  pickupAt: timestamp("pickup_at"), // retail pickup datetime
  deliveryDate: text("delivery_date"), // wholesale: "YYYY-MM-DD"

  // Catering flag
  isCatering: boolean("is_catering").notNull().default(false),

  // Clover integration
  cloverOrderId: text("clover_order_id"),
  cloverPaymentId: text("clover_payment_id"),

  // Financials (denormalized at order time)
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),

  notes: text("notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id), // for catering review
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // Denormalized at order time — survive menu edits/deletions
  itemId: text("item_id").notNull(), // original menu/wholesale item UUID (for reference)
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  qty: integer("qty").notNull(),
});

// ─── Web push subscriptions ───────────────────────────────────────────────────

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerEmail: text("customer_email").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Rate limiting ────────────────────────────────────────────────────────────

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  ip: text("ip").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
  succeeded: boolean("succeeded").notNull().default(false),
});

// ─── Admin audit log ──────────────────────────────────────────────────────────

export const adminAuditLog = pgTable("admin_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // 'passcode_rotated', 'account_disabled', etc.
  targetId: text("target_id"), // wholesale customer ID or other resource
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  wholesaleCustomer: one(wholesaleCustomers, {
    fields: [users.id],
    references: [wholesaleCustomers.userId],
  }),
}));

export const wholesaleCustomersRelations = relations(
  wholesaleCustomers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [wholesaleCustomers.userId],
      references: [users.id],
    }),
    cart: one(wholesaleCarts, {
      fields: [wholesaleCustomers.id],
      references: [wholesaleCarts.customerId],
    }),
    orders: many(orders),
  })
);

export const menuCategoriesRelations = relations(
  menuCategories,
  ({ many }) => ({
    items: many(menuItems),
  })
);

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));

export const wholesaleCategoriesRelations = relations(
  wholesaleCategories,
  ({ many }) => ({
    items: many(wholesaleItems),
  })
);

export const wholesaleItemsRelations = relations(wholesaleItems, ({ one }) => ({
  category: one(wholesaleCategories, {
    fields: [wholesaleItems.categoryId],
    references: [wholesaleCategories.id],
  }),
}));

export const wholesaleCartsRelations = relations(
  wholesaleCarts,
  ({ one, many }) => ({
    customer: one(wholesaleCustomers, {
      fields: [wholesaleCarts.customerId],
      references: [wholesaleCustomers.id],
    }),
    items: many(wholesaleCartItems),
  })
);

export const wholesaleCartItemsRelations = relations(
  wholesaleCartItems,
  ({ one }) => ({
    cart: one(wholesaleCarts, {
      fields: [wholesaleCartItems.cartId],
      references: [wholesaleCarts.id],
    }),
    item: one(wholesaleItems, {
      fields: [wholesaleCartItems.itemId],
      references: [wholesaleItems.id],
    }),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  wholesaleCustomer: one(wholesaleCustomers, {
    fields: [orders.wholesaleCustomerId],
    references: [wholesaleCustomers.id],
  }),
  items: many(orderItems),
  reviewer: one(users, {
    fields: [orders.reviewedBy],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
