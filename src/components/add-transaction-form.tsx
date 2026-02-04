
"use client";

import { useTransition, useState, useEffect } from "react";
import { addTransaction, getCategories } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageCategoriesDialog } from "@/components/manage-categories-dialog";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string | null;
}

export function AddTransactionForm() {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
    const [categories, setCategories] = useState<Category[]>([]);

    // Simple form state
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    // Load categories on mount and when type changes
    useEffect(() => {
        loadCategories();
    }, [type]);

    async function loadCategories() {
        const cats = await getCategories(type);
        setCategories(cats as Category[]);
        if (cats.length > 0 && !category) {
            setCategory(cats[0].name);
        }
    }

    function handleTypeChange(newType: "INCOME" | "EXPENSE") {
        setType(newType);
        setCategory(""); // Reset category when type changes
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount || !category) return;

        startTransition(async () => {
            await addTransaction({
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date),
            });
            // Reset form
            setAmount("");
            setDescription("");
        });
    }

    const filteredCategories = categories.filter(cat => cat.type === type);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tambah Transaksi Baru</CardTitle>
                    <ManageCategoriesDialog />
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div
                            className={cn(
                                "flex-1 cursor-pointer border rounded-md p-4 flex items-center justify-center gap-2 transition-colors",
                                type === "INCOME" ? "bg-green-100 border-green-500 text-green-700" : "hover:bg-accent"
                            )}
                            onClick={() => handleTypeChange("INCOME")}
                        >
                            <ArrowUpCircle className="h-5 w-5" />
                            <span className="font-medium">Pemasukan</span>
                        </div>
                        <div
                            className={cn(
                                "flex-1 cursor-pointer border rounded-md p-4 flex items-center justify-center gap-2 transition-colors",
                                type === "EXPENSE" ? "bg-red-100 border-red-500 text-red-700" : "hover:bg-accent"
                            )}
                            onClick={() => handleTypeChange("EXPENSE")}
                        >
                            <ArrowDownCircle className="h-5 w-5" />
                            <span className="font-medium">Pengeluaran</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Jumlah (Rp)</Label>
                        <MoneyInput
                            id="amount"
                            placeholder="0"
                            value={amount}
                            onValueChange={setAmount}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            {filteredCategories.length === 0 ? (
                                <option value="">Belum ada kategori</option>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Tanggal</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Catatan (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Keterangan tambahan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Transaksi"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
