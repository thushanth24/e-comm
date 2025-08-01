import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

// Categories table
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  inventory: integer("inventory").notNull(),
  featured: boolean("featured").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Images table
export const productImages = pgTable("product_images", {
  id: integer("id").primaryKey().notNull(),
  productId: integer("product_id").references(() => products.id),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
