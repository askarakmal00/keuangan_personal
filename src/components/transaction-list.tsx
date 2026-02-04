"use client";

import { useState } from "react";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Pencil } from "lucide-react";

interface Transaction {
    id: number;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string | null;
    date: Date;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Belum ada transaksi. Tambahkan transaksi pertama Anda!
                    </div>
                ) : (
                    transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div
                                    className={`p-2 rounded-full ${transaction.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                                        }`}
                                >
                                    {transaction.type === "INCOME" ? (
                                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{transaction.category}</h3>
                                        <span
                                            className={`text-sm font-medium ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {formatIDR(transaction.amount)}
                                        </span>
                                    </div>
                                    {transaction.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(transaction.date), "dd MMM yyyy")}
                                    </p>
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
                    ))
                )}
            </div>

            {editTransaction && (
                <EditTransactionDialog
                    transaction={editTransaction}
                    isOpen={!!editTransaction}
                    onClose={() => setEditTransaction(null)}
                />
            )}
        </>
    );
}
