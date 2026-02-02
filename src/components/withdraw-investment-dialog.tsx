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
import { withdrawFromInvestment } from "@/app/actions";
import { Banknote } from "lucide-react";

interface WithdrawInvestmentDialogProps {
    investmentId: number;
    investmentName: string;
    initialAmount: number;
    currentValue: number;
}

export function WithdrawInvestmentDialog({
    investmentId,
    investmentName,
    initialAmount,
    currentValue
}: WithdrawInvestmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const profit = currentValue - initialAmount;
    const isProfit = profit >= 0;
    const percentage = ((profit / initialAmount) * 100).toFixed(2);

    const handleWithdraw = async () => {
        setIsLoading(true);
        try {
            await withdrawFromInvestment(investmentId);
            setOpen(false);
        } catch (error) {
            console.error("Error withdrawing investment:", error);
            alert("Gagal menarik investasi. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <Banknote className="h-4 w-4 mr-1" />
                    Cairkan
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cairkan Investasi</DialogTitle>
                    <DialogDescription>
                        Cairkan investasi dan tambahkan dana ke rekening bank Anda
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Nama Investasi:</span>
                            <span className="font-medium">{investmentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Modal Awal:</span>
                            <span className="font-medium">{formatIDR(initialAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Nilai Saat Ini:</span>
                            <span className="font-bold text-lg">{formatIDR(currentValue)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Profit/Loss:</span>
                            <div className="text-right">
                                <span className={`font-bold text-lg ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {isProfit ? '+' : ''}{formatIDR(profit)}
                                </span>
                                <span className={`block text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    ({isProfit ? '+' : ''}{percentage}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    {isProfit ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                                <strong>Selamat! 🎉</strong> Anda mendapatkan profit {formatIDR(profit)} dari investasi ini.
                            </p>
                        </div>
                    ) : profit < 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                                <strong>Perhatian!</strong> Investasi ini mengalami kerugian {formatIDR(Math.abs(profit))}.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-800">
                                <strong>Break Even:</strong> Nilai investasi sama dengan modal awal.
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Catatan:</strong> Dana sebesar {formatIDR(currentValue)} akan ditambahkan ke saldo bank Anda dan investasi ini akan dihapus dari portofolio.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handleWithdraw} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                        {isLoading ? "Memproses..." : "Konfirmasi Pencairan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
