"use client";

import { useState, useTransition } from "react";
import { contributeToGoal } from "@/app/actions";
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
import { PlusCircle } from "lucide-react";

interface ContributeGoalDialogProps {
    goalId: number;
    goalName: string;
}

export function ContributeGoalDialog({ goalId, goalName }: ContributeGoalDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [amount, setAmount] = useState("");
    const [open, setOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount) return;

        startTransition(async () => {
            await contributeToGoal(goalId, parseFloat(amount));
            setAmount("");
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Tambah Dana
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Dana ke Impian</DialogTitle>
                    <DialogDescription>
                        Tambahkan kontribusi untuk mencapai {goalName}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="contribution-amount">Jumlah (Rp)</Label>
                            <Input
                                id="contribution-amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <strong>Catatan:</strong> Kontribusi ini akan mengurangi saldo bank Anda dan otomatis tercatat sebagai transaksi pengeluaran.
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
                            {isPending ? "Menyimpan..." : "Tambah Dana"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
