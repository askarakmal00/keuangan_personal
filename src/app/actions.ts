
"use server";

import { db } from "@/db";
import { transactions, debts, investments, goals, goalBreakdowns } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";

// --- TRANSACTIONS ---

export async function addTransaction(data: {
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description?: string;
    date: Date;
}) {
    await db.insert(transactions).values({
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
        date: data.date,
    });
    revalidatePath("/");
    revalidatePath("/transactions");
}

export async function getTransactions() {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
}

export async function getSummary() {
    const allTransactions = await db.select().from(transactions);

    let income = 0;
    let expense = 0;

    allTransactions.forEach((t) => {
        if (t.type === "INCOME") income += t.amount;
        else expense += t.amount;
    });

    const balance = income - expense;

    // Debts
    const allDebts = await db.select().from(debts);
    const payable = allDebts
        .filter((d) => d.type === "PAYABLE" && !d.isPaid)
        .reduce((acc, curr) => acc + curr.amount, 0);
    const receivable = allDebts
        .filter((d) => d.type === "RECEIVABLE" && !d.isPaid)
        .reduce((acc, curr) => acc + curr.amount, 0);

    // Investments
    const allInvestments = await db.select().from(investments);
    const totalInvestment = allInvestments.reduce((acc, curr) => acc + (curr.currentValue || curr.amount), 0);

    // Category Breakdown
    const expensesByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};

    allTransactions.forEach((t) => {
        if (t.type === "INCOME") {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        }
    });

    // Convert to array for Recharts
    const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
    const incomeChartData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));

    return {
        balance,
        income,
        expense,
        payable,
        receivable,
        totalInvestment,
        expenseChartData,
        incomeChartData
    };
}

// --- DEBTS ---

export async function addDebt(data: {
    name: string;
    amount: number;
    type: "PAYABLE" | "RECEIVABLE";
    dueDate?: Date;
}) {
    await db.insert(debts).values({
        name: data.name,
        amount: data.amount,
        type: data.type,
        dueDate: data.dueDate,
        isPaid: false,
    });
    revalidatePath("/debts");
    revalidatePath("/");
}

export async function toggleDebtStatus(id: number, currentStatus: boolean) {
    await db.update(debts).set({ isPaid: !currentStatus }).where(eq(debts.id, id));
    revalidatePath("/debts");
    revalidatePath("/");
}

export async function payDebtFromAccount(id: number, paymentAmount?: number) {
    // Get the debt details first
    const debt = await db.select().from(debts).where(eq(debts.id, id)).limit(1);

    if (debt.length === 0) {
        throw new Error("Debt not found");
    }

    const debtData = debt[0];

    // Use provided amount or full debt amount
    const amountToPay = paymentAmount || debtData.amount;

    // Validate payment amount
    if (amountToPay <= 0 || amountToPay > debtData.amount) {
        throw new Error("Invalid payment amount");
    }

    // Calculate new debt amount after payment
    const newDebtAmount = debtData.amount - amountToPay;

    // Update debt: reduce amount and mark as paid if fully paid
    if (newDebtAmount === 0) {
        await db.update(debts).set({ isPaid: true, amount: 0 }).where(eq(debts.id, id));
    } else {
        await db.update(debts).set({ amount: newDebtAmount }).where(eq(debts.id, id));
    }

    // Create an expense transaction for this payment
    await db.insert(transactions).values({
        amount: amountToPay,
        type: "EXPENSE",
        category: debtData.type === "PAYABLE" ? "Pembayaran Hutang" : "Penerimaan Piutang",
        description: `Pembayaran ${debtData.type === "PAYABLE" ? "hutang" : "piutang"} kepada/dari ${debtData.name}${newDebtAmount > 0 ? " (Sebagian)" : ""}`,
        date: new Date(),
    });

    revalidatePath("/debts");
    revalidatePath("/");
    revalidatePath("/transactions");
}

export async function getDebts() {
    return await db.select().from(debts).orderBy(desc(debts.createdAt));
}


// --- INVESTMENTS ---

export async function addInvestment(data: {
    name: string;
    amount: number;
    type: string;
}) {
    await db.insert(investments).values({
        name: data.name,
        amount: data.amount,
        type: data.type,
        currentValue: data.amount,
        date: new Date(),
    });

    // Create expense transaction to deduct from bank balance
    await db.insert(transactions).values({
        amount: data.amount,
        type: "EXPENSE",
        category: "Investasi",
        description: `Investasi di ${data.name} (${data.type})`,
        date: new Date(),
    });

    revalidatePath("/investments");
    revalidatePath("/");
    revalidatePath("/transactions");
}

export async function getInvestments() {
    return await db.select().from(investments).orderBy(desc(investments.date));
}

export async function withdrawFromInvestment(id: number) {
    const investment = await db.select().from(investments).where(eq(investments.id, id)).limit(1);

    if (investment.length === 0) {
        throw new Error("Investment not found");
    }

    const invData = investment[0];
    const withdrawalAmount = invData.currentValue || invData.amount;
    const profit = withdrawalAmount - invData.amount;

    // Format profit/loss text
    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const profitText = profit > 0
        ? `(Profit: +${formatIDR(profit)})`
        : profit < 0
            ? `(Loss: -${formatIDR(profit)})`
            : "(Break Even)";

    // Delete investment (full withdrawal)
    await db.delete(investments).where(eq(investments.id, id));

    // Create income transaction to add back to bank balance
    await db.insert(transactions).values({
        amount: withdrawalAmount,
        type: "INCOME",
        category: "Penarikan Investasi",
        description: `Penarikan dari ${invData.name} ${profitText}`,
        date: new Date(),
    });

    revalidatePath("/investments");
    revalidatePath("/");
    revalidatePath("/transactions");
}

// --- GOALS ---

export async function addGoal(data: {
    name: string;
    targetAmount: number;
    deadline?: Date;
    coverImage?: string;
    breakdownItems?: Array<{ itemName: string; amount: number }>;
}) {
    // Insert goal and get the ID
    const [newGoal] = await db.insert(goals).values({
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        coverImage: data.coverImage,
    }).returning({ id: goals.id });

    // Insert breakdown items if any
    if (data.breakdownItems && data.breakdownItems.length > 0) {
        await db.insert(goalBreakdowns).values(
            data.breakdownItems.map(item => ({
                goalId: newGoal.id,
                itemName: item.itemName,
                amount: item.amount,
            }))
        );
    }

    revalidatePath("/goals");
}

export async function getGoals() {
    return await db.select().from(goals).orderBy(desc(goals.createdAt));
}

export async function getGoalBreakdown(goalId: number) {
    return await db.select().from(goalBreakdowns).where(eq(goalBreakdowns.goalId, goalId));
}

export async function addGoalBreakdownItem(data: {
    goalId: number;
    itemName: string;
    amount: number;
}) {
    await db.insert(goalBreakdowns).values({
        goalId: data.goalId,
        itemName: data.itemName,
        amount: data.amount,
    });
    revalidatePath("/goals");
}

export async function updateGoalTarget(goalId: number, newTarget: number) {
    await db.update(goals)
        .set({ targetAmount: newTarget })
        .where(eq(goals.id, goalId));
    revalidatePath("/goals");
}

export async function deleteGoalBreakdownItem(id: number) {
    await db.delete(goalBreakdowns).where(eq(goalBreakdowns.id, id));
    revalidatePath("/goals");
}

// --- DELETE OPERATIONS ---

export async function deleteTransaction(id: number) {
    await db.delete(transactions).where(eq(transactions.id, id));
    revalidatePath("/");
    revalidatePath("/transactions");
}

export async function deleteDebt(id: number) {
    await db.delete(debts).where(eq(debts.id, id));
    revalidatePath("/");
    revalidatePath("/debts");
}

export async function deleteInvestment(id: number) {
    await db.delete(investments).where(eq(investments.id, id));
    revalidatePath("/");
    revalidatePath("/investments");
}

export async function deleteGoal(id: number) {
    await db.delete(goals).where(eq(goals.id, id));
    revalidatePath("/goals");
}

// --- INVESTMENT HELPERS ---

export async function updateInvestmentValue(id: number, newValue: number) {
    await db.update(investments).set({ currentValue: newValue }).where(eq(investments.id, id));
    revalidatePath("/");
    revalidatePath("/investments");
}

// --- GOAL HELPERS ---

export async function contributeToGoal(id: number, amount: number) {
    const goal = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    if (goal.length > 0) {
        const newAmount = goal[0].currentAmount + amount;
        await db.update(goals).set({ currentAmount: newAmount }).where(eq(goals.id, id));

        // Create expense transaction to deduct from bank balance
        await db.insert(transactions).values({
            amount: amount,
            type: "EXPENSE",
            category: "Kontribusi Impian",
            description: `Kontribusi untuk ${goal[0].name}`,
            date: new Date(),
        });

        revalidatePath("/goals");
        revalidatePath("/");
        revalidatePath("/transactions");
    }
}

export async function withdrawFromGoal(id: number, amount: number) {
    const goal = await db.select().from(goals).where(eq(goals.id, id)).limit(1);

    if (goal.length === 0) {
        throw new Error("Goal not found");
    }

    const goalData = goal[0];

    // Validate withdrawal amount
    if (amount <= 0 || amount > goalData.currentAmount) {
        throw new Error("Invalid withdrawal amount");
    }

    const newAmount = goalData.currentAmount - amount;
    await db.update(goals).set({ currentAmount: newAmount }).where(eq(goals.id, id));

    // Create income transaction to add back to bank balance
    await db.insert(transactions).values({
        amount: amount,
        type: "INCOME",
        category: "Penarikan Impian",
        description: `Penarikan dari ${goalData.name}`,
        date: new Date(),
    });

    revalidatePath("/goals");
    revalidatePath("/");
    revalidatePath("/transactions");
}
