"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { payDebtFromAccount } from "@/app/actions";
import { CreditCard } from "lucide-react";

interface PayDebtDialogProps {
    debtId: number;
    debtName: string;
    debtAmount: number;
}

export function PayDebtDialog({ debtId, debtName, debtAmount }: PayDebtDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(debtAmount.toString());

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayFromAccount = async () => {
        const amount = parseInt(paymentAmount) || 0;

        if (amount <= 0 || amount > debtAmount) {
            alert("Jumlah pembayaran tidak valid. Harus lebih dari 0 dan tidak melebihi total hutang.");
            return;
        }

        setIsLoading(true);
        try {
            await payDebtFromAccount(debtId, amount);
            setOpen(false);
            setPaymentAmount(debtAmount.toString()); // Reset for next time
        } catch (error) {
            console.error("Error paying debt:", error);
            alert("Gagal membayar hutang. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const amount = parseInt(paymentAmount) || 0;
    const remainingDebt = debtAmount - amount;
    const isFullPayment = amount === debtAmount;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Bayar dari Rekening
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bayar Hutang dari Rekening</DialogTitle>
                    <DialogDescription>
                        Anda akan membayar hutang dan transaksi pengeluaran akan otomatis tercatat.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Nama:</span>
                            <span className="font-medium">{debtName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Hutang:</span>
                            <span className="font-bold text-lg">{formatIDR(debtAmount)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Jumlah Pembayaran</Label>
                        <MoneyInput
                            id="payment-amount"
                            value={paymentAmount}
                            onValueChange={setPaymentAmount}
                            placeholder="Masukkan jumlah pembayaran"
                        />
                        <p className="text-xs text-muted-foreground">
                            Masukkan jumlah yang ingin dibayar (maksimal {formatIDR(debtAmount)})
                        </p>
                    </div>

                    {!isFullPayment && remainingDebt > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                <strong>Sisa Hutang:</strong> {formatIDR(remainingDebt)} akan tetap aktif setelah pembayaran.
                            </p>
                        </div>
                    )}

                    {isFullPayment && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                                <strong>Pembayaran Lunas:</strong> Hutang akan ditandai sebagai lunas.
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Catatan:</strong> Pembayaran {formatIDR(amount)} akan mengurangi saldo Anda dan mencatat transaksi pengeluaran otomatis.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handlePayFromAccount} disabled={isLoading || amount <= 0 || amount > debtAmount}>
                        {isLoading ? "Memproses..." : "Konfirmasi Pembayaran"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
