import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
});

export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull(), // 'watching', 'planned', 'completed'
  imageUrl: text("image_url"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertShowSchema = createInsertSchema(shows).pick({
  title: true,
  platform: true,
  status: true,
  userId: true,
});

export const updateShowSchema = createInsertSchema(shows).pick({
  status: true,
  completedAt: true,
}).extend({
  id: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShow = z.infer<typeof insertShowSchema>;
export type UpdateShow = z.infer<typeof updateShowSchema>;
export type Show = typeof shows.$inferSelect;
