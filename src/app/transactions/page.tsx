
import { getTransactions, deleteTransaction, getSummary } from "@/app/actions";
import { AddTransactionForm } from "@/components/add-transaction-form";
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
                        <div className="max-h-[500px] overflow-y-auto space-y-4">
                            {transactions.length === 0 ? (
                                <p className="text-center text-muted-foreground">Belum ada transaksi.</p>
                            ) : (
                                transactions.map((t) => (
                                    <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0" key={t.id}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${t.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {t.type === 'INCOME' ? <ArrowUpCircle className="h-4 w-4 text-green-600" /> : <ArrowDownCircle className="h-4 w-4 text-red-600" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{t.description || t.category}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.category} • {t.date ? format(new Date(t.date), "dd MMM yyyy") : 'No Date'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'INCOME' ? "+" : "-"}{formatIDR(t.amount)}
                                            </div>
                                            <form action={async () => {
                                                "use server";
                                                await deleteTransaction(t.id);
                                            }}>
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

