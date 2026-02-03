
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
    if (!_db) {
        // Support both local development and Railway with volume
        const dbPath = process.env.DATABASE_PATH || "local.db";
        const sqlite = new Database(dbPath);
        _db = drizzle(sqlite, { schema });
    }
    return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_, prop) {
        return getDb()[prop as keyof ReturnType<typeof drizzle>];
    }
});
