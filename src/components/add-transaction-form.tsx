
"use client";

import { useTransition, useState } from "react";
import { addTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const INCOME_CATEGORIES = [
    "Gaji",
    "Bonus",
    "Tunjangan",
    "Penyesuaian Nilai",
    "Dividen",
    "Hadiah",
    "Penjualan",
    "Lainnya"
];

const EXPENSE_CATEGORIES = [
    "Makanan",
    "Kebutuhan Harian",
    "Transportasi",
    "Services Mobil",
    "Listrik",
    "Air",
    "Internet",
    "Subscription",
    "Kesehatan",
    "Kopi",
    "Rokok",
    "Hadiah",
    "Tarik Tunai",
    "Nafkah",
    "Pendidikan",
    "Cicilan",
    "Hiburan",
    "Penyesuaian",
    "Lainnya"
];

export function AddTransactionForm() {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

    // Simple form state
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    function handleTypeChange(newType: "INCOME" | "EXPENSE") {
        setType(newType);
        setCategory(newType === "INCOME" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tambah Transaksi Baru</CardTitle>
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
                        >
                            {(type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
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
