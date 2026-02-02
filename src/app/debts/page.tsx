
import { getDebts, toggleDebtStatus, deleteDebt, getSummary } from "@/app/actions";
import { AddDebtForm } from "@/components/add-debt-form";
import { PayDebtDialog } from "@/components/pay-debt-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Wallet } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function DebtsPage() {
    const debts = await getDebts();
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
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Hutang</h1>
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
                    <AddDebtForm />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Hutang & Piutang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[500px] overflow-y-auto space-y-4">
                            {debts.length === 0 ? (
                                <p className="text-center text-muted-foreground">Tidak ada data.</p>
                            ) : (
                                debts.map((d) => (
                                    <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0" key={d.id}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${d.type === 'PAYABLE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {d.type === 'PAYABLE' ? 'HUTANG' : 'PIUTANG'}
                                                </span>
                                                {d.isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">LUNAS</span>}
                                            </div>
                                            <p className="font-medium">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Tempo: {d.dueDate ? format(new Date(d.dueDate), "dd MMM yyyy") : '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{formatIDR(d.amount)}</div>
                                            <div className="flex gap-1 flex-wrap justify-end">
                                                {!d.isPaid && d.type === 'PAYABLE' && (
                                                    <PayDebtDialog
                                                        debtId={d.id}
                                                        debtName={d.name}
                                                        debtAmount={d.amount}
                                                    />
                                                )}
                                                <form action={async () => {
                                                    "use server";
                                                    await toggleDebtStatus(d.id, d.isPaid);
                                                }}>
                                                    <Button variant="ghost" size="sm" className={d.isPaid ? "text-green-600" : "text-gray-400"}>
                                                        {d.isPaid ? "Sudah Lunas" : "Tandai Lunas"}
                                                    </Button>
                                                </form>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteDebt(d.id);
                                                }}>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>
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

