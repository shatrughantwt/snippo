import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  password: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const snippets = pgTable("snippets", {
  id: serial().primaryKey(),
  title: text().notNull(),
  code: text().notNull(),
  lang: text().notNull(),
  ext: text().notNull(),
  color: text().notNull(),
  lines: integer().notNull(),
  preview: text().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
