"use client";

import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { updateTransaction, deleteTransaction, getCategories } from "@/app/actions";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";

interface Transaction {
    id: number;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string | null;
    date: Date;
}

interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string | null;
}

interface EditTransactionDialogProps {
    transaction: Transaction;
    isOpen: boolean;
    onClose: () => void;
}

export function EditTransactionDialog({ transaction, isOpen, onClose }: EditTransactionDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction.type);
    const [categories, setCategories] = useState<Category[]>([]);

    const [amount, setAmount] = useState(transaction.amount.toString());
    const [category, setCategory] = useState(transaction.category);
    const [description, setDescription] = useState(transaction.description || "");
    const [date, setDate] = useState(new Date(transaction.date).toISOString().split("T")[0]);

    useEffect(() => {
        if (isOpen) {
            // Reset form with transaction data
            setType(transaction.type);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setDescription(transaction.description || "");
            setDate(new Date(transaction.date).toISOString().split("T")[0]);
            loadCategories();
        }
    }, [isOpen, transaction]);

    useEffect(() => {
        loadCategories();
    }, [type]);

    async function loadCategories() {
        const cats = await getCategories(type);
        setCategories(cats as Category[]);
    }

    function handleTypeChange(newType: "INCOME" | "EXPENSE") {
        setType(newType);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount || !category) return;

        startTransition(async () => {
            await updateTransaction(transaction.id, {
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: new Date(date),
            });
            onClose();
        });
    }

    async function handleDelete() {
        if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

        startTransition(async () => {
            await deleteTransaction(transaction.id);
            onClose();
        });
    }

    const filteredCategories = categories.filter(cat => cat.type === type);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Transaksi</DialogTitle>
                    <DialogDescription>
                        Update data transaksi atau hapus transaksi
                    </DialogDescription>
                </DialogHeader>

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

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Update Transaksi"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
