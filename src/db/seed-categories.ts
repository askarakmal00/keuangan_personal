import { db } from "./index";
import { categories } from "./schema";

export async function seedCategories() {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories).limit(1);

    if (existingCategories.length > 0) {
        console.log("📦 Categories already seeded, skipping...");
        return;
    }

    console.log("🌱 Seeding default categories...");

    const defaultCategories = [
        // Income categories
        { name: "Gaji", type: "INCOME" as const, icon: "💰" },
        { name: "Bonus", type: "INCOME" as const, icon: "🎁" },
        { name: "Freelance", type: "INCOME" as const, icon: "💼" },
        { name: "Investasi", type: "INCOME" as const, icon: "📈" },
        { name: "Lainnya", type: "INCOME" as const, icon: "💵" },

        // Expense categories
        { name: "Makanan", type: "EXPENSE" as const, icon: "🍔" },
        { name: "Transport", type: "EXPENSE" as const, icon: "🚗" },
        { name: "Belanja", type: "EXPENSE" as const, icon: "🛒" },
        { name: "Tagihan", type: "EXPENSE" as const, icon: "📄" },
        { name: "Hiburan", type: "EXPENSE" as const, icon: "🎮" },
        { name: "Kesehatan", type: "EXPENSE" as const, icon: "🏥" },
        { name: "Pendidikan", type: "EXPENSE" as const, icon: "📚" },
        { name: "Lainnya", type: "EXPENSE" as const, icon: "💸" },
    ];

    await db.insert(categories).values(defaultCategories);

    console.log(`✅ Seeded ${defaultCategories.length} default categories`);
}
