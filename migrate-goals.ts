import Database from "better-sqlite3";

const db = new Database("local.db");

// Add coverImage column to goals table
try {
    db.exec("ALTER TABLE goals ADD COLUMN cover_image TEXT;");
    console.log("✅ Added cover_image column to goals table");
} catch (err: any) {
    if (err.message.includes("duplicate column name")) {
        console.log("⚠️ cover_image column already exists");
    } else {
        console.error("❌ Error adding cover_image:", err.message);
    }
}

// Create goal_breakdowns table
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS goal_breakdowns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
            item_name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
    `);
    console.log("✅ Created goal_breakdowns table");
} catch (err: any) {
    console.error("❌ Error creating goal_breakdowns table:", err.message);
}

db.close();
console.log("\n✅ Database migration complete!");
