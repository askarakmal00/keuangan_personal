"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTransactionsByCategory } from "@/app/actions";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pencil } from "lucide-react";

interface Transaction {
    id: number;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string | null;
    date: Date;
}

interface CategoryDetailDialogProps {
    category: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryDetailDialog({ category, isOpen, onClose }: CategoryDetailDialogProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && category) {
            loadTransactions();
        }
    }, [isOpen, category]);

    async function loadTransactions() {
        setIsLoading(true);
        const data = await getTransactionsByCategory(category);
        setTransactions(data as Transaction[]);
        setIsLoading(false);
    }

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    function handleEditClose() {
        setEditTransaction(null);
        loadTransactions(); // Reload data after edit
    }

    return (
        <>
            <Dialog open={isOpen && !editTransaction} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Transaksi: {category}</DialogTitle>
                        <DialogDescription>
                            Semua transaksi dalam kategori ini
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Belum ada transaksi dalam kategori ini
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-2">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {formatIDR(transaction.amount)}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${transaction.type === "INCOME"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {transaction.type}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {transaction.description || "-"}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(transaction.date), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditTransaction(transaction)}
                                                className="gap-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center font-bold">
                                    <span>Total:</span>
                                    <span className="text-lg">{formatIDR(total)}</span>
                                </div>
                                <div className="text-sm text-muted-foreground text-right mt-1">
                                    {transactions.length} transaksi
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {editTransaction && (
                <EditTransactionDialog
                    transaction={editTransaction}
                    isOpen={!!editTransaction}
                    onClose={handleEditClose}
                />
            )}
        </>
    );
}
