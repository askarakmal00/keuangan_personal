
import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    amount: integer("amount").notNull(), // Request amount in cents/smallest unit or just handle as number? SQLite stores integers. Let's send as number.
    type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
    category: text("category").notNull(),
    description: text("description"),
    date: integer("date", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const debts = sqliteTable("debts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // Who owes or is owed
    amount: integer("amount").notNull(),
    type: text("type", { enum: ["PAYABLE", "RECEIVABLE"] }).notNull(), // Hutang (Payable) vs Piutang (Receivable)
    dueDate: integer("due_date", { mode: "timestamp" }),
    isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const investments = sqliteTable("investments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // e.g., "Saham BBCA", "Reksadana"
    amount: integer("amount").notNull(), // Initial investment amount
    type: text("type").notNull(), // e.g., "Stock", "Mutual Fund", "Gold"
    currentValue: integer("current_value"), // To track profit/loss manually
    date: integer("date", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const goals = sqliteTable("goals", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // e.g., "Beli Rumah"
    targetAmount: integer("target_amount").notNull(),
    currentAmount: integer("current_amount").default(0).notNull(),
    deadline: integer("deadline", { mode: "timestamp" }),
    coverImage: text("cover_image"), // URL to cover image
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const goalBreakdowns = sqliteTable("goal_breakdowns", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    goalId: integer("goal_id").notNull().references(() => goals.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(), // e.g., "Tiket Pesawat", "Hotel"
    amount: integer("amount").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});
