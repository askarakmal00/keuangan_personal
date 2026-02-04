
import { getTransactions, deleteTransaction, getSummary } from "@/app/actions";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { BulkUploadDialog } from "@/components/bulk-upload-dialog";
import { TransactionList } from "@/components/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Trash2, Wallet } from "lucide-react";

export const dynamic = 'force-dynamic'; // Disable static rendering

export default async function TransactionsPage() {
    const transactions = await getTransactions();
    const summary = await getSummary();

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
                <BulkUploadDialog />
            </div>

            {/* Balance Display */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sisa Saldo</p>
                            <p className="text-2xl font-bold">{formatIDR(summary.balance)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <AddTransactionForm />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[500px] overflow-y-auto">
                            <TransactionList transactions={transactions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

