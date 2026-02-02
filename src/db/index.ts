
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
    if (!_db) {
        const sqlite = new Database("local.db");
        _db = drizzle(sqlite, { schema });
    }
    return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_, prop) {
        return getDb()[prop as keyof ReturnType<typeof drizzle>];
    }
});
