"use client";

import { useState, useTransition } from "react";
import { withdrawFromGoal } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MinusCircle } from "lucide-react";

interface WithdrawGoalDialogProps {
    goalId: number;
    goalName: string;
    currentAmount: number;
}

export function WithdrawGoalDialog({ goalId, goalName, currentAmount }: WithdrawGoalDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [amount, setAmount] = useState("");
    const [open, setOpen] = useState(false);

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount) return;

        const withdrawAmount = parseFloat(amount);

        if (withdrawAmount <= 0 || withdrawAmount > currentAmount) {
            alert("Jumlah penarikan tidak valid. Harus lebih dari 0 dan tidak melebihi saldo impian.");
            return;
        }

        startTransition(async () => {
            try {
                await withdrawFromGoal(goalId, withdrawAmount);
                setAmount("");
                setOpen(false);
            } catch (error) {
                console.error("Error withdrawing from goal:", error);
                alert("Gagal menarik dana. Silakan coba lagi.");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-orange-600">
                    <MinusCircle className="h-4 w-4 mr-1" />
                    Tarik Saldo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tarik Dana dari Impian</DialogTitle>
                    <DialogDescription>
                        Tarik dana dari {goalName} kembali ke rekening bank Anda
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Saldo Impian Saat Ini:</span>
                                <span className="font-bold text-lg">{formatIDR(currentAmount)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="withdrawal-amount">Jumlah Penarikan (Rp)</Label>
                            <Input
                                id="withdrawal-amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                max={currentAmount}
                            />
                            <p className="text-xs text-muted-foreground">
                                Maksimal: {formatIDR(currentAmount)}
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                                <strong>Catatan:</strong> Dana yang ditarik akan ditambahkan ke saldo bank Anda dan tercatat sebagai transaksi pemasukan.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Memproses..." : "Tarik Dana"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
