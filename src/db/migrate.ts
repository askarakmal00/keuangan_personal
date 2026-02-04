import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { seedCategories } from "./seed-categories";
import path from "path";
import fs from "fs";

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || "local.db";

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir) && dbDir !== ".") {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`🗄️  Database path: ${dbPath}`);

// Create or open database
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Run migrations
console.log("🔄 Running migrations...");
migrate(db, { migrationsFolder: "./drizzle" });
console.log("✅ Migrations completed successfully");

// Seed categories
await seedCategories();

// Close database
sqlite.close();
